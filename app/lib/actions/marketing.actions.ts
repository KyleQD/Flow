"use server"

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'

const action = createSafeActionClient()

export const upsertCampaignAction = action(z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  type: z.enum(['song_release','album_release','tour_promotion','brand_awareness','engagement','custom']),
  status: z.enum(['draft','active','paused','completed','cancelled']).default('draft'),
  budget: z.number().min(0).default(0),
  spent: z.number().min(0).default(0),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  platforms: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  content_types: z.array(z.string()).default([]),
  description: z.string().optional(),
  metrics: z.any().optional(),
}), async (input) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  if (input.id) {
    const { id, ...update } = input
    const { error, data } = await supabase
      .from('artist_marketing_campaigns')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  }

  const { error, data } = await supabase
    .from('artist_marketing_campaigns')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, data }
})

export const createSocialPostAction = action(z.object({
  platform: z.enum(['instagram','facebook','twitter','youtube','tiktok']),
  content: z.string().min(1),
  media_type: z.enum(['text','image','video','audio']),
  media_url: z.string().url().optional(),
  scheduled_for: z.string(),
  status: z.enum(['draft','scheduled','published','failed']).default('draft'),
  campaign_id: z.string().uuid().optional(),
  hashtags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
}), async (input) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error, data } = await supabase
    .from('artist_social_posts')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, data }
})

export const updateSocialPostAction = action(z.object({
  id: z.string().uuid(),
  platform: z.enum(['instagram','facebook','twitter','youtube','tiktok']).optional(),
  content: z.string().optional(),
  media_type: z.enum(['text','image','video','audio']).optional(),
  media_url: z.string().url().optional(),
  scheduled_for: z.string().optional(),
  status: z.enum(['draft','scheduled','published','failed']).optional(),
  campaign_id: z.string().uuid().optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
}), async (input) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { id, ...update } = input
  const { error, data } = await supabase
    .from('artist_social_posts')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, data }
})

export const deleteSocialPostAction = action(z.object({ id: z.string().uuid() }), async ({ id }) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('artist_social_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  return { success: true }
})

export const deleteCampaignAction = action(z.object({ id: z.string().uuid() }), async ({ id }) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Optional: cascade delete posts for this campaign
  await supabase
    .from('artist_social_posts')
    .delete()
    .eq('campaign_id', id)
    .eq('user_id', user.id)

  const { error } = await supabase
    .from('artist_marketing_campaigns')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  return { success: true }
})

export const toggleCampaignPauseAction = action(z.object({ id: z.string().uuid(), pause: z.boolean() }), async ({ id, pause }) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const status = pause ? 'paused' : 'active'
  const { error, data } = await supabase
    .from('artist_marketing_campaigns')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, data }
})


