import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Travel Coordination Dashboard API] GET request started')
    
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

    // Fetch comprehensive travel coordination data
    const [
      groupsResult,
      flightsResult,
      transportationResult,
      analyticsResult,
      recentActivityResult
    ] = await Promise.allSettled([
      // Travel groups with member counts
      supabase
        .from('travel_groups')
        .select(`
          id,
          name,
          group_type,
          total_members,
          confirmed_members,
          coordination_status,
          status,
          arrival_date,
          departure_date,
          created_at
        `)
        .order('created_at', { ascending: false }),

      // Flight coordination
      supabase
        .from('flight_coordination')
        .select(`
          id,
          flight_number,
          airline,
          departure_airport,
          arrival_airport,
          departure_time,
          arrival_time,
          status,
          booked_seats,
          total_seats,
          group_id,
          created_at
        `)
        .order('departure_time', { ascending: true }),

      // Ground transportation
      supabase
        .from('ground_transportation_coordination')
        .select(`
          id,
          transport_type,
          provider_name,
          pickup_location,
          dropoff_location,
          pickup_time,
          status,
          assigned_passengers,
          vehicle_capacity,
          group_id,
          created_at
        `)
        .order('pickup_time', { ascending: true }),

      // Analytics data
      supabase
        .from('travel_coordination_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30),

      // Recent activity (from timeline)
      supabase
        .from('travel_coordination_timeline')
        .select(`
          id,
          entry_type,
          title,
          description,
          start_time,
          status,
          group_id,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    // Process results with error handling
    const groups = groupsResult.status === 'fulfilled' && !groupsResult.value.error ? groupsResult.value.data || [] : []
    const flights = flightsResult.status === 'fulfilled' && !flightsResult.value.error ? flightsResult.value.data || [] : []
    const transportation = transportationResult.status === 'fulfilled' && !transportationResult.value.error ? transportationResult.value.data || [] : []
    const analytics = analyticsResult.status === 'fulfilled' && !analyticsResult.value.error ? analyticsResult.value.data || [] : []
    const recentActivity = recentActivityResult.status === 'fulfilled' && !recentActivityResult.value.error ? recentActivityResult.value.data || [] : []

    // Calculate dashboard metrics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Group statistics
    const totalGroups = groups.length
    const totalTravelers = groups.reduce((sum, group) => sum + (group.total_members || 0), 0)
    const confirmedTravelers = groups.reduce((sum, group) => sum + (group.confirmed_members || 0), 0)
    const fullyCoordinatedGroups = groups.filter(g => g.coordination_status === 'complete').length
    const coordinationCompletionRate = totalGroups > 0 ? Math.round((fullyCoordinatedGroups / totalGroups) * 100) : 0

    // Flight statistics
    const totalFlights = flights.length
    const activeFlights = flights.filter(f => f.status === 'scheduled' || f.status === 'confirmed').length
    const completedFlights = flights.filter(f => f.status === 'landed' || f.status === 'completed').length
    const totalFlightSeats = flights.reduce((sum, flight) => sum + (flight.total_seats || 0), 0)
    const bookedFlightSeats = flights.reduce((sum, flight) => sum + (flight.booked_seats || 0), 0)
    const flightUtilizationRate = totalFlightSeats > 0 ? Math.round((bookedFlightSeats / totalFlightSeats) * 100) : 0

    // Transportation statistics
    const totalTransportRuns = transportation.length
    const activeTransport = transportation.filter(t => t.status === 'scheduled' || t.status === 'en_route').length
    const completedTransport = transportation.filter(t => t.status === 'completed').length
    const totalTransportCapacity = transportation.reduce((sum, transport) => sum + (transport.vehicle_capacity || 0), 0)
    const assignedPassengers = transportation.reduce((sum, transport) => sum + (transport.assigned_passengers || 0), 0)
    const transportUtilizationRate = totalTransportCapacity > 0 ? Math.round((assignedPassengers / totalTransportCapacity) * 100) : 0

    // Recent activity processing
    const processedActivity = recentActivity.map(activity => ({
      id: activity.id,
      type: activity.entry_type,
      title: activity.title,
      description: activity.description,
      time: activity.start_time,
      status: activity.status,
      timestamp: activity.created_at
    }))

    // Group by type for quick insights
    const groupsByType = groups.reduce((acc, group) => {
      const type = group.group_type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(group)
      return acc
    }, {} as Record<string, any[]>)

    const groupTypeStats = Object.entries(groupsByType).map(([type, typeGroups]) => ({
      type,
      count: typeGroups.length,
      totalMembers: typeGroups.reduce((sum, group) => sum + (group.total_members || 0), 0),
      confirmedMembers: typeGroups.reduce((sum, group) => sum + (group.confirmed_members || 0), 0)
    }))

    // Upcoming coordination needs
    const upcomingFlights = flights.filter(f => {
      const departureTime = new Date(f.departure_time)
      return departureTime > now && departureTime <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    })

    const upcomingTransport = transportation.filter(t => {
      const pickupTime = new Date(t.pickup_time)
      return pickupTime > now && pickupTime <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    })

    const dashboardData = {
      // Summary metrics
      summary: {
        totalGroups,
        totalTravelers,
        confirmedTravelers,
        coordinationCompletionRate,
        fullyCoordinatedGroups,
        totalFlights,
        activeFlights,
        completedFlights,
        flightUtilizationRate,
        totalTransportRuns,
        activeTransport,
        completedTransport,
        transportUtilizationRate
      },

      // Detailed breakdowns
      breakdowns: {
        groupTypes: groupTypeStats,
        flightStatus: {
          scheduled: flights.filter(f => f.status === 'scheduled').length,
          confirmed: flights.filter(f => f.status === 'confirmed').length,
          boarding: flights.filter(f => f.status === 'boarding').length,
          inFlight: flights.filter(f => f.status === 'in_flight').length,
          landed: flights.filter(f => f.status === 'landed').length,
          delayed: flights.filter(f => f.status === 'delayed').length,
          cancelled: flights.filter(f => f.status === 'cancelled').length
        },
        transportStatus: {
          scheduled: transportation.filter(t => t.status === 'scheduled').length,
          enRoute: transportation.filter(t => t.status === 'en_route').length,
          arrived: transportation.filter(t => t.status === 'arrived').length,
          completed: transportation.filter(t => t.status === 'completed').length,
          delayed: transportation.filter(t => t.status === 'delayed').length,
          cancelled: transportation.filter(t => t.status === 'cancelled').length
        }
      },

      // Recent activity
      recentActivity: processedActivity,

      // Upcoming coordination
      upcoming: {
        flights: upcomingFlights.length,
        transport: upcomingTransport.length,
        nextFlight: upcomingFlights[0] || null,
        nextTransport: upcomingTransport[0] || null
      },

      // Analytics trends
      trends: analytics.length > 0 ? {
        lastWeek: analytics.slice(0, 7),
        lastMonth: analytics.slice(0, 30),
        coordinationTrend: analytics.map(a => ({
          date: a.date,
          completionRate: a.coordination_completion_rate,
          totalGroups: a.total_groups,
          totalTravelers: a.total_travelers
        }))
      } : null
    }

    console.log('[Travel Coordination Dashboard API] Data processed successfully')

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Travel Coordination Dashboard API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      data: {
        summary: {
          totalGroups: 0,
          totalTravelers: 0,
          confirmedTravelers: 0,
          coordinationCompletionRate: 0,
          fullyCoordinatedGroups: 0,
          totalFlights: 0,
          activeFlights: 0,
          completedFlights: 0,
          flightUtilizationRate: 0,
          totalTransportRuns: 0,
          activeTransport: 0,
          completedTransport: 0,
          transportUtilizationRate: 0
        },
        breakdowns: {
          groupTypes: [],
          flightStatus: {},
          transportStatus: {}
        },
        recentActivity: [],
        upcoming: {
          flights: 0,
          transport: 0,
          nextFlight: null,
          nextTransport: null
        },
        trends: null
      }
    }, { status: 500 })
  }
} 