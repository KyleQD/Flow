import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, withAuth } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest, context: { params: { slug: string } }) {
  try {
    const auth = await authenticateApiRequest(request)
    let supabase
    if (auth) supabase = auth.supabase
    else {
      const { createClient } = await import('@/lib/supabase/server')
      supabase = await createClient()
    }

    const slug = context?.params?.slug
    if (!slug) return NextResponse.json({ error: 'Missing forum slug' }, { status: 400 })

    const { data: forum } = await supabase
      .from('forums')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!forum) return NextResponse.json({ error: 'Forum not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    const sort = searchParams.get('sort') || 'hot' // hot | new | top

    let query = supabase
      .from('forum_threads')
      .select('id, title, body, media_urls, url, score, comments_count, created_at, author_id, forums:forum_id(id, slug, name), profiles:author_id(id, username, avatar_url, is_verified)')
      .eq('forum_id', forum.id)
      .limit(limit)

    if (sort === 'new') query = query.order('created_at', { ascending: false })
    else if (sort === 'top') query = query.order('score', { ascending: false })
    else query = query.order('score', { ascending: false }).order('created_at', { ascending: false })

    const { data: threads, error } = await query
    if (error) return NextResponse.json({ error: 'Failed to load threads' }, { status: 500 })
    return NextResponse.json({ threads })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const slug = params?.slug || request.url.split('/forums/')[1]?.split('/')[0]
    if (!slug) return NextResponse.json({ error: 'Missing forum slug' }, { status: 400 })

    const { data: forum } = await supabase
      .from('forums')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!forum) return NextResponse.json({ error: 'Forum not found' }, { status: 404 })

    const payload = await request.json()
    const { title, body, media_urls, url } = payload || {}
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

    const insert = { forum_id: forum.id, author_id: user.id, title, body, media_urls: media_urls || [], url: url || null }
    const { data, error } = await supabase
      .from('forum_threads')
      .insert(insert)
      .select('id, title, created_at')
      .single()

    if (error) return NextResponse.json({ error: 'Failed to create thread' }, { status: 400 })
    return NextResponse.json({ thread: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})


