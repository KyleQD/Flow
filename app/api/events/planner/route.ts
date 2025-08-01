import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const plannerId = url.searchParams.get('id')

    if (plannerId) {
      // Get specific event planner data
      const { data: plannerData, error } = await supabase
        .from('event_planner_data')
        .select(`
          *,
          event_templates (
            name,
            icon,
            category,
            presets
          )
        `)
        .eq('id', plannerId)
        .single()

      if (error) {
        console.error('Error fetching event planner data:', error)
        return NextResponse.json({ error: 'Failed to fetch event planner data' }, { status: 500 })
      }

      return NextResponse.json({ plannerData })
    } else {
      // Get all event planner data for user
      const { data: plannerData, error } = await supabase
        .from('event_planner_data')
        .select(`
          *,
          event_templates (
            name,
            icon,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching event planner data:', error)
        return NextResponse.json({ error: 'Failed to fetch event planner data' }, { status: 500 })
      }

      return NextResponse.json({ plannerData })
    }
  } catch (error) {
    console.error('Event planner API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(body)
    
    const plannerData = {
      user_id: user.id,
      name: body.name,
      description: body.description,
      template_id: body.template ? body.template : null,
      event_type: body.eventType,
      primary_contact: body.primaryContact,
      estimated_budget: body.estimatedBudget || 0,
      privacy: body.privacy || 'public',
      venues: JSON.stringify(body.venues || []),
      schedule: JSON.stringify(body.schedule || []),
      ticket_types: JSON.stringify(body.ticketTypes || []),
      registration_forms: JSON.stringify(body.registrationForms || []),
      promo_codes: JSON.stringify(body.promoCodes || []),
      team_members: JSON.stringify(body.teamMembers || []),
      campaigns: JSON.stringify(body.campaigns || []),
      budget: JSON.stringify(body.budget || {}),
      checklist: JSON.stringify(body.checklist || []),
      publish_status: body.publishStatus || 'draft',
      current_step: body.currentStep || 1,
      completion_percentage: completionPercentage
    }

    const { data, error } = await supabase
      .from('event_planner_data')
      .insert([plannerData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event planner data:', error)
      return NextResponse.json({ error: 'Failed to create event planner data' }, { status: 500 })
    }

    // Log activity
    await logActivity(supabase, data.id, user.id, 'CREATE', 'Created new event planner')

    return NextResponse.json({ plannerData: data }, { status: 201 })
  } catch (error) {
    console.error('Event planner creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plannerId = body.id

    if (!plannerId) {
      return NextResponse.json({ error: 'Planner ID is required' }, { status: 400 })
    }

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(body)

    const updateData = {
      name: body.name,
      description: body.description,
      template_id: body.template ? body.template : null,
      event_type: body.eventType,
      primary_contact: body.primaryContact,
      estimated_budget: body.estimatedBudget || 0,
      privacy: body.privacy || 'public',
      venues: JSON.stringify(body.venues || []),
      schedule: JSON.stringify(body.schedule || []),
      ticket_types: JSON.stringify(body.ticketTypes || []),
      registration_forms: JSON.stringify(body.registrationForms || []),
      promo_codes: JSON.stringify(body.promoCodes || []),
      team_members: JSON.stringify(body.teamMembers || []),
      campaigns: JSON.stringify(body.campaigns || []),
      budget: JSON.stringify(body.budget || {}),
      checklist: JSON.stringify(body.checklist || []),
      publish_status: body.publishStatus || 'draft',
      current_step: body.currentStep || 1,
      completion_percentage: completionPercentage
    }

    const { data, error } = await supabase
      .from('event_planner_data')
      .update(updateData)
      .eq('id', plannerId)
      .eq('user_id', user.id) // Ensure user can only update their own data
      .select()
      .single()

    if (error) {
      console.error('Error updating event planner data:', error)
      return NextResponse.json({ error: 'Failed to update event planner data' }, { status: 500 })
    }

    // Log activity
    await logActivity(supabase, plannerId, user.id, 'UPDATE', 'Updated event planner data')

    return NextResponse.json({ plannerData: data })
  } catch (error) {
    console.error('Event planner update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const plannerId = url.searchParams.get('id')

    if (!plannerId) {
      return NextResponse.json({ error: 'Planner ID is required' }, { status: 400 })
    }

    // Log activity before deletion
    await logActivity(supabase, plannerId, user.id, 'DELETE', 'Deleted event planner')

    const { error } = await supabase
      .from('event_planner_data')
      .delete()
      .eq('id', plannerId)
      .eq('user_id', user.id) // Ensure user can only delete their own data

    if (error) {
      console.error('Error deleting event planner data:', error)
      return NextResponse.json({ error: 'Failed to delete event planner data' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Event planner deleted successfully' })
  } catch (error) {
    console.error('Event planner deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate completion percentage
function calculateCompletionPercentage(eventData: any): number {
  let totalItems = 0
  let completedItems = 0
  
  // Step 1 - Event Initiation (6 items)
  totalItems += 6
  if (eventData.name) completedItems++
  if (eventData.description) completedItems++
  if (eventData.template) completedItems++
  if (eventData.eventType) completedItems++
  if (eventData.primaryContact) completedItems++
  if (eventData.estimatedBudget > 0) completedItems++
  
  // Step 2 - Venue & Schedule (2 items)
  totalItems += 2
  if (eventData.venues && eventData.venues.length > 0) completedItems++
  if (eventData.schedule && eventData.schedule.length > 0) completedItems++
  
  // Step 3 - Ticketing & Registration (3 items)
  totalItems += 3
  if (eventData.ticketTypes && eventData.ticketTypes.length > 0) completedItems++
  if (eventData.registrationForms && eventData.registrationForms.length > 0) completedItems++
  if (eventData.promoCodes && eventData.promoCodes.length > 0) completedItems++
  
  // Step 4 - Team & Permissions (1 item)
  totalItems += 1
  if (eventData.teamMembers && eventData.teamMembers.length > 0) completedItems++
  
  // Step 5 - Marketing & Promotion (1 item)
  totalItems += 1
  if (eventData.campaigns && eventData.campaigns.length > 0) completedItems++
  
  // Step 6 - Financials & Reporting (1 item)
  totalItems += 1
  if (eventData.budget && eventData.budget.totalBudget > 0) completedItems++
  
  // Step 7 - Review & Publish (1 item)
  totalItems += 1
  if (eventData.publishStatus === 'published') completedItems++
  
  return Math.round((completedItems / totalItems) * 100)
}

// Helper function to log activity
async function logActivity(
  supabase: any,
  plannerId: string,
  userId: string,
  activityType: string,
  description: string,
  metadata: any = {}
) {
  try {
    await supabase
      .from('event_planner_activity_log')
      .insert([{
        event_planner_id: plannerId,
        user_id: userId,
        activity_type: activityType,
        activity_description: description,
        metadata: JSON.stringify(metadata)
      }])
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw error to avoid breaking main operation
  }
} 