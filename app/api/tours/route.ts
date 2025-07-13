import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createTourSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  description: z.string().optional(),
  artist_id: z.string().uuid('Invalid artist ID').optional(),
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
    console.log('[Tours API] User authenticated:', user.id)

    // Check if user has admin permissions (now allows all authenticated users)
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tours API] User lacks admin permissions')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Simplified query that works with basic schema - no complex joins
    let query = supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: tours, error } = await query

    if (error) {
      console.error('[Tours API] Error fetching tours:', error)
      // Return empty array instead of error if table doesn't exist
      if (error.code === '42P01') {
        console.log('[Tours API] Tours table does not exist, returning empty array')
        return NextResponse.json({ tours: [] })
      }
      return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 })
    }

    // Simple transformation without complex relationships
    const toursWithStats = tours?.map((tour: any) => {
      return {
        ...tour,
        total_shows: 0, // Will be calculated when events are implemented
        completed_shows: 0,
        revenue: 0,
        events: [] // Empty for now
      }
    }) || []

    console.log('[Tours API] Successfully fetched', tours?.length || 0, 'tours')
    return NextResponse.json({ tours: toursWithStats })
  } catch (error) {
    console.error('[Tours API] Unexpected error:', error)
    return NextResponse.json({ tours: [] }) // Return empty array instead of error
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

    // Validate date range
    const startDate = new Date(validatedData.start_date)
    const endDate = new Date(validatedData.end_date)
    
    if (endDate < startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Simple insert without complex relationships
    const { data: tour, error } = await supabase
      .from('tours')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: 'planning', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('[Tours API] Error creating tour:', error)
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'Tours table does not exist. Please set up the database schema first.' }, { status: 500 })
      }
      return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 })
    }

    console.log('[Tours API] Successfully created tour:', tour.id)
    return NextResponse.json({ tour }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Tours API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 