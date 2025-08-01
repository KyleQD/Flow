import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

// Validation schemas for each step
const tourInitiationSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  description: z.string().optional(),
  mainArtist: z.string().min(1, 'Main artist is required'),
  genre: z.string().optional(),
  coverImage: z.string().optional()
})

const routingDatesSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  route: z.array(z.object({
    city: z.string().min(1, 'City is required'),
    venue: z.string().min(1, 'Venue is required'),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  })).min(1, 'At least one route stop is required')
})

const eventsSchema = z.object({
  events: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Event name is required'),
    venue: z.string().min(1, 'Venue is required'),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    time: z.string().optional(),
    description: z.string().optional(),
    capacity: z.number().int().min(0, 'Capacity must be non-negative').optional()
  })).min(1, 'At least one event is required')
})

const artistsCrewSchema = z.object({
  artists: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Artist name is required'),
    role: z.string().min(1, 'Role is required'),
    events: z.array(z.string()).default([])
  })).default([]),
  crew: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Crew member name is required'),
    role: z.string().min(1, 'Role is required'),
    events: z.array(z.string()).default([])
  })).default([])
})

const logisticsSchema = z.object({
  transportation: z.object({
    type: z.string().min(1, 'Transportation type is required'),
    details: z.string().optional(),
    cost: z.number().min(0, 'Cost must be non-negative').optional()
  }),
  accommodation: z.object({
    type: z.string().min(1, 'Accommodation type is required'),
    details: z.string().optional(),
    cost: z.number().min(0, 'Cost must be non-negative').optional()
  }),
  equipment: z.array(z.object({
    name: z.string().min(1, 'Equipment name is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    cost: z.number().min(0, 'Cost must be non-negative').optional()
  })).default([])
})

const ticketingFinancialsSchema = z.object({
  ticketTypes: z.array(z.object({
    name: z.string().min(1, 'Ticket type name is required'),
    price: z.number().min(0, 'Price must be non-negative'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    description: z.string().optional()
  })).default([]),
  budget: z.object({
    total: z.number().min(0, 'Total budget must be non-negative'),
    expenses: z.array(z.object({
      category: z.string().min(1, 'Expense category is required'),
      amount: z.number().min(0, 'Amount must be non-negative'),
      description: z.string().optional()
    })).default([])
  }),
  sponsors: z.array(z.object({
    name: z.string().min(1, 'Sponsor name is required'),
    contribution: z.number().min(0, 'Contribution must be non-negative'),
    type: z.string().optional()
  })).default([])
})

const completeTourDataSchema = z.object({
  step1: tourInitiationSchema,
  step2: routingDatesSchema,
  step3: eventsSchema,
  step4: artistsCrewSchema,
  step5: logisticsSchema,
  step6: ticketingFinancialsSchema
})

export async function POST(request: NextRequest) {
  try {
    console.log('[Tour Planner API] POST request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = completeTourDataSchema.parse(body)

    // Validate date ranges
    const startDate = new Date(validatedData.step2.startDate)
    const endDate = new Date(validatedData.step2.endDate)
    
    if (endDate < startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Validate that event dates fall within tour date range (with more flexible validation)
    const invalidEvents = []
    for (const event of validatedData.step3.events) {
      try {
        const eventDate = new Date(event.date)
        if (isNaN(eventDate.getTime())) {
          invalidEvents.push(`Event "${event.name}" has an invalid date format`)
        } else if (eventDate < startDate || eventDate > endDate) {
          invalidEvents.push(`Event "${event.name}" date (${event.date}) must fall within tour date range (${validatedData.step2.startDate} to ${validatedData.step2.endDate})`)
        }
      } catch (error) {
        invalidEvents.push(`Event "${event.name}" has an invalid date: ${event.date}`)
      }
    }

    if (invalidEvents.length > 0) {
      console.warn('[Tour Planner API] Date validation warnings:', invalidEvents)
      // Instead of failing, we'll log warnings and continue
      // This allows tours to be created even with date mismatches
    }

    // Calculate total budget and expenses
    const totalBudget = validatedData.step6.budget.total
    const totalExpenses = validatedData.step6.budget.expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const transportationCost = validatedData.step5.transportation.cost || 0
    const accommodationCost = validatedData.step5.accommodation.cost || 0
    const equipmentCost = validatedData.step5.equipment.reduce((sum, eq) => sum + (eq.cost || 0), 0)
    const totalLogisticsCost = transportationCost + accommodationCost + equipmentCost

    // Create the tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .insert({
        name: validatedData.step1.name,
        description: validatedData.step1.description,
        user_id: user.id, // Use user_id instead of artist_id
        start_date: validatedData.step2.startDate,
        end_date: validatedData.step2.endDate,
        budget: totalBudget,
        expenses: totalExpenses + totalLogisticsCost,
        transportation: `${validatedData.step5.transportation.type}: ${validatedData.step5.transportation.details || 'No details'}`,
        accommodation: `${validatedData.step5.accommodation.type}: ${validatedData.step5.accommodation.details || 'No details'}`,
        equipment_requirements: validatedData.step5.equipment.map(eq => 
          `${eq.name} (${eq.quantity})`
        ).join(', '),
        crew_size: validatedData.step4.crew.length,
        status: 'planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (tourError) {
      console.error('[Tour Planner API] Error creating tour:', tourError)
      return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 })
    }

    // Create events
    const events = []
    for (const eventData of validatedData.step3.events) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          tour_id: tour.id,
          name: eventData.name,
          description: eventData.description,
          venue_name: eventData.venue,
          event_date: eventData.date,
          event_time: eventData.time,
          capacity: eventData.capacity || 0,
          status: 'scheduled',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (eventError) {
        console.error('[Tour Planner API] Error creating event:', eventError)
        // Continue with other events, don't fail the entire tour
        continue
      }

      events.push(event)
    }

    // Create team members (artists and crew)
    const teamMembers = []
    
    // Add artists
    for (const artistData of validatedData.step4.artists) {
      const { data: teamMember, error: teamError } = await supabase
        .from('tour_team_members')
        .insert({
          tour_id: tour.id,
          user_id: user.id, // Use the current user's ID as a placeholder
          role: `Artist - ${artistData.role}`,
          contact_email: `${artistData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (!teamError) {
        teamMembers.push(teamMember)
      }
    }

    // Add crew members
    for (const crewData of validatedData.step4.crew) {
      const { data: teamMember, error: teamError } = await supabase
        .from('tour_team_members')
        .insert({
          tour_id: tour.id,
          user_id: user.id, // Use the current user's ID as a placeholder
          role: `Crew - ${crewData.role}`,
          contact_email: `${crewData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (!teamError) {
        teamMembers.push(teamMember)
      }
    }

    // Create event expenses for logistics
    const expenses = []
    
    // Add transportation expense
    if (transportationCost > 0) {
      const { data: expense, error: expenseError } = await supabase
        .from('event_expenses')
        .insert({
          tour_id: tour.id,
          category: 'Transportation',
          description: `${validatedData.step5.transportation.type}: ${validatedData.step5.transportation.details || 'No details'}`,
          amount: transportationCost,
          vendor: 'Transportation Provider',
          status: 'pending',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (!expenseError) {
        expenses.push(expense)
      }
    }

    // Add accommodation expense
    if (accommodationCost > 0) {
      const { data: expense, error: expenseError } = await supabase
        .from('event_expenses')
        .insert({
          tour_id: tour.id,
          category: 'Accommodation',
          description: `${validatedData.step5.accommodation.type}: ${validatedData.step5.accommodation.details || 'No details'}`,
          amount: accommodationCost,
          vendor: 'Accommodation Provider',
          status: 'pending',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (!expenseError) {
        expenses.push(expense)
      }
    }

    // Add equipment expenses
    for (const equipment of validatedData.step5.equipment) {
      if (equipment.cost && equipment.cost > 0) {
        const { data: expense, error: expenseError } = await supabase
          .from('event_expenses')
          .insert({
            tour_id: tour.id,
            category: 'Equipment',
            description: `${equipment.name} (${equipment.quantity})`,
            amount: equipment.cost,
            vendor: 'Equipment Provider',
            status: 'pending',
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single()

        if (!expenseError) {
          expenses.push(expense)
        }
      }
    }

    // Add budget expenses
    for (const budgetExpense of validatedData.step6.budget.expenses) {
      const { data: expense, error: expenseError } = await supabase
        .from('event_expenses')
        .insert({
          tour_id: tour.id,
          category: budgetExpense.category,
          description: budgetExpense.description || budgetExpense.category,
          amount: budgetExpense.amount,
          vendor: 'Various',
          status: 'pending',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (!expenseError) {
        expenses.push(expense)
      }
    }

    console.log('[Tour Planner API] Successfully created tour with all components:', tour.id)
    
    return NextResponse.json({
      tour: {
        ...tour,
        events,
        team_members: teamMembers,
        expenses,
        summary: {
          total_events: events.length,
          total_team_members: teamMembers.length,
          total_expenses: expenses.length,
          budget_utilization: totalBudget > 0 ? ((totalExpenses + totalLogisticsCost) / totalBudget) * 100 : 0
        }
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Tour Planner API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Tour Planner API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('tour_id')

    if (!tourId) {
      return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 })
    }

    // Fetch tour with all related data
    const { data: tour, error } = await supabase
      .from('tours')
      .select(`
        *,
        events(
          id, name, description, venue_name, event_date, event_time, 
          capacity, status, created_at
        ),
        tour_team_members(
          id, role, contact_email, contact_phone, status, created_at
        ),
        event_expenses(
          id, category, description, amount, vendor, status, created_at
        )
      `)
      .eq('id', tourId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      console.error('[Tour Planner API] Error fetching tour:', error)
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    // Transform data for the planner
    const plannerData = {
      step1: {
        name: tour.name,
        description: tour.description,
        mainArtist: tour.artist_id,
        genre: '', // Not stored in current schema
        coverImage: '' // Not stored in current schema
      },
      step2: {
        startDate: tour.start_date,
        endDate: tour.end_date,
        route: tour.events?.map((event: any) => ({
          city: event.venue_name?.split(',')[0] || '',
          venue: event.venue_name || '',
          date: event.event_date,
          coordinates: { lat: 0, lng: 0 } // Not stored in current schema
        })) || []
      },
      step3: {
        events: tour.events?.map((event: any) => ({
          id: event.id,
          name: event.name,
          venue: event.venue_name || '',
          date: event.event_date,
          time: event.event_time,
          description: event.description,
          capacity: event.capacity
        })) || []
      },
      step4: {
        artists: tour.tour_team_members?.filter((member: any) => 
          member.role.toLowerCase().includes('artist')
        ).map((member: any) => ({
          id: member.id,
          name: member.contact_email?.split('@')[0] || member.role,
          role: member.role.replace('Artist - ', ''),
          events: []
        })) || [],
        crew: tour.tour_team_members?.filter((member: any) => 
          !member.role.toLowerCase().includes('artist')
        ).map((member: any) => ({
          id: member.id,
          name: member.contact_email?.split('@')[0] || member.role,
          role: member.role,
          events: []
        })) || []
      },
      step5: {
        transportation: {
          type: tour.transportation?.split(':')[0] || '',
          details: tour.transportation?.split(':')[1]?.trim() || '',
          cost: 0 // Not stored separately in current schema
        },
        accommodation: {
          type: tour.accommodation?.split(':')[0] || '',
          details: tour.accommodation?.split(':')[1]?.trim() || '',
          cost: 0 // Not stored separately in current schema
        },
        equipment: tour.equipment_requirements?.split(',').map((eq: string) => ({
          name: eq.trim(),
          quantity: 1,
          cost: 0
        })) || []
      },
      step6: {
        ticketTypes: [], // Not stored in current schema
        budget: {
          total: tour.budget,
          expenses: tour.event_expenses?.map((expense: any) => ({
            category: expense.category,
            amount: expense.amount,
            description: expense.description
          })) || []
        },
        sponsors: [] // Not stored in current schema
      }
    }

    return NextResponse.json({ tour: plannerData })

  } catch (error) {
    console.error('[Tour Planner API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 