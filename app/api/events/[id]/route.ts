import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { Event } from '@/types/database.types'

const updateEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').optional(),
  description: z.string().optional(),
  venue_name: z.string().min(1, 'Venue name is required').optional(),
  venue_address: z.string().optional(),
  event_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid event date').optional(),
  event_time: z.string().optional(),
  doors_open: z.string().optional(),
  duration_minutes: z.number().int().min(0, 'Duration must be non-negative').optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed']).optional(),
  capacity: z.number().int().min(0, 'Capacity must be non-negative').optional(),
  tickets_sold: z.number().int().min(0, 'Tickets sold must be non-negative').optional(),
  ticket_price: z.number().min(0, 'Ticket price must be positive').optional(),
  vip_price: z.number().min(0, 'VIP price must be positive').optional(),
  expected_revenue: z.number().min(0, 'Expected revenue must be positive').optional(),
  actual_revenue: z.number().min(0, 'Actual revenue must be positive').optional(),
  expenses: z.number().min(0, 'Expenses must be positive').optional(),
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: event, error } = await (supabase
      .from('events') as any)
      .select(`
        *,
        tour:tours(id, name, artist_id, status),
        event_expenses(
          id, category, description, amount, vendor, expense_date, status, receipt_url
        ),
        event_notes(
          id, note_type, title, content, priority, created_at, created_by
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      console.error('Error fetching event:', error)
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    // Calculate computed fields
    const expenses = event.event_expenses || []
    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)
    const profit = (event.actual_revenue || 0) - totalExpenses
    const ticketSalesPercentage = event.capacity > 0 ? (event.tickets_sold / event.capacity) * 100 : 0

    const eventWithStats = {
      ...event,
      total_expenses: totalExpenses,
      profit,
      ticket_sales_percentage: ticketSalesPercentage,
      venue: {
        name: event.venue_name,
        address: event.venue_address,
        contact: {
          name: event.venue_contact_name,
          email: event.venue_contact_email,
          phone: event.venue_contact_phone
        }
      },
      expenses: expenses.map((expense: any) => ({
        id: expense.id,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        vendor: expense.vendor,
        date: expense.expense_date,
        status: expense.status,
        receipt_url: expense.receipt_url
      })),
      notes: event.event_notes || []
    }

    return NextResponse.json({ event: eventWithStats })
  } catch (error) {
    console.error('Event GET API error:', error)
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
    const validatedData = updateEventSchema.parse(body)

    // Validate ticket sales don't exceed capacity
    if (validatedData.tickets_sold && validatedData.capacity && validatedData.tickets_sold > validatedData.capacity) {
      return NextResponse.json({ error: 'Tickets sold cannot exceed capacity' }, { status: 400 })
    }

    const { data: event, error } = await (supabase
      .from('events') as any)
      .update(validatedData)
      .eq('id', params.id)
      .select(`
        *,
        tour:tours(id, name, artist_id, status)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      console.error('Error updating event:', error)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    // If this event is part of a tour and we changed its status, update tour metrics
    if (event.tour_id && validatedData.status) {
      const { data: tourEvents } = await (supabase
        .from('events') as any)
        .select('status')
        .eq('tour_id', event.tour_id)

      if (tourEvents) {
        const completedShows = tourEvents.filter((e: any) => e.status === 'completed').length
        await (supabase
          .from('tours') as any)
          .update({ completed_shows: completedShows })
          .eq('id', event.tour_id)
      }
    }

    return NextResponse.json({ event })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Event PUT API error:', error)
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

    // First, get the event to check if it's part of a tour
    const { data: event } = await (supabase
      .from('events') as any)
      .select('tour_id')
      .eq('id', params.id)
      .single()

    const { error } = await (supabase
      .from('events') as any)
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      console.error('Error deleting event:', error)
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    // If this event was part of a tour, update the tour's total_shows count
    if (event?.tour_id) {
      const { data: tourEvents } = await (supabase
        .from('events') as any)
        .select('id, status')
        .eq('tour_id', event.tour_id)

      if (tourEvents) {
        const totalShows = tourEvents.length
        const completedShows = tourEvents.filter((e: any) => e.status === 'completed').length
        await (supabase
          .from('tours') as any)
          .update({ 
            total_shows: totalShows,
            completed_shows: completedShows 
          })
          .eq('id', event.tour_id)
      }
    }

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Event DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 