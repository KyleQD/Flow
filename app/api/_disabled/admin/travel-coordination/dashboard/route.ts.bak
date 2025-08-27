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
    const totalTravelers = (groups as Array<{ total_members?: number }>).reduce((sum: number, group: { total_members?: number }) => sum + (group.total_members || 0), 0)
    const confirmedTravelers = (groups as Array<{ confirmed_members?: number }>).reduce((sum: number, group: { confirmed_members?: number }) => sum + (group.confirmed_members || 0), 0)
    const fullyCoordinatedGroups = (groups as Array<{ coordination_status?: string }>).filter((g: { coordination_status?: string }) => g.coordination_status === 'complete').length
    const coordinationCompletionRate = totalGroups > 0 ? Math.round((fullyCoordinatedGroups / totalGroups) * 100) : 0

    // Flight statistics
    const totalFlights = flights.length
    const activeFlights = (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'scheduled' || f.status === 'confirmed').length
    const completedFlights = (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'landed' || f.status === 'completed').length
    const totalFlightSeats = (flights as Array<{ total_seats?: number }>).reduce((sum: number, flight: { total_seats?: number }) => sum + (flight.total_seats || 0), 0)
    const bookedFlightSeats = (flights as Array<{ booked_seats?: number }>).reduce((sum: number, flight: { booked_seats?: number }) => sum + (flight.booked_seats || 0), 0)
    const flightUtilizationRate = totalFlightSeats > 0 ? Math.round((bookedFlightSeats / totalFlightSeats) * 100) : 0

    // Transportation statistics
    const totalTransportRuns = transportation.length
    const activeTransport = (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'scheduled' || t.status === 'en_route').length
    const completedTransport = (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'completed').length
    const totalTransportCapacity = (transportation as Array<{ vehicle_capacity?: number }>).reduce((sum: number, transport: { vehicle_capacity?: number }) => sum + (transport.vehicle_capacity || 0), 0)
    const assignedPassengers = (transportation as Array<{ assigned_passengers?: number }>).reduce((sum: number, transport: { assigned_passengers?: number }) => sum + (transport.assigned_passengers || 0), 0)
    const transportUtilizationRate = totalTransportCapacity > 0 ? Math.round((assignedPassengers / totalTransportCapacity) * 100) : 0

    // Recent activity processing
    const processedActivity = (recentActivity as Array<any>).map((activity: any) => ({
      id: activity.id,
      type: activity.entry_type,
      title: activity.title,
      description: activity.description,
      time: activity.start_time,
      status: activity.status,
      timestamp: activity.created_at
    }))

    // Group by type for quick insights
    const groupsByType = (groups as Array<{ group_type?: string }>).reduce((acc: Record<string, any[]>, group: { group_type?: string }) => {
      const type = group.group_type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(group as any)
      return acc
    }, {} as Record<string, any[]>)

    const groupTypeStats = Object.entries(groupsByType).map(([type, typeGroups]) => ({
      type,
      count: typeGroups.length,
      totalMembers: (typeGroups as Array<{ total_members?: number }>).reduce((sum: number, group: { total_members?: number }) => sum + (group.total_members || 0), 0),
      confirmedMembers: (typeGroups as Array<{ confirmed_members?: number }>).reduce((sum: number, group: { confirmed_members?: number }) => sum + (group.confirmed_members || 0), 0)
    }))

    // Upcoming coordination needs
    const upcomingFlights = (flights as Array<{ departure_time?: string }>).filter((f: { departure_time?: string }) => {
      const departureTime = new Date(f.departure_time as string)
      return departureTime > now && departureTime <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    })

    const upcomingTransport = (transportation as Array<{ pickup_time?: string }>).filter((t: { pickup_time?: string }) => {
      const pickupTime = new Date(t.pickup_time as string)
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
          scheduled: (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'scheduled').length,
          confirmed: (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'confirmed').length,
          boarding: (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'boarding').length,
          inFlight: (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'in_flight').length,
          landed: (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'landed').length,
          delayed: (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'delayed').length,
          cancelled: (flights as Array<{ status?: string }>).filter((f: { status?: string }) => f.status === 'cancelled').length
        },
        transportStatus: {
          scheduled: (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'scheduled').length,
          enRoute: (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'en_route').length,
          arrived: (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'arrived').length,
          completed: (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'completed').length,
          delayed: (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'delayed').length,
          cancelled: (transportation as Array<{ status?: string }>).filter((t: { status?: string }) => t.status === 'cancelled').length
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
        coordinationTrend: (analytics as Array<{ date?: string; coordination_completion_rate?: number; total_groups?: number; total_travelers?: number }>).
          map((a: { date?: string; coordination_completion_rate?: number; total_groups?: number; total_travelers?: number }) => ({
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