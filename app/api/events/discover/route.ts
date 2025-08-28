import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')
    const location = searchParams.get('location')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const tags = searchParams.get('tags')?.split(',')
    const sortBy = searchParams.get('sortBy') || 'date' // date, popularity, relevance

    // Build the query
    let query = supabase
      .from('artist_events')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        ),
        event_attendance!left (
          status
        )
      `)
      .eq('is_public', true)
      .gte('event_date', new Date().toISOString().split('T')[0]) // Only future events
      .order('event_date', { ascending: true })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }

    if (location) {
      query = query.or(`venue_city.ilike.%${location}%,venue_state.ilike.%${location}%`)
    }

    if (dateFrom) {
      query = query.gte('event_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('event_date', dateTo)
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
        // Sort by attendance count (would need a subquery in real implementation)
        query = query.order('event_date', { ascending: true })
        break
      case 'relevance':
        // Sort by relevance score (would need a scoring algorithm)
        query = query.order('event_date', { ascending: true })
        break
      default:
        query = query.order('event_date', { ascending: true })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Transform the data to include attendance counts
    const transformedEvents = events?.map(event => {
      const attendingCount = event.event_attendance?.filter((a: { status: string }) => a.status === 'attending').length || 0
      const interestedCount = event.event_attendance?.filter((a: { status: string }) => a.status === 'interested').length || 0
      
      return {
        ...event,
        attendance: {
          attending: attendingCount,
          interested: interestedCount,
          total: attendingCount + interestedCount
        }
      }
    }) || []

    return NextResponse.json({
      events: transformedEvents,
      pagination: {
        limit,
        offset,
        hasMore: transformedEvents.length === limit
      }
    })
  } catch (error) {
    console.error('Error in events discover API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
