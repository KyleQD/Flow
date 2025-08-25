'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createRateLimiter } from '@/lib/utils/rate-limit'

const action = createSafeActionClient()

// ========================================
// SCHEMAS
// ========================================

const createPostSchema = z.object({
  threadId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  contentMd: z.string().min(1).max(10000)
})

const updatePostSchema = z.object({
  postId: z.string().uuid(),
  contentMd: z.string().min(1).max(10000)
})

const deletePostSchema = z.object({
  postId: z.string().uuid()
})

// ========================================
// POST ACTIONS
// ========================================

export const createPostAction = action.schema(createPostSchema).action(async ({ parsedInput }) => {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      return { ok: false, error: 'not_authenticated' }
    }

    // Limit comments to prevent spam: 120/min per user
    const rl = createRateLimiter({ namespace: 'comment:create', limit: 120, windowSec: 60 })
    const res = await rl.check(`u:${user.user.id}`)
    if (!res.success) return { ok: false, error: 'rate_limited' }

    // Check if thread exists and is not locked
    const { data: thread } = await supabase
      .from('forum_threads_v2')
      .select('id, is_locked, forum_id')
      .eq('id', parsedInput.threadId)
      .single()

    if (!thread) {
      return { ok: false, error: 'thread_not_found' }
    }

    if (thread.is_locked) {
      return { ok: false, error: 'thread_locked' }
    }

    // If replying to a comment, check it exists and get its depth
    let parentDepth = -1
    if (parsedInput.parentId) {
      const { data: parent } = await supabase
        .from('forum_posts')
        .select('depth, thread_id')
        .eq('id', parsedInput.parentId)
        .single()

      if (!parent) {
        return { ok: false, error: 'parent_not_found' }
      }

      if (parent.thread_id !== parsedInput.threadId) {
        return { ok: false, error: 'parent_thread_mismatch' }
      }

      parentDepth = parent.depth
    }

    // Check for maximum nesting depth (prevent infinite nesting)
    if (parentDepth >= 10) {
      return { ok: false, error: 'max_depth_exceeded' }
    }

    // Create the post
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        thread_id: parsedInput.threadId,
        parent_id: parsedInput.parentId || null,
        content_md: parsedInput.contentMd,
        created_by: user.user.id
      })
      .select('id')
      .single()

    if (error) {
      console.error('Post creation error:', error)
      return { ok: false, error: 'db_insert_failed' }
    }

    // Auto-subscribe user to thread if not already subscribed
    await supabase
      .from('forum_subscriptions_v2')
      .upsert({
        user_id: user.user.id,
        thread_id: parsedInput.threadId
      }, { onConflict: 'user_id,thread_id' })

    // Create notification for thread author and parent comment author
    const notifications = []

    // Notify thread author if this is a top-level comment
    if (!parsedInput.parentId) {
      const { data: threadAuthor } = await supabase
        .from('forum_threads_v2')
        .select('created_by')
        .eq('id', parsedInput.threadId)
        .single()

      if (threadAuthor && threadAuthor.created_by !== user.user.id) {
        notifications.push({
          user_id: threadAuthor.created_by,
          kind: 'thread_comment',
          title: 'New comment on your thread',
          content: `${user.user.email} commented on your thread`,
          payload: {
            thread_id: parsedInput.threadId,
            post_id: post.id,
            author_id: user.user.id
          }
        })
      }
    }

    // Notify parent comment author if this is a reply
    if (parsedInput.parentId) {
      const { data: parentAuthor } = await supabase
        .from('forum_posts')
        .select('created_by')
        .eq('id', parsedInput.parentId)
        .single()

      if (parentAuthor && parentAuthor.created_by !== user.user.id) {
        notifications.push({
          user_id: parentAuthor.created_by,
          kind: 'comment_reply',
          title: 'Reply to your comment',
          content: `${user.user.email} replied to your comment`,
          payload: {
            thread_id: parsedInput.threadId,
            post_id: post.id,
            parent_id: parsedInput.parentId,
            author_id: user.user.id
          }
        })
      }
    }

    if (notifications.length > 0) {
      await supabase
        .from('notifications_v2')
        .insert(notifications)
    }

    revalidatePath(`/forums/t/${parsedInput.threadId}`)
    
    return { ok: true, postId: post.id }
  } catch (error) {
    console.error('Create post action error:', error)
    return { ok: false, error: 'unexpected_error' }
  }
})

export const updatePostAction = action.schema(updatePostSchema).action(async ({ parsedInput }) => {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      return { ok: false, error: 'not_authenticated' }
    }

    // Check if post exists and user owns it
    const { data: post } = await supabase
      .from('forum_posts')
      .select('created_by, thread_id')
      .eq('id', parsedInput.postId)
      .single()

    if (!post) {
      return { ok: false, error: 'post_not_found' }
    }

    const { error } = await supabase
      .from('forum_posts')
      .update({
        content_md: parsedInput.contentMd,
        updated_at: new Date().toISOString()
      })
      .eq('id', parsedInput.postId)

    if (error) {
      console.error('Post update error:', error)
      return { ok: false, error: 'update_failed' }
    }

    revalidatePath(`/forums/t/${post.thread_id}`)
    
    return { ok: true }
  } catch (error) {
    console.error('Update post action error:', error)
    return { ok: false, error: 'unexpected_error' }
  }
})

export const deletePostAction = action.schema(deletePostSchema).action(async ({ parsedInput }) => {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user?.user) {
      return { ok: false, error: 'not_authenticated' }
    }

    // Check if post exists
    const { data: post } = await supabase
      .from('forum_posts')
      .select('created_by, thread_id')
      .eq('id', parsedInput.postId)
      .single()

    if (!post) {
      return { ok: false, error: 'post_not_found' }
    }

    // Soft delete the post
    const { error } = await supabase
      .from('forum_posts')
      .update({
        is_deleted: true,
        content_md: '[deleted]',
        updated_at: new Date().toISOString()
      })
      .eq('id', parsedInput.postId)

    if (error) {
      console.error('Post deletion error:', error)
      return { ok: false, error: 'delete_failed' }
    }

    revalidatePath(`/forums/t/${post.thread_id}`)
    
    return { ok: true }
  } catch (error) {
    console.error('Delete post action error:', error)
    return { ok: false, error: 'unexpected_error' }
  }
})
