import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Logistics Metrics API] GET request started')
    
    // For now, return mock data to test the endpoint
    const mockMetrics = {
      transportation: { percentage: 75, items: 8, completed: 6, status: 'In Progress' },
      accommodations: { percentage: 90, items: 12, completed: 11, status: 'Confirmed' },
      equipment: { percentage: 60, items: 15, completed: 9, status: 'In Progress' },
      backline: { percentage: 80, items: 10, completed: 8, status: 'In Progress' },
      rentals: { percentage: 40, items: 5, completed: 2, status: 'Active', revenue: 2500 },
      lodging: { percentage: 85, items: 8, completed: 7, status: 'Active', revenue: 4200 },
      travelCoordination: { percentage: 70, items: 6, completed: 4, status: 'In Progress', travelers: 24 },
      catering: { percentage: 30, items: 5, completed: 1, status: 'Not Started' },
      communication: { percentage: 95, items: 16, completed: 15, status: 'Active' }
    }

    console.log('[Logistics Metrics API] Returning mock metrics')

    return NextResponse.json({
      success: true,
      metrics: mockMetrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Logistics Metrics API] Error:', error)
    
    // Return default metrics on error
    const defaultMetrics = {
      transportation: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      equipment: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      backline: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      rentals: { percentage: 0, items: 0, completed: 0, status: 'No Rentals', revenue: 0 },
      lodging: { percentage: 0, items: 0, completed: 0, status: 'No Bookings', revenue: 0 },
      travelCoordination: { percentage: 0, items: 0, completed: 0, status: 'Not Started', travelers: 0 },
      accommodations: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      catering: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      communication: { percentage: 0, items: 0, completed: 0, status: 'Not Started' }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch logistics metrics',
      metrics: defaultMetrics,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 