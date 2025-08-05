import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Helper function to parse auth from cookies
function parseAuthFromCookies(request: NextRequest) {
  const cookies = request.cookies
  
  // Check for the main auth cookie first
  const authCookie = cookies.get('sb-tourify-auth-token')?.value
  
  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie)
      return {
        accessToken: parsed.access_token,
        refreshToken: parsed.refresh_token
      }
    } catch (error) {
      console.error('[API Auth] Error parsing auth cookie:', error)
    }
  }
  
  // Fallback to separate cookies
  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value
  
  if (!accessToken || !refreshToken) {
    return null
  }
  
  return { accessToken, refreshToken }
}

// PUT /api/events/[id]/update - Update event details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceRoleClient()
    const resolvedParams = await params
    const eventId = resolvedParams.id
    
    // Parse auth from cookies
    const auth = parseAuthFromCookies(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from auth token
    const { data: user } = await supabase.auth.getUser(auth.accessToken)
    if (!user.user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      description,
      type,
      venue_name,
      venue_address,
      venue_city,
      venue_state,
      venue_country,
      event_date,
      start_time,
      end_time,
      doors_open,
      ticket_url,
      ticket_price_min,
      ticket_price_max,
      capacity,
      expected_attendance,
      status,
      age_restriction,
      image_url,
      poster_url
    } = body

    // Verify user owns this event
    const { data: existingEvent, error: verifyError } = await supabase
      .from('artist_events')
      .select('user_id')
      .eq('id', eventId)
      .single()

    if (verifyError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (existingEvent.user_id !== user.user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this event' }, { status: 403 })
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (venue_name !== undefined) updateData.venue_name = venue_name
    if (venue_address !== undefined) updateData.venue_address = venue_address
    if (venue_city !== undefined) updateData.venue_city = venue_city
    if (venue_state !== undefined) updateData.venue_state = venue_state
    if (venue_country !== undefined) updateData.venue_country = venue_country
    if (event_date !== undefined) updateData.event_date = event_date
    if (start_time !== undefined) updateData.start_time = start_time
    if (end_time !== undefined) updateData.end_time = end_time
    if (doors_open !== undefined) updateData.doors_open = doors_open
    if (ticket_url !== undefined) updateData.ticket_url = ticket_url
    if (ticket_price_min !== undefined) updateData.ticket_price_min = ticket_price_min
    if (ticket_price_max !== undefined) updateData.ticket_price_max = ticket_price_max
    if (capacity !== undefined) updateData.capacity = capacity
    if (expected_attendance !== undefined) updateData.expected_attendance = expected_attendance
    if (status !== undefined) updateData.status = status
    if (age_restriction !== undefined) updateData.age_restriction = age_restriction
    if (image_url !== undefined) updateData.image_url = image_url
    if (poster_url !== undefined) updateData.poster_url = poster_url

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update the event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('artist_events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating event:', updateError)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      event: updatedEvent,
      message: 'Event updated successfully'
    })

  } catch (error) {
    console.error('Error in event update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 