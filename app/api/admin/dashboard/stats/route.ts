import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Dashboard Stats API] GET request started')
    
    // Return mock dashboard statistics
    const mockStats = {
      totalTours: 12,
      activeTours: 8,
      totalEvents: 45,
      upcomingEvents: 18,
      totalArtists: 156,
      totalVenues: 89,
      totalRevenue: 125000,
      monthlyRevenue: 18500,
      ticketsSold: 2340,
      totalCapacity: 5000,
      staffMembers: 24,
      completedTasks: 156,
      pendingTasks: 23,
      averageRating: 4.7,
      // Travel coordination metrics
      totalTravelGroups: 6,
      totalTravelers: 24,
      confirmedTravelers: 18,
      coordinationCompletionRate: 75,
      fullyCoordinatedGroups: 4,
      // Logistics metrics
      activeTransportation: 8,
      completedTransportation: 6,
      logisticsCompletionRate: 65
    }

    console.log('[Admin Dashboard Stats API] Returning mock stats')

    return NextResponse.json({
      success: true,
      stats: mockStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Dashboard Stats API] Error:', error)
    
    // Return default stats on error
    const defaultStats = {
      totalTours: 0,
      activeTours: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      totalArtists: 0,
      totalVenues: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      ticketsSold: 0,
      totalCapacity: 0,
      staffMembers: 0,
      completedTasks: 0,
      pendingTasks: 0,
      averageRating: 0,
      totalTravelGroups: 0,
      totalTravelers: 0,
      confirmedTravelers: 0,
      coordinationCompletionRate: 0,
      fullyCoordinatedGroups: 0,
      activeTransportation: 0,
      completedTransportation: 0,
      logisticsCompletionRate: 0
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      stats: defaultStats,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 