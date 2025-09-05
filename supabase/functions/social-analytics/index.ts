// deno-lint-ignore-file no-explicit-any
import { createClient } from "jsr:@supabase/supabase-js@2"

type Platform = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'twitter'

function getEnv(name: string): string {
  const v = Deno.env.get(name)
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

function getSupabaseFromAuthHeader(req: Request) {
  const supabaseUrl = getEnv('SUPABASE_URL')
  const anonKey = getEnv('SUPABASE_ANON_KEY')
  const jwt = req.headers.get('authorization')?.replace('Bearer ', '') || ''
  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } })
  return client
}

async function fetchAnalytics(platform: Platform, accessToken: string) {
  try {
    if (platform === 'instagram') {
      const res = await fetch(`https://graph.facebook.com/v19.0/me/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`)
      return await res.json()
    }
    if (platform === 'facebook') {
      const res = await fetch(`https://graph.facebook.com/v19.0/me/insights?metric=page_impressions,page_engaged_users&period=day&access_token=${accessToken}`)
      return await res.json()
    }
    if (platform === 'youtube') {
      // Placeholder: requires YouTube Analytics API
      return { views: 0, subscribers: 0 }
    }
    if (platform === 'tiktok') {
      // Placeholder: TikTok Business API analytics endpoint
      return { views: 0, followers: 0 }
    }
    if (platform === 'twitter') {
      return { impressions: 0, profile_visits: 0 }
    }
  } catch (e) {
    return { error: String(e) }
  }
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const supabase = getSupabaseFromAuthHeader(req)
  const auth = await supabase.auth.getUser()
  const body = await req.json().catch(() => ({})) as { userId?: string; runAll?: boolean }

  // Secure cron execution path using a shared secret
  const cronSecretHeader = req.headers.get('x-cron-secret') || ''
  const cronSecretEnv = Deno.env.get('CRON_SECRET') || ''
  const isCron = Boolean(cronSecretHeader && cronSecretEnv && cronSecretHeader === cronSecretEnv)

  // If runAll is requested, require cron secret
  if (body.runAll) {
    if (!isCron) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

    // Fetch all connected integrations grouped by user
    const { data, error } = await supabase
      .from('artist_social_integrations')
      .select('*')
      .eq('is_connected', true)
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

    const byUser: Record<string, any[]> = {}
    for (const row of data || []) {
      const uid = row.user_id as string
      if (!byUser[uid]) byUser[uid] = []
      byUser[uid].push(row)
    }

    for (const [uid, rows] of Object.entries(byUser)) {
      let totalFollowers = 0
      for (const row of rows) {
        if (!row.access_token) continue
        const analytics = await fetchAnalytics(row.platform as Platform, row.access_token as string)
        await supabase
          .from('artist_social_integrations')
          .update({ analytics, last_sync: new Date().toISOString() })
          .eq('id', row.id)
        try {
          const a: any = analytics
          if (row.platform === 'instagram') totalFollowers += a?.data?.[0]?.values?.[0]?.value || 0
          if (row.platform === 'facebook') totalFollowers += a?.data?.[0]?.values?.[0]?.value || 0
          if (row.platform === 'youtube') totalFollowers += a?.subscribers || 0
          if (row.platform === 'twitter') totalFollowers += a?.followers || 0
          if (row.platform === 'tiktok') totalFollowers += a?.followers || 0
        } catch (_) {}
      }
      await supabase
        .from('profiles')
        .update({ social_followers: totalFollowers })
        .eq('id', uid)
    }

    return new Response(JSON.stringify({ success: true, mode: 'cron' }), { headers: { 'content-type': 'application/json' } })
  }

  // Single-user path: requires authenticated user or explicit userId with cron secret
  const executingUserId = body.userId || auth.data.user?.id || ''
  if (!executingUserId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  if (body.userId && !isCron) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })

  const { data, error } = await supabase
    .from('artist_social_integrations')
    .select('*')
    .eq('user_id', executingUserId)
    .eq('is_connected', true)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  let totalFollowers = 0
  for (const row of data || []) {
    if (!row.access_token) continue
    const analytics = await fetchAnalytics(row.platform as Platform, row.access_token as string)
    await supabase
      .from('artist_social_integrations')
      .update({ analytics, last_sync: new Date().toISOString() })
      .eq('id', row.id)
    try {
      const a: any = analytics
      if (row.platform === 'instagram') totalFollowers += a?.data?.[0]?.values?.[0]?.value || 0
      if (row.platform === 'facebook') totalFollowers += a?.data?.[0]?.values?.[0]?.value || 0
      if (row.platform === 'youtube') totalFollowers += a?.subscribers || 0
      if (row.platform === 'twitter') totalFollowers += a?.followers || 0
      if (row.platform === 'tiktok') totalFollowers += a?.followers || 0
    } catch (_) {}
  }
  await supabase
    .from('profiles')
    .update({ social_followers: totalFollowers })
    .eq('id', executingUserId)

  return new Response(JSON.stringify({ success: true, mode: 'single' }), { headers: { 'content-type': 'application/json' } })
}

Deno.serve(handler)


