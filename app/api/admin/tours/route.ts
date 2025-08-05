import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Tours API] GET request started')
    
    // Return mock tours data
    const mockTours = [
      {
        id: '1',
        name: 'Summer Festival Tour',
        status: 'active',
        start_date: '2024-06-15',
        end_date: '2024-08-15',
        revenue: 45000,
        created_at: '2024-05-01T10:00:00Z'
      },
      {
        id: '2',
        name: 'Winter Arena Tour',
        status: 'active',
        start_date: '2024-12-01',
        end_date: '2025-02-28',
        revenue: 32000,
        created_at: '2024-06-15T14:30:00Z'
      },
      {
        id: '3',
        name: 'Spring Club Tour',
        status: 'completed',
        start_date: '2024-03-01',
        end_date: '2024-05-31',
        revenue: 28000,
        created_at: '2024-02-01T09:15:00Z'
      }
    ]

    console.log('[Admin Tours API] Returning mock tours')

    return NextResponse.json({
      success: true,
      tours: mockTours,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Tours API] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tours',
      tours: [],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 