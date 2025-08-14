import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const authResult = await authenticateApiRequest(request)
    const supabase = authResult?.supabase || (await (await import('@/lib/supabase/server')).createClient())

    // Organizer page
    const { data: page, error: pageError } = await supabase
      .from('organizer_pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (pageError) return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })

    // Recent posts
    const { data: posts } = await supabase
      .from('promotion_posts')
      .select('id, title, content, images, tags, created_at, event_id')
      .eq('author_id', page.user_id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10)

    // Upcoming events (by tours/events owner)
    const { data: events } = await supabase
      .from('events')
      .select('id, name, event_date, status, venue_name, tour_id')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(10)

    return NextResponse.json({ page, posts: posts || [], upcoming: events || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


