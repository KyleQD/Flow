import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  venue_name: z.string().min(1, 'Venue name is required'),
  venue_address: z.string().optional(),
  event_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid event date'),
  event_time: z.string().optional(),
  doors_open: z.string().optional(),
  duration_minutes: z.number().int().min(0, 'Duration must be non-negative').optional(),
  capacity: z.number().int().min(0, 'Capacity must be non-negative').optional(),
  ticket_price: z.number().min(0, 'Ticket price must be positive').optional(),
  vip_price: z.number().min(0, 'VIP price must be positive').optional(),
  expected_revenue: z.number().min(0, 'Expected revenue must be positive').optional(),
  sound_requirements: z.string().optional(),
  lighting_requirements: z.string().optional(),
  stage_requirements: z.string().optional(),
  special_requirements: z.string().optional(),
  venue_contact_name: z.string().optional(),
  venue_contact_email: z.string().email('Invalid email').optional(),
  venue_contact_phone: z.string().optional(),
  load_in_time: z.string().optional(),
  sound_check_time: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Events API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Events API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Events API] User lacks admin permissions for viewing events')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    console.log('[Events API] Fetching events for user:', user.id)

    // Fetch events for tours created by the user
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        *,
        tours!inner (
          id,
          name,
          user_id
        )
      `)
      .eq('tours.user_id', user.id) // Use user_id instead of artist_id
      .order('event_date', { ascending: true })

    if (eventsError) {
      console.error('[Events API] Error fetching events:', eventsError)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    console.log('[Events API] Successfully fetched events:', events?.length || 0)

    return NextResponse.json({ 
      success: true, 
      events: events || [],
      message: 'Events fetched successfully' 
    })

  } catch (error) {
    console.error('[Events API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Events API] POST request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Events API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminPermissions = await checkAdminPermissions(user)
    if (!hasAdminPermissions) {
      console.log('[Events API] User lacks admin permissions for creating events')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // Validate that event date is in the future
    const eventDate = new Date(validatedData.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (eventDate < today) {
      return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 })
    }

    // If this event is associated with a tour, validate the tour exists and user has access
    if (validatedData.tour_id) {
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('id, created_by')
        .eq('id', validatedData.tour_id)
        .single()

      if (tourError || !tour) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }

      if (tour.created_by !== user.id) {
        return NextResponse.json({ error: 'You can only create events for tours you created' }, { status: 403 })
      }
    }

    // Create the event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('[Events API] Error creating event:', error)
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'Events table does not exist. Please set up the database schema first.' }, { status: 500 })
      }
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    // If this event is part of a tour, update the tour's total_shows count
    if (validatedData.tour_id) {
      const { data: tourEvents } = await supabase
        .from('events')
        .select('id')
        .eq('tour_id', validatedData.tour_id)

      if (tourEvents) {
        await supabase
          .from('tours')
          .update({ total_shows: tourEvents.length })
          .eq('id', validatedData.tour_id)
      }
    }

    console.log('[Events API] Successfully created event:', event.id)
    return NextResponse.json({ event }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Events API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 