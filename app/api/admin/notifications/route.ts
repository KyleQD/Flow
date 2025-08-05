import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Notifications API] GET request started')
    
    // Return mock notifications data
    const mockNotifications = [
      {
        id: '1',
        title: 'New Tour Created',
        message: 'Summer Festival Tour has been created successfully',
        type: 'success',
        created_at: '2024-08-04T10:30:00Z',
        read: false
      },
      {
        id: '2',
        title: 'Event Reminder',
        message: 'Winter Concert Series starts in 2 weeks',
        type: 'info',
        created_at: '2024-08-04T09:15:00Z',
        read: true
      },
      {
        id: '3',
        title: 'Revenue Update',
        message: 'Monthly revenue target exceeded by 15%',
        type: 'success',
        created_at: '2024-08-03T16:45:00Z',
        read: false
      }
    ]

    console.log('[Admin Notifications API] Returning mock notifications')

    return NextResponse.json({
      success: true,
      notifications: mockNotifications,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Notifications API] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications',
      notifications: [],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 