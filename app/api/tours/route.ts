import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createTourSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  description: z.string().optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  transportation: z.string().optional(),
  accommodation: z.string().optional(),
  equipment_requirements: z.string().optional(),
  crew_size: z.number().int().min(0, 'Crew size must be non-negative').optional(),
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Tours API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tours API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tours API] User lacks admin permissions for viewing tours')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('[Tours API] Fetching tours for user:', user.id)

    // Build query to fetch tours with embedded events for calendar population
    let query = supabase
      .from('tours')
      .select(`
        *,
        events (
          id,
          name,
          event_date,
          status,
          venue_name
        )
      `)
      .eq('user_id', user.id) // Use user_id instead of artist_id
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: tours, error: toursError } = await query

    if (toursError) {
      console.error('[Tours API] Error fetching tours:', toursError)
      // Return empty array instead of error if table doesn't exist
      if (toursError.code === '42P01') {
        console.log('[Tours API] Tours table does not exist, returning empty array')
        return NextResponse.json({ 
          success: true, 
          tours: [],
          message: 'No tours found' 
        })
      }
      return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 })
    }

    console.log('[Tours API] Successfully fetched tours:', tours?.length || 0)

    return NextResponse.json({ 
      success: true, 
      tours: tours || [],
      message: 'Tours fetched successfully' 
    })

  } catch (error) {
    console.error('[Tours API] Error:', error)
    return NextResponse.json({ 
      success: true, 
      tours: [],
      message: 'Error occurred while fetching tours' 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Tours API] POST request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tours API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tours API] User lacks admin permissions for creating tours')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTourSchema.parse(body)

    console.log('[Tours API] Creating tour with data:', validatedData)

    // Create the tour
    const tourData = {
      ...validatedData,
      user_id: user.id, // Use user_id instead of artist_id
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .insert(tourData)
      .select('*')
      .single()

    if (tourError) {
      console.error('[Tours API] Error creating tour:', tourError)
      return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 })
    }

    console.log('[Tours API] Tour created successfully:', tour.id)

    // Create a default event for the tour so it appears on the events tab and calendar
    const defaultEvent = {
      tour_id: tour.id,
      name: `${tour.name} - Tour Event`,
      description: `Default event for ${tour.name}`,
      venue_name: 'TBD',
      event_date: validatedData.start_date,
      event_time: '19:00',
      capacity: 0,
      status: 'scheduled',
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert(defaultEvent)
      .select('*')
      .single()

    if (eventError) {
      console.error('[Tours API] Error creating default event:', eventError)
      // Don't fail the tour creation if event creation fails
    } else {
      console.log('[Tours API] Default event created successfully:', event.id)
      
      // Update tour with total_shows count
      await supabase
        .from('tours')
        .update({ total_shows: 1 })
        .eq('id', tour.id)
    }

    return NextResponse.json({ 
      success: true, 
      tour,
      message: 'Tour created successfully' 
    })

  } catch (error) {
    console.error('[Tours API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 