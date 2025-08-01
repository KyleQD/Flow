import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const updateEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').optional(),
  description: z.string().optional(),
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  venue_name: z.string().min(1, 'Venue name is required').optional(),
  venue_address: z.string().optional(),
  event_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid event date').optional(),
  event_time: z.string().optional(),
  doors_open: z.string().optional(),
  duration_minutes: z.number().int().min(0, 'Duration must be non-negative').optional(),
  capacity: z.number().int().min(0, 'Capacity must be non-negative').optional(),
  ticket_price: z.number().min(0, 'Ticket price must be positive').optional(),
  vip_price: z.number().min(0, 'VIP price must be positive').optional(),
  expected_revenue: z.number().min(0, 'Expected revenue must be positive').optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed']).optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Events API] GET request for event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Events API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Events API] User lacks admin permissions for viewing event')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch the specific event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        tours (
          id,
          name,
          user_id,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('[Events API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    // Verify the user has access to this event (through tour ownership)
    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Events API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.log('[Events API] Successfully fetched event:', event.id)

    return NextResponse.json({ 
      success: true, 
      event,
      message: 'Event fetched successfully' 
    })

  } catch (error) {
    console.error('[Events API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Events API] PATCH request for event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Events API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Events API] User lacks admin permissions for updating event')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the update data
    const validatedData = updateEventSchema.parse(body)

    // First, verify the user has access to this event
    const { data: existingEvent, error: fetchError } = await supabase
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

    if (fetchError) {
      console.error('[Events API] Error fetching existing event:', fetchError)
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    // Verify the user has access to this event (through tour ownership)
    if (existingEvent.tours && existingEvent.tours.user_id !== user.id) {
      console.log('[Events API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        tours (
          id,
          name,
          user_id,
          status
        )
      `)
      .single()

    if (updateError) {
      console.error('[Events API] Error updating event:', updateError)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    console.log('[Events API] Successfully updated event:', id)

    return NextResponse.json({ 
      success: true, 
      event: updatedEvent,
      message: 'Event updated successfully' 
    })

  } catch (error) {
    console.error('[Events API] Error:', error)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Events API] DELETE request for event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Events API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Events API] User lacks admin permissions for deleting event')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // First, verify the user has access to this event
    const { data: existingEvent, error: fetchError } = await supabase
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

    if (fetchError) {
      console.error('[Events API] Error fetching existing event:', fetchError)
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    // Verify the user has access to this event (through tour ownership)
    if (existingEvent.tours && existingEvent.tours.user_id !== user.id) {
      console.log('[Events API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[Events API] Error deleting event:', deleteError)
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    console.log('[Events API] Successfully deleted event:', id)

    return NextResponse.json({ 
      success: true,
      message: 'Event deleted successfully' 
    })

  } catch (error) {
    console.error('[Events API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 