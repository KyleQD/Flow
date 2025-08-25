import { NextRequest, NextResponse } from 'next/server'

async function resolveEventId(param: string, supabase: any) {
  if (/^[0-9a-fA-F-]{36}$/.test(param)) return param
  const { data } = await supabase.from('events').select('id').eq('slug', param).single()
  return data?.id || null
}

export async function GET(_req: NextRequest, { params }: any) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const eventId = await resolveEventId(params.id, supabase)
    if (!eventId) return NextResponse.json({ posts: [] })

    // Reuse main posts table with route_context to scope to event
    const { data, error } = await supabase
      .from('posts')
      .select('id, user_id, content, type, visibility, media_urls, created_at, profiles:user_id(id, username, full_name, avatar_url, is_verified)')
      .eq('route_context', `event:${eventId}`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ posts: [] })

    const posts = (data || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      content: p.content,
      type: p.type,
      visibility: p.visibility,
      media_urls: p.media_urls || [],
      created_at: p.created_at,
      profiles: p.profiles
    }))

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('[Event Posts API] Error:', error)
    return NextResponse.json({ posts: [] })
  }
}

export async function POST(request: NextRequest, { params }: any) {
  try {
    const { authenticateApiRequest } = await import('@/lib/auth/api-auth')
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { supabase, user } = auth
    const body = await request.json()
    if (!body?.content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    const eventId = await resolveEventId(params.id, supabase)
    if (!eventId) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const insert = {
      user_id: user.id,
      content: body.content.trim(),
      type: body.type || 'text',
      visibility: body.visibility || 'attendees',
      media_urls: body.media_urls || [],
      route_context: `event:${eventId}`
    }

    const { data, error } = await supabase.from('posts').insert([insert]).select().single()
    if (error) return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Event Posts API] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


