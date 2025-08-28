import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const supabase = await createClient()

    const { data: posts, error } = await supabase
      .from('event_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching event posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    console.error('Error in event posts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, type = 'text', media_urls = [], visibility = 'public' } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if user can post (is creator or attending)
    const { data: event } = await supabase
      .from('artist_events')
      .select('user_id')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const isCreator = event.user_id === user.id
    
    // Check if user is attending (for non-creators)
    let isAttending = false
    if (!isCreator) {
      const { data: attendance } = await supabase
        .from('event_attendance')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('event_table', 'artist_events')
        .single()
      
      isAttending = attendance?.status === 'attending'
    }

    if (!isCreator && !isAttending && visibility !== 'public') {
      return NextResponse.json(
        { error: 'You can only post publicly unless you are attending this event' },
        { status: 403 }
      )
    }

    // Create the post
    const { data: newPost, error } = await supabase
      .from('event_posts')
      .insert({
        event_id: eventId,
        event_table: 'artist_events',
        user_id: user.id,
        content: content.trim(),
        type,
        media_urls: media_urls.length > 0 ? media_urls : null,
        visibility,
        is_announcement: isCreator,
        is_pinned: false,
        likes_count: 0,
        comments_count: 0
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .single()

    if (error) {
      console.error('Error creating event post:', error)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ post: newPost })
  } catch (error) {
    console.error('Error in event posts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


