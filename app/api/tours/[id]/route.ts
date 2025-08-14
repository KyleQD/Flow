import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const updateTourSchema = z.object({
  name: z.string().min(1, 'Tour name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  expected_revenue: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  crew_size: z.number().min(0).optional(),
  transportation: z.string().optional(),
  accommodation: z.string().optional(),
  equipment_requirements: z.string().optional(),
  special_requirements: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Tour API] GET request for tour:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user, { tourId: id })
    if (!hasAdminAccess) {
      console.log('[Tour API] User lacks admin permissions for viewing tour')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch tour with events
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select(`
        *,
        events (
          id,
          name,
          venue_name,
          event_date,
          status,
          capacity,
          tickets_sold,
          actual_revenue,
          expenses
        )
      `)
      .eq('id', id)
      .single()

    if (tourError) {
      console.error('[Tour API] Error fetching tour:', tourError)
      if (tourError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    // Check if user owns this tour
    if (tour.user_id !== user.id) {
      console.log('[Tour API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate derived fields
    const totalShows = tour.events?.length || 0
    const completedShows = tour.events?.filter((event: any) => event.status === 'completed').length || 0
    const actualRevenue = tour.events?.reduce((sum: number, event: any) => sum + (event.actual_revenue || 0), 0) || 0
    const totalExpenses = tour.events?.reduce((sum: number, event: any) => sum + (event.expenses || 0), 0) || 0

    const tourWithCalculations = {
      ...tour,
      total_shows: totalShows,
      completed_shows: completedShows,
      actual_revenue: actualRevenue,
      expenses: totalExpenses
    }

    console.log('[Tour API] Successfully fetched tour:', id)

    return NextResponse.json(tourWithCalculations)

  } catch (error) {
    console.error('[Tour API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Tour API] PATCH request for tour:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user, { tourId: id })
    if (!hasAdminAccess) {
      console.log('[Tour API] User lacks admin permissions for updating tour')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateTourSchema.parse(body)

    // Verify the user owns this tour
    const { data: existingTour, error: fetchError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('[Tour API] Error fetching tour for ownership check:', fetchError)
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (existingTour.user_id !== user.id) {
      console.log('[Tour API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the tour
    const { data: updatedTour, error: updateError } = await supabase
      .from('tours')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[Tour API] Error updating tour:', updateError)
      return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 })
    }

    console.log('[Tour API] Successfully updated tour:', id)

    return NextResponse.json(updatedTour)

  } catch (error) {
    console.error('[Tour API] Error:', error)
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
    console.log('[Tour API] DELETE request for tour:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user, { tourId: id })
    if (!hasAdminAccess) {
      console.log('[Tour API] User lacks admin permissions for deleting tour')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the user owns this tour
    const { data: existingTour, error: fetchError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('[Tour API] Error fetching tour for ownership check:', fetchError)
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (existingTour.user_id !== user.id) {
      console.log('[Tour API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete associated events first
    const { error: eventsDeleteError } = await supabase
      .from('events')
      .delete()
      .eq('tour_id', id)

    if (eventsDeleteError) {
      console.error('[Tour API] Error deleting associated events:', eventsDeleteError)
      return NextResponse.json({ error: 'Failed to delete associated events' }, { status: 500 })
    }

    // Delete the tour
    const { error: deleteError } = await supabase
      .from('tours')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[Tour API] Error deleting tour:', deleteError)
      return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 })
    }

    console.log('[Tour API] Successfully deleted tour:', id)

    return NextResponse.json({ 
      success: true, 
      message: 'Tour deleted successfully' 
    })

  } catch (error) {
    console.error('[Tour API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 