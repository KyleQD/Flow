import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createStaffSchema = z.object({
  name: z.string().min(1, 'Staff name is required'),
  role: z.string().min(1, 'Role is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  status: z.enum(['confirmed', 'pending', 'declined']).default('pending'),
  arrival_time: z.string().optional(),
  departure_time: z.string().optional(),
  notes: z.string().optional(),
  hourly_rate: z.number().min(0, 'Hourly rate must be non-negative').optional(),
  event_id: z.string().uuid('Invalid event ID')
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Staff API] GET request for event staff:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Staff API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Staff API] User lacks admin permissions for viewing staff')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the user has access to this event (through tour ownership)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        tours (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('[Staff API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Staff API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch staff for this event
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (staffError) {
      console.error('[Staff API] Error fetching staff:', staffError)
      // Return empty array if table doesn't exist
      if (staffError.code === '42P01') {
        console.log('[Staff API] Event staff table does not exist, returning empty array')
        return NextResponse.json({ 
          success: true, 
          staff: [],
          message: 'No staff found' 
        })
      }
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    console.log('[Staff API] Successfully fetched staff:', staff?.length || 0)

    return NextResponse.json({ 
      success: true, 
      staff: staff || [],
      message: 'Staff fetched successfully' 
    })

  } catch (error) {
    console.error('[Staff API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Staff API] POST request for event staff:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Staff API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Staff API] User lacks admin permissions for creating staff')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createStaffSchema.parse(body)

    // Verify the user has access to this event (through tour ownership)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        tours (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('[Staff API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Staff API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the staff member
    const staffData = {
      ...validatedData,
      event_id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .insert(staffData)
      .select('*')
      .single()

    if (staffError) {
      console.error('[Staff API] Error creating staff:', staffError)
      return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
    }

    console.log('[Staff API] Successfully created staff member:', staff.id)

    return NextResponse.json({ 
      success: true, 
      staff,
      message: 'Staff member created successfully' 
    })

  } catch (error) {
    console.error('[Staff API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 