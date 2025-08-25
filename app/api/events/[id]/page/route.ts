import { NextRequest, NextResponse } from 'next/server'

// Resolve event by UUID or slug
async function findEventByParam(param: string, supabase: any) {
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(param)
  const query = supabase
    .from('events')
    .select('*')
    .limit(1)
  const { data, error } = isUuid
    ? await query.eq('id', param)
    : await query.eq('slug', param)

  if (error) throw error
  return data?.[0] || null
}

// Build creator info from profiles
async function fetchCreatorInfo(userId: string, supabase: any) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, is_verified')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function GET(_req: NextRequest, { params }: any) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const event = await findEventByParam(params.id, supabase)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Transform fields to match client expectations
    const creatorId = event.user_id || event.created_by
    const creator = creatorId ? await fetchCreatorInfo(creatorId, supabase) : null

    const response = {
      event: {
        id: event.id,
        title: event.title,
        description: event.description || '',
        type: event.type,
        venue_name: event.venue_name || null,
        venue_city: event.city || null,
        venue_state: event.state || null,
        event_date: event.event_date,
        start_time: event.start_time || null,
        end_time: event.end_time || null,
        doors_open: event.doors_open || null,
        ticket_url: event.ticket_url || null,
        ticket_price_min: event.ticket_price_min ?? event.ticket_price ?? null,
        ticket_price_max: event.ticket_price_max ?? event.ticket_price ?? null,
        capacity: event.capacity || null,
        status: event.status,
        is_public: event.is_public,
        poster_url: event.poster_url || null,
        user_id: creatorId
      },
      attendance: {
        attending: 0,
        interested: 0,
        not_going: 0,
        user_status: null,
        attendees: [],
        interested_users: []
      },
      settings: {
        is_page_enabled: true,
        allow_public_posts: true,
        allow_attendee_posts: true,
        require_approval_for_posts: false,
        show_attendance_count: true,
        show_attendee_list: true,
        allow_comments: true,
        page_theme: { primary_color: '#7c3aed' }
      }
    }

    if (creator) (response as any).event.creator = creator

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Event Page API] Error:', error)
    return NextResponse.json({ error: 'Failed to load event page' }, { status: 500 })
  }
}


