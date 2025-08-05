import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Events API] GET request started')
    
    // Return mock events data
    const mockEvents = [
      {
        id: '1',
        name: 'Summer Music Festival',
        status: 'upcoming',
        event_date: '2024-07-15T18:00:00Z',
        capacity: 5000,
        ticket_price: 75,
        venue_id: 'venue-1',
        created_at: '2024-05-01T10:00:00Z'
      },
      {
        id: '2',
        name: 'Winter Concert Series',
        status: 'upcoming',
        event_date: '2024-12-20T19:30:00Z',
        capacity: 2000,
        ticket_price: 45,
        venue_id: 'venue-2',
        created_at: '2024-06-15T14:30:00Z'
      },
      {
        id: '3',
        name: 'Spring Jazz Night',
        status: 'completed',
        event_date: '2024-04-10T20:00:00Z',
        capacity: 800,
        ticket_price: 35,
        venue_id: 'venue-3',
        created_at: '2024-03-01T09:15:00Z'
      }
    ]

    console.log('[Admin Events API] Returning mock events')

    return NextResponse.json({
      success: true,
      events: mockEvents,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Events API] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch events',
      events: [],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 