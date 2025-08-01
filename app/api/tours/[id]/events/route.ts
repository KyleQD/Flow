import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  venue_name: z.string().min(1, 'Venue name is required'),
  venue_address: z.string().optional(),
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().optional(),
  doors_open: z.string().optional(),
  duration_minutes: z.number().min(1).optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed']).default('scheduled'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  ticket_price: z.number().min(0).optional(),
  vip_price: z.number().min(0).optional(),
  expected_revenue: z.number().min(0).optional(),
  venue_contact_name: z.string().optional(),
  venue_contact_email: z.string().email().optional(),
  venue_contact_phone: z.string().optional(),
  sound_requirements: z.string().optional(),
  lighting_requirements: z.string().optional(),
  stage_requirements: z.string().optional(),
  special_requirements: z.string().optional(),
  load_in_time: z.string().optional(),
  sound_check_time: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Tour Events API] GET request for tour events:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour Events API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tour Events API] User lacks admin permissions for viewing tour events')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the user owns this tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tourError) {
      console.error('[Tour Events API] Error fetching tour for ownership check:', tourError)
      if (tourError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) {
      console.log('[Tour Events API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch events for this tour
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('tour_id', id)
      .order('event_date', { ascending: true })

    if (eventsError) {
      console.error('[Tour Events API] Error fetching events:', eventsError)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    console.log('[Tour Events API] Successfully fetched events:', events?.length || 0)

    return NextResponse.json({ 
      success: true, 
      events: events || [],
      message: 'Tour events fetched successfully' 
    })

  } catch (error) {
    console.error('[Tour Events API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Tour Events API] POST request for tour event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour Events API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tour Events API] User lacks admin permissions for creating tour events')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // Verify the user owns this tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id, name as tour_name')
      .eq('id', id)
      .single()

    if (tourError) {
      console.error('[Tour Events API] Error fetching tour for ownership check:', tourError)
      if (tourError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) {
      console.log('[Tour Events API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the event
    const eventData = {
      ...validatedData,
      tour_id: id,
      user_id: user.id,
      tickets_sold: 0,
      actual_revenue: 0,
      expenses: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (eventError) {
      console.error('[Tour Events API] Error creating event:', eventError)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    console.log('[Tour Events API] Successfully created event:', event.id)

    return NextResponse.json({ 
      success: true, 
      event,
      message: 'Event created successfully for tour' 
    })

  } catch (error) {
    console.error('[Tour Events API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 