import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { Tour } from '@/types/database.types'

const updateTourSchema = z.object({
  name: z.string().min(1, 'Tour name is required').optional(),
  description: z.string().optional(),
  artist_id: z.string().uuid('Invalid artist ID').optional(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date').optional(),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date').optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  transportation: z.string().optional(),
  accommodation: z.string().optional(),
  equipment_requirements: z.string().optional(),
  crew_size: z.number().int().min(0, 'Crew size must be non-negative').optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tour, error } = await (supabase
      .from('tours') as any)
      .select(`
        *,
        artist:profiles!tours_artist_id_fkey(id, display_name, avatar_url),
        events(
          id, name, description, event_date, event_time, doors_open, 
          duration_minutes, status, capacity, tickets_sold, ticket_price, 
          vip_price, expected_revenue, actual_revenue, expenses,
          sound_requirements, lighting_requirements, stage_requirements,
          special_requirements, venue_name, venue_address,
          venue_contact_name, venue_contact_email, venue_contact_phone,
          load_in_time, sound_check_time
        ),
        tour_team_members(
          id, role, contact_email, contact_phone, status,
          user:profiles!tour_team_members_user_id_fkey(id, display_name, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      console.error('Error fetching tour:', error)
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    // Calculate computed fields
    const events = tour.events || []
    const totalShows = events.length
    const completedShows = events.filter((e: any) => e.status === 'completed').length
    const revenue = events.reduce((sum: number, e: any) => sum + (e.actual_revenue || 0), 0)
    const expenses = events.reduce((sum: number, e: any) => sum + (e.expenses || 0), 0)

    const tourWithStats = {
      ...tour,
      total_shows: totalShows,
      completed_shows: completedShows,
      revenue,
      expenses,
      profit: revenue - expenses,
      events: events.map((e: any) => ({
        ...e,
        venue: {
          name: e.venue_name,
          address: e.venue_address,
          contact: {
            name: e.venue_contact_name,
            email: e.venue_contact_email,
            phone: e.venue_contact_phone
          }
        }
      }))
    }

    return NextResponse.json({ tour: tourWithStats })
  } catch (error) {
    console.error('Tour GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateTourSchema.parse(body)

    // Validate date range if both dates are provided
    if (validatedData.start_date && validatedData.end_date) {
      const startDate = new Date(validatedData.start_date)
      const endDate = new Date(validatedData.end_date)
      
      if (endDate < startDate) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }
    }

    const { data: tour, error } = await (supabase
      .from('tours') as any)
      .update(validatedData)
      .eq('id', params.id)
      .select(`
        *,
        artist:profiles!tours_artist_id_fkey(id, display_name, avatar_url)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      console.error('Error updating tour:', error)
      return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 })
    }

    return NextResponse.json({ tour })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Tour PUT API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await (supabase
      .from('tours') as any)
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      console.error('Error deleting tour:', error)
      return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Tour deleted successfully' })
  } catch (error) {
    console.error('Tour DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 