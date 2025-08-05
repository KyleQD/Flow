import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const updateStaffSchema = z.object({
  name: z.string().min(1, 'Staff name is required').optional(),
  role: z.string().min(1, 'Role is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  status: z.enum(['confirmed', 'pending', 'declined']).optional(),
  arrival_time: z.string().optional(),
  departure_time: z.string().optional(),
  notes: z.string().optional(),
  hourly_rate: z.number().min(0, 'Hourly rate must be non-negative').optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const { id, staffId } = await params
    console.log('[Staff API] GET request for staff member:', staffId, 'in event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Staff API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Staff API] User lacks admin permissions for viewing staff member')
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

    // Fetch the specific staff member
    const { data: staff, error: staffError } = await supabase
      .from('event_staff')
      .select('*')
      .eq('id', staffId)
      .eq('event_id', id)
      .single()

    if (staffError) {
      console.error('[Staff API] Error fetching staff member:', staffError)
      if (staffError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 })
    }

    console.log('[Staff API] Successfully fetched staff member:', staff.id)

    return NextResponse.json({ 
      success: true, 
      staff,
      message: 'Staff member fetched successfully' 
    })

  } catch (error) {
    console.error('[Staff API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const { id, staffId } = await params
    console.log('[Staff API] PATCH request for staff member:', staffId, 'in event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Staff API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Staff API] User lacks admin permissions for updating staff member')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the update data
    const validatedData = updateStaffSchema.parse(body)

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

    // Update the staff member
    const { data: updatedStaff, error: updateError } = await supabase
      .from('event_staff')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId)
      .eq('event_id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('[Staff API] Error updating staff member:', updateError)
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
    }

    console.log('[Staff API] Successfully updated staff member:', staffId)

    return NextResponse.json({ 
      success: true, 
      staff: updatedStaff,
      message: 'Staff member updated successfully' 
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const { id, staffId } = await params
    console.log('[Staff API] DELETE request for staff member:', staffId, 'in event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Staff API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Staff API] User lacks admin permissions for deleting staff member')
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

    // Delete the staff member
    const { error: deleteError } = await supabase
      .from('event_staff')
      .delete()
      .eq('id', staffId)
      .eq('event_id', id)

    if (deleteError) {
      console.error('[Staff API] Error deleting staff member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
    }

    console.log('[Staff API] Successfully deleted staff member:', staffId)

    return NextResponse.json({ 
      success: true,
      message: 'Staff member deleted successfully' 
    })

  } catch (error) {
    console.error('[Staff API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 