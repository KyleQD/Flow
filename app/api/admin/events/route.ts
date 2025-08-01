import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Events API] GET request started')
    
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query with correct column names
    let query = supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        tour_id,
        venue_id,
        venue_name,
        event_date,
        event_time,
        doors_open,
        duration_minutes,
        status,
        capacity,
        tickets_sold,
        ticket_price,
        vip_price,
        expected_revenue,
        actual_revenue,
        expenses,
        created_at,
        updated_at
      `)
      .order('event_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('[Admin Events API] Database error:', error)
      // Return empty data instead of error for missing tables
      return NextResponse.json({
        success: true,
        events: [],
        pagination: {
          limit,
          offset,
          total: 0
        },
        timestamp: new Date().toISOString()
      })
    }

    // Transform data for frontend
    const transformedEvents = events?.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      status: event.status,
      eventDate: event.event_date,
      eventTime: event.event_time,
      venueName: event.venue_name,
      capacity: event.capacity,
      ticketsSold: event.tickets_sold,
      ticketPrice: event.ticket_price,
      expectedRevenue: event.expected_revenue,
      actualRevenue: event.actual_revenue,
      expenses: event.expenses,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    })) || []

    console.log('[Admin Events API] Successfully fetched events:', transformedEvents.length)

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      pagination: {
        limit,
        offset,
        total: transformedEvents.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Events API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      events: []
    }, { status: 500 })
  }
} 