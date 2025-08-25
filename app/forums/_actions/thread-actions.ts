'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createRateLimiter } from '@/lib/utils/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const action = createSafeActionClient()

// ========================================
// SCHEMAS
// ========================================

const createThreadSchema = z.object({
  forumId: z.string().uuid(),
  title: z.string().min(3).max(180),
  kind: z.enum(['text','link','media','crosspost']),
  contentMd: z.string().max(20000).optional(),
  linkUrl: z.string().url().optional(),
  contentRefId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).max(5).optional()
})

const voteSchema = z.object({
  targetKind: z.enum(['thread', 'post']),
  targetId: z.string().uuid(),
  kind: z.enum(['up', 'down'])
})

const subscribeSchema = z.object({
  forumId: z.string().uuid().optional(),
  threadId: z.string().uuid().optional()
}).refine(data => (data.forumId || data.threadId) && !(data.forumId && data.threadId), {
  message: "Must provide either forumId or threadId, but not both"
})

const reportSchema = z.object({
  targetKind: z.enum(['thread', 'post']),
  targetId: z.string().uuid(),
  reason: z.string().min(1).max(100),
  description: z.string().max(1000).optional()
})

// ========================================
// THREAD ACTIONS
// ========================================

export const createThreadAction = action.schema(createThreadSchema).action(async ({ parsedInput }) => {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      return { ok: false, error: 'not_authenticated' }
    }

    // Rate limit: 5 threads/min per user
    const rl = createRateLimiter({ namespace: 'thread:create', limit: 5, windowSec: 60 })
    const res = await rl.check(`u:${user.user.id}`)
    if (!res.success) return { ok: false, error: 'rate_limited' }

    // Validate content based on kind
    if (parsedInput.kind === 'text' && !parsedInput.contentMd?.trim()) {
      return { ok: false, error: 'empty_body' }
    }
    
    if ((parsedInput.kind === 'link' || parsedInput.kind === 'media') && !parsedInput.linkUrl) {
      return { ok: false, error: 'missing_link' }
    }

    if (parsedInput.kind === 'crosspost' && !parsedInput.contentRefId) {
      return { ok: false, error: 'missing_content_ref' }
    }

    // Check if forum exists and user can post
    const { data: forum } = await supabase
      .from('forums_v2')
      .select('id, kind')
      .eq('id', parsedInput.forumId)
      .single()

    if (!forum) {
      return { ok: false, error: 'forum_not_found' }
    }

    // Create thread
    const { data: thread, error } = await supabase
      .from('forum_threads_v2')
      .insert({
        forum_id: parsedInput.forumId,
        title: parsedInput.title,
        kind: parsedInput.kind,
        content_md: parsedInput.contentMd,
        link_url: parsedInput.linkUrl,
        content_ref_id: parsedInput.contentRefId,
        created_by: user.user.id
      })
      .select('id')
      .single()

    if (error) {
      console.error('Thread creation error:', error)
      return { ok: false, error: 'db_insert_failed' }
    }

    // Add tags if provided
    if (parsedInput.tagIds?.length) {
      const tagRows = parsedInput.tagIds.map(tagId => ({ 
        thread_id: thread.id, 
        tag_id: tagId 
      }))
      
      await supabase
        .from('forum_thread_tags')
        .insert(tagRows)
    }

    // Auto-subscribe user to their thread
    await supabase
      .from('forum_subscriptions_v2')
      .upsert({
        user_id: user.user.id,
        thread_id: thread.id
      }, { onConflict: 'user_id,thread_id' })

    revalidatePath('/forums')
    revalidatePath(`/forums/${forum.id}`)
    
    return { ok: true, threadId: thread.id }
  } catch (error) {
    console.error('Create thread action error:', error)
    return { ok: false, error: 'unexpected_error' }
  }
})

export const updateThreadAction = action.schema(
  z.object({
    threadId: z.string().uuid(),
    title: z.string().min(3).max(180).optional(),
    contentMd: z.string().max(20000).optional(),
    linkUrl: z.string().url().optional(),
    isPinned: z.boolean().optional(),
    isLocked: z.boolean().optional()
  }))
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createClient()
      const { data: user } = await supabase.auth.getUser()
      
      if (!user?.user) {
        return { ok: false, error: 'not_authenticated' }
      }

      const { error } = await supabase
        .from('forum_threads_v2')
        .update({
          ...(parsedInput.title && { title: parsedInput.title }),
          ...(parsedInput.contentMd !== undefined && { content_md: parsedInput.contentMd }),
          ...(parsedInput.linkUrl !== undefined && { link_url: parsedInput.linkUrl }),
          ...(parsedInput.isPinned !== undefined && { is_pinned: parsedInput.isPinned }),
          ...(parsedInput.isLocked !== undefined && { is_locked: parsedInput.isLocked }),
          updated_at: new Date().toISOString()
        })
        .eq('id', parsedInput.threadId)

      if (error) {
        console.error('Thread update error:', error)
        return { ok: false, error: 'update_failed' }
      }

      revalidatePath(`/forums/t/${parsedInput.threadId}`)
      return { ok: true }
    } catch (error) {
      console.error('Update thread action error:', error)
      return { ok: false, error: 'unexpected_error' }
    }
  })

// ========================================
// VOTING ACTIONS
// ========================================

export const voteAction = action.schema(voteSchema).action(async ({ parsedInput }) => {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      return { ok: false, error: 'not_authenticated' }
    }

    // Rate limit votes to prevent abuse: 60/min
    const rl = createRateLimiter({ namespace: 'vote', limit: 60, windowSec: 60 })
    const res = await rl.check(`u:${user.user.id}`)
    if (!res.success) return { ok: false, error: 'rate_limited' }

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('forum_votes_v2')
      .select('id, kind')
      .eq('user_id', user.user.id)
      .eq('target_kind', parsedInput.targetKind)
      .eq('target_id', parsedInput.targetId)
      .single()

    if (existingVote) {
      if (existingVote.kind === parsedInput.kind) {
        // Remove vote (toggle off)
        const { error } = await supabase
          .from('forum_votes_v2')
          .delete()
          .eq('id', existingVote.id)

        if (error) {
          return { ok: false, error: 'vote_removal_failed' }
        }

        return { ok: true, action: 'removed' }
      } else {
        // Change vote
        const { error } = await supabase
          .from('forum_votes_v2')
          .update({ kind: parsedInput.kind })
          .eq('id', existingVote.id)

        if (error) {
          return { ok: false, error: 'vote_update_failed' }
        }

        return { ok: true, action: 'changed' }
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from('forum_votes_v2')
        .insert({
          user_id: user.user.id,
          target_kind: parsedInput.targetKind,
          target_id: parsedInput.targetId,
          kind: parsedInput.kind
        })

      if (error) {
        return { ok: false, error: 'vote_creation_failed' }
      }

      return { ok: true, action: 'created' }
    }
  } catch (error) {
    console.error('Vote action error:', error)
    return { ok: false, error: 'unexpected_error' }
  }
})

// ========================================
// SUBSCRIPTION ACTIONS  
// ========================================

export const subscribeAction = action.schema(subscribeSchema).action(async ({ parsedInput }) => {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      return { ok: false, error: 'not_authenticated' }
    }

    const rl = createRateLimiter({ namespace: 'subscribe', limit: 30, windowSec: 60 })
    const res = await rl.check(`u:${user.user.id}`)
    if (!res.success) return { ok: false, error: 'rate_limited' }

    const { data: existing } = await supabase
      .from('forum_subscriptions_v2')
      .select('user_id')
      .eq('user_id', user.user.id)
      .eq(parsedInput.forumId ? 'forum_id' : 'thread_id', parsedInput.forumId || parsedInput.threadId!)
      .single()

    if (existing) {
      // Unsubscribe
      const { error } = await supabase
        .from('forum_subscriptions_v2')
        .delete()
        .eq('user_id', user.user.id)
        .eq(parsedInput.forumId ? 'forum_id' : 'thread_id', parsedInput.forumId || parsedInput.threadId!)

      if (error) {
        return { ok: false, error: 'unsubscribe_failed' }
      }

      return { ok: true, subscribed: false }
    } else {
      // Subscribe
      const { error } = await supabase
        .from('forum_subscriptions_v2')
        .insert({
          user_id: user.user.id,
          forum_id: parsedInput.forumId || null,
          thread_id: parsedInput.threadId || null
        })

      if (error) {
        return { ok: false, error: 'subscribe_failed' }
      }

      return { ok: true, subscribed: true }
    }
  } catch (error) {
    console.error('Subscribe action error:', error)
    return { ok: false, error: 'unexpected_error' }
  }
})

// ========================================
// REPORTING ACTIONS
// ========================================

export const reportAction = action.schema(reportSchema).action(async ({ parsedInput }) => {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      return { ok: false, error: 'not_authenticated' }
    }

    // Check if user already reported this content
    const { data: existing } = await supabase
      .from('forum_reports')
      .select('id')
      .eq('reporter_id', user.user.id)
      .eq('target_kind', parsedInput.targetKind)
      .eq('target_id', parsedInput.targetId)
      .single()

    if (existing) {
      return { ok: false, error: 'already_reported' }
    }

    const { error } = await supabase
      .from('forum_reports')
      .insert({
        reporter_id: user.user.id,
        target_kind: parsedInput.targetKind,
        target_id: parsedInput.targetId,
        reason: parsedInput.reason,
        description: parsedInput.description
      })

    if (error) {
      console.error('Report creation error:', error)
      return { ok: false, error: 'report_failed' }
    }

    return { ok: true }
  } catch (error) {
    console.error('Report action error:', error)
    return { ok: false, error: 'unexpected_error' }
  }
})
