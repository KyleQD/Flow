import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plannerId = body.plannerId

    if (!plannerId) {
      return NextResponse.json({ error: 'Planner ID is required' }, { status: 400 })
    }

    // Get the event planner data
    const { data: plannerData, error: fetchError } = await supabase
      .from('event_planner_data')
      .select('*')
      .eq('id', plannerId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !plannerData) {
      console.error('Error fetching event planner data:', fetchError)
      return NextResponse.json({ error: 'Event planner not found' }, { status: 404 })
    }

    // Validate that event is ready for publishing
    const validationResult = validateEventForPublishing(plannerData)
    if (!validationResult.isValid) {
      return NextResponse.json({ 
        error: 'Event not ready for publishing',
        missingItems: validationResult.missingItems 
      }, { status: 400 })
    }

    // Create the actual event in the main events table
    const eventData = {
      name: plannerData.name,
      description: plannerData.description,
      event_date: plannerData.venues && plannerData.venues.length > 0 
        ? JSON.parse(plannerData.venues)[0]?.selectedDate || new Date().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      event_time: plannerData.venues && plannerData.venues.length > 0 
        ? JSON.parse(plannerData.venues)[0]?.selectedTime
        : null,
      venue_name: plannerData.venues && plannerData.venues.length > 0 
        ? JSON.parse(plannerData.venues)[0]?.name
        : null,
      venue_address: plannerData.venues && plannerData.venues.length > 0 
        ? JSON.parse(plannerData.venues)[0]?.address
        : null,
      capacity: plannerData.venues && plannerData.venues.length > 0 
        ? JSON.parse(plannerData.venues)[0]?.capacity || 0
        : 0,
      status: 'scheduled',
      expected_revenue: plannerData.budget ? JSON.parse(plannerData.budget).expectedRevenue || 0 : 0,
      ticket_price: plannerData.ticket_types && plannerData.ticket_types.length > 0 
        ? JSON.parse(plannerData.ticket_types)[0]?.price || 0
        : 0,
      created_by: user.id
    }

    // Insert the event
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (eventError) {
      console.error('Error creating event:', eventError)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    // Update the planner data with the event ID and published status
    const { error: updateError } = await supabase
      .from('event_planner_data')
      .update({
        event_id: newEvent.id,
        publish_status: 'published'
      })
      .eq('id', plannerId)

    if (updateError) {
      console.error('Error updating planner data:', updateError)
      // Don't fail the whole operation, just log it
    }

    // Create ticket types if they exist
    if (plannerData.ticket_types) {
      try {
        const ticketTypes = JSON.parse(plannerData.ticket_types)
        const ticketTypeInserts = ticketTypes.map((ticket: any) => ({
          event_planner_id: plannerId,
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          quantity_available: ticket.quantity,
          max_per_customer: ticket.maxPerCustomer || 10
        }))

        await supabase
          .from('event_ticket_types')
          .insert(ticketTypeInserts)
      } catch (error) {
        console.error('Error creating ticket types:', error)
      }
    }

    // Create team members if they exist
    if (plannerData.team_members) {
      try {
        const teamMembers = JSON.parse(plannerData.team_members)
        const teamMemberInserts = teamMembers.map((member: any) => ({
          event_planner_id: plannerId,
          name: member.name,
          email: member.email,
          role: member.role,
          permissions: JSON.stringify(member.permissions || []),
          status: 'pending'
        }))

        await supabase
          .from('event_team_members')
          .insert(teamMemberInserts)
      } catch (error) {
        console.error('Error creating team members:', error)
      }
    }

    // Create budget categories if they exist
    if (plannerData.budget) {
      try {
        const budget = JSON.parse(plannerData.budget)
        if (budget.categories && budget.categories.length > 0) {
          const budgetInserts = budget.categories.map((category: any) => ({
            event_planner_id: plannerId,
            category_name: category.name,
            allocated_amount: category.allocated,
            spent_amount: category.spent || 0
          }))

          await supabase
            .from('event_budget_categories')
            .insert(budgetInserts)
        }
      } catch (error) {
        console.error('Error creating budget categories:', error)
      }
    }

    // Log the publishing activity
    try {
      await supabase
        .from('event_planner_activity_log')
        .insert([{
          event_planner_id: plannerId,
          user_id: user.id,
          activity_type: 'PUBLISH',
          activity_description: 'Published event to live system',
          metadata: JSON.stringify({ event_id: newEvent.id })
        }])
    } catch (error) {
      console.error('Error logging activity:', error)
    }

    return NextResponse.json({ 
      message: 'Event published successfully',
      event: newEvent,
      plannerId 
    }, { status: 201 })

  } catch (error) {
    console.error('Event publishing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to validate if event is ready for publishing
function validateEventForPublishing(plannerData: any) {
  const missingItems: string[] = []
  
  // Required fields for publishing
  if (!plannerData.name) missingItems.push('Event name')
  if (!plannerData.description) missingItems.push('Event description')
  if (!plannerData.primary_contact) missingItems.push('Primary contact')
  
  // Check if at least one venue is configured
  const venues = plannerData.venues ? JSON.parse(plannerData.venues) : []
  if (venues.length === 0) {
    missingItems.push('At least one venue')
  }
  
  // Check if at least one ticket type is configured
  const ticketTypes = plannerData.ticket_types ? JSON.parse(plannerData.ticket_types) : []
  if (ticketTypes.length === 0) {
    missingItems.push('At least one ticket type')
  }

  return {
    isValid: missingItems.length === 0,
    missingItems
  }
} 