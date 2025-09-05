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

async function postToPlatform(platform: Platform, accessToken: string, content: string, mediaUrls: string[]) {
  // NOTE: Real implementations require app review and upload endpoints
  if (platform === 'facebook') {
    // Example: Publish text post to user's feed (if permissions allow)
    const res = await fetch(`https://graph.facebook.com/v19.0/me/feed?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ message: content })
    })
    return await res.json()
  }
  if (platform === 'instagram') {
    // Instagram Graph publishing flow (image):
    // 1. Create media container
    // 2. Publish container to user business account
    // This requires the IG Business/Creator account ID; for demo, use 'me' connection.
    const imageUrl = mediaUrls[0]
    if (!imageUrl) return { error: 'missing_media' }
    // Step 1: create container
    const containerRes = await fetch(`https://graph.facebook.com/v19.0/me/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(content)}&access_token=${accessToken}`, { method: 'POST' })
    const container = await containerRes.json()
    if (!containerRes.ok) return { error: 'container_error', details: container }
    // Step 2: publish
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/me/media_publish?creation_id=${encodeURIComponent(container.id)}&access_token=${accessToken}`, { method: 'POST' })
    const publish = await publishRes.json()
    if (!publishRes.ok) return { error: 'publish_error', details: publish }
    return { id: publish.id, status: 'published' }
  }
  if (platform === 'youtube') {
    // Minimal resumable upload stub for YouTube (metadata only, video upload skipped for brevity)
    // In production: perform resumable upload to https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable
    // Step 1: initiate session with metadata
    const initiate = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${accessToken}`,
        'content-type': 'application/json; charset=UTF-8',
        'x-upload-content-type': 'video/*'
      },
      body: JSON.stringify({
        snippet: { title: content.slice(0, 90) || 'Upload', description: content },
        status: { privacyStatus: 'public' }
      })
    })
    if (!initiate.ok) return { error: 'youtube_initiate_failed', details: await initiate.text() }
    const uploadUrl = initiate.headers.get('location') || ''
    // Step 2: for now, return the upload URL for a client/worker to PUT the bytes
    return { status: 'initiated', uploadUrl }
  }
  if (platform === 'tiktok') {
    // Placeholder: TikTok upload flow requires init/upload/publish with Business API
    // Step 1: init
    // const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/initialize/', {...})
    return { status: 'queued' }
  }
  if (platform === 'twitter') {
    return { status: 'queued' }
  }
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const supabase = getSupabaseFromAuthHeader(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const body = await req.json() as { content: string; mediaUrls?: string[]; targets?: Platform[]; overrides?: Record<string, { content?: string }>, scheduledPostId?: string, dryRun?: boolean }
  const { content, mediaUrls = [], targets = ['facebook','instagram','youtube','tiktok','twitter'], overrides = {}, scheduledPostId, dryRun = false } = body

  const { data, error } = await supabase
    .from('artist_social_integrations')
    .select('*')
    .eq('user_id', user.id)
    .in('platform', targets)
    .eq('is_connected', true)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const results: Record<string, any> = {}
  for (const row of data || []) {
    if (!row.access_token) continue
    const platform = row.platform as Platform
    const platformContent = overrides[platform]?.content || content
    if (scheduledPostId) {
      const current = await supabase.from('scheduled_posts').select('platform_status').eq('id', scheduledPostId).single()
      const ps = { ...(current.data?.platform_status || {}) }
      ps[platform] = 'posting'
      await supabase.from('scheduled_posts').update({ platform_status: ps }).eq('id', scheduledPostId)
    }
    const res = dryRun
      ? { status: 'dry_run', platform, content: platformContent.slice(0, 40), hasMedia: mediaUrls.length > 0 }
      : await postToPlatform(platform, row.access_token as string, platformContent, mediaUrls)
    results[platform as string] = res
    if (scheduledPostId) {
      const current = await supabase.from('scheduled_posts').select('platform_status, platform_errors').eq('id', scheduledPostId).single()
      const status = dryRun ? 'completed' : ((res && (res as any).error) ? 'failed' : 'completed')
      const ps = { ...(current.data?.platform_status || {}) }
      ps[platform] = status
      const pe = { ...(current.data?.platform_errors || {}) }
      if (!dryRun && (res as any)?.error) pe[platform] = (res as any).error
      await supabase.from('scheduled_posts').update({ platform_status: ps, platform_errors: pe }).eq('id', scheduledPostId)
    }
  }

  return new Response(JSON.stringify({ success: true, results }), { headers: { 'content-type': 'application/json' } })
}

Deno.serve(handler)


