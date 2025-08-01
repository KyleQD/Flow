import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock categories for now until database migration is run
    const mockCategories = [
      { id: '1', name: 'Opening Slots', description: 'Opening act opportunities', icon: 'Music', color: '#8B5CF6', is_active: true },
      { id: '2', name: 'Venue Bookings', description: 'Direct booking opportunities', icon: 'MapPin', color: '#10B981', is_active: true },
      { id: '3', name: 'Collaborations', description: 'Music collaborations', icon: 'Users', color: '#F59E0B', is_active: true },
      { id: '4', name: 'Session Work', description: 'Studio session opportunities', icon: 'Mic', color: '#EF4444', is_active: true },
      { id: '5', name: 'Production', description: 'Music production opportunities', icon: 'Settings', color: '#6366F1', is_active: true },
    ]

    return NextResponse.json({
      success: true,
      data: mockCategories
    })
  } catch (error) {
    console.error('Error in GET /api/artist-jobs/categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      },
      { status: 500 }
    )
  }
} 