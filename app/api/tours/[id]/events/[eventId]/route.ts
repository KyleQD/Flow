import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const updateEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').optional(),
  description: z.string().optional(),
  venue_name: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  venue_address: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  doors_open: z.string().optional(),
  duration_minutes: z.number().int().min(0).optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed']).optional(),
  capacity: z.number().int().min(0).optional(),
  tickets_sold: z.number().int().min(0).optional(),
  ticket_price: z.number().min(0).optional(),
  vip_price: z.number().min(0).optional(),
  expected_revenue: z.number().min(0).optional(),
  actual_revenue: z.number().min(0).optional(),
  expenses: z.number().min(0).optional(),
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
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params

    const authResult = await authenticateApiRequest(request)
    if (!authResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { user, supabase } = authResult

    const hasAdminAccess = await checkAdminPermissions(user, { tourId: id })
    if (!hasAdminAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    // Verify tour ownership
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tourError) {
      if (tourError.code === 'PGRST116') return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('tour_id', id)
      .single()

    if (eventError) {
      if (eventError.code === 'PGRST116') return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params

    const authResult = await authenticateApiRequest(request)
    if (!authResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = authResult

    const hasAdminAccess = await checkAdminPermissions(user, { tourId: id })
    if (!hasAdminAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    // Verify tour ownership
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tourError) {
      if (tourError.code === 'PGRST116') return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const { data: updated, error: updateError } = await supabase
      .from('events')
      .update({ ...validatedData, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .eq('tour_id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({ success: true, event: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params

    const authResult = await authenticateApiRequest(request)
    if (!authResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = authResult

    const hasAdminAccess = await checkAdminPermissions(user, { tourId: id })
    if (!hasAdminAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    // Verify tour ownership
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tourError) {
      if (tourError.code === 'PGRST116') return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('tour_id', id)

    if (deleteError) return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Event deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


