import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const supabase = await createClient()

    // Get event data
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
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
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get attendance data
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('event_attendance')
      .select('*')
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError)
    }

    const attending = attendanceData?.filter(a => a.status === 'attending') || []
    const interested = attendanceData?.filter(a => a.status === 'interested') || []
    const notGoing = attendanceData?.filter(a => a.status === 'not_going') || []

    // Get current user's attendance status
    const { data: { user } } = await supabase.auth.getUser()
    let userStatus = null
    if (user) {
      const userAttendance = attendanceData?.find(a => a.user_id === user.id)
      userStatus = userAttendance?.status || null
    }

    // Get event posts
    const { data: posts, error: postsError } = await supabase
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

    if (postsError) {
      console.error('Error fetching posts:', postsError)
    }

    // Determine if user can post
    let canPost = false
    if (user) {
      const isCreator = event.user_id === user.id
      const isAttending = userStatus === 'attending'
      canPost = isCreator || isAttending
    }

    const response = {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        venue_name: event.venue_name,
        venue_address: event.venue_address,
        venue_city: event.venue_city,
        venue_state: event.venue_state,
        venue_country: event.venue_country,
        venue_coordinates: event.venue_coordinates,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        doors_open: event.doors_open,
        ticket_url: event.ticket_url,
        ticket_price_min: event.ticket_price_min,
        ticket_price_max: event.ticket_price_max,
        capacity: event.capacity,
        status: event.status,
        is_public: event.is_public,
        poster_url: event.poster_url,
        setlist: event.setlist,
        tags: event.tags,
        social_links: event.social_links,
        slug: event.slug,
        user_id: event.user_id,
        created_at: event.created_at,
        updated_at: event.updated_at,
        creator: event.profiles
      },
      attendance: {
        attending: attending.length,
        interested: interested.length,
        not_going: notGoing.length,
        user_status: userStatus,
        attendees: attending.slice(0, 10), // Limit for performance
        interested_users: interested.slice(0, 10)
      },
      posts: posts || [],
      can_post: canPost,
      is_creator: user ? event.user_id === user.id : false
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in event page API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


