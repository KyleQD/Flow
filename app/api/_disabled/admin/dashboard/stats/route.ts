import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Dashboard Stats API] GET request started')
    
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

    // Fetch dashboard statistics from database with correct column names
    const [
      toursResult,
      eventsResult,
      artistsResult,
      venuesResult,
      revenueResult,
      ticketsResult,
      staffResult,
      travelGroupsResult,
      travelCoordinationResult,
      logisticsResult
    ] = await Promise.allSettled([
      // Tours stats with correct column names
      supabase
        .from('tours')
        .select(`
          id, 
          status, 
          created_at,
          revenue,
          start_date,
          end_date
        `)
        .order('created_at', { ascending: false }),

      // Events stats with correct column names
      supabase
        .from('events')
        .select(`
          id, 
          status, 
          event_date, 
          capacity, 
          ticket_price,
          created_at,
          venue_id
        `)
        .order('event_date', { ascending: false }),

      // Artists stats (using artist_profiles table)
      supabase
        .from('artist_profiles')
        .select('id, verification_status, created_at'),

      // Venues stats (using venue_profiles table)
      supabase
        .from('venue_profiles')
        .select('id, verification_status, capacity'),

      // Revenue stats (from ticket_sales table)
      supabase
        .from('ticket_sales')
        .select('total_amount, purchase_date, payment_status')
        .gte('purchase_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // Ticket stats
      supabase
        .from('ticket_sales')
        .select('quantity, total_amount, purchase_date, payment_status'),

      // Staff stats
      supabase
        .from('staff_profiles')
        .select('id, status, department'),

      // Travel coordination stats
      supabase
        .from('travel_groups')
        .select('id, total_members, confirmed_members, coordination_status, status, created_at'),

      // Travel coordination analytics
      supabase
        .from('travel_coordination_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30),

      // Logistics stats (transportation, equipment, rentals)
      supabase
        .from('transportation')
        .select('id, status, created_at')
    ])

    // Process results and calculate stats with error handling
    const tours = toursResult.status === 'fulfilled' && !toursResult.value.error ? toursResult.value.data || [] : []
    const events = eventsResult.status === 'fulfilled' && !eventsResult.value.error ? eventsResult.value.data || [] : []
    const artists = artistsResult.status === 'fulfilled' && !artistsResult.value.error ? artistsResult.value.data || [] : []
    const venues = venuesResult.status === 'fulfilled' && !venuesResult.value.error ? venuesResult.value.data || [] : []
    const revenue = revenueResult.status === 'fulfilled' && !revenueResult.value.error ? revenueResult.value.data || [] : []
    const tickets = ticketsResult.status === 'fulfilled' && !ticketsResult.value.error ? ticketsResult.value.data || [] : []
    const staff = staffResult.status === 'fulfilled' && !staffResult.value.error ? staffResult.value.data || [] : []
    const travelGroups = travelGroupsResult.status === 'fulfilled' && !travelGroupsResult.value.error ? travelGroupsResult.value.data || [] : []
    const travelAnalytics = travelCoordinationResult.status === 'fulfilled' && !travelCoordinationResult.value.error ? travelCoordinationResult.value.data || [] : []
    const logistics = logisticsResult.status === 'fulfilled' && !logisticsResult.value.error ? logisticsResult.value.data || [] : []

    // Debug logging
    console.log('[Admin Dashboard Stats API] Raw data counts:', {
      tours: tours.length,
      events: events.length,
      artists: artists.length,
      venues: venues.length,
      revenue: revenue.length,
      tickets: tickets.length,
      staff: staff.length,
      travelGroups: travelGroups.length,
      travelAnalytics: travelAnalytics.length,
      logistics: logistics.length
    })

    // Calculate dashboard statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Calculate total revenue from tours and ticket sales
    const tourRevenue = tours.reduce((sum: number, tour: any) => sum + parseFloat(tour.revenue || 0), 0)
    const ticketRevenue = (revenue as any[])
      .filter((r: any) => r.payment_status === 'paid')
      .reduce((sum: number, r: any) => sum + parseFloat(r.total_amount || 0), 0)
    const totalRevenue = tourRevenue + ticketRevenue

    // Calculate monthly revenue
    const monthlyTicketRevenue = (revenue as any[])
      .filter((r: any) => r.payment_status === 'paid' && new Date(r.purchase_date) >= thirtyDaysAgo)
      .reduce((sum: number, r: any) => sum + parseFloat(r.total_amount || 0), 0)
    const monthlyTourRevenue = (tours as any[])
      .filter((t: any) => new Date(t.created_at) >= thirtyDaysAgo)
      .reduce((sum: number, t: any) => sum + parseFloat(t.revenue || 0), 0)
    const monthlyRevenue = monthlyTicketRevenue + monthlyTourRevenue

    // Calculate tickets sold
    const ticketsSold = (tickets as any[])
      .filter((t: any) => t.payment_status === 'paid')
      .reduce((sum: number, t: any) => sum + (t.quantity || 0), 0)

    // Calculate total capacity
    const totalCapacity = (events as any[]).reduce((sum: number, e: any) => sum + (e.capacity || 0), 0)

    // Calculate travel coordination stats
    const totalTravelGroups = travelGroups.length
    const totalTravelers = (travelGroups as any[]).reduce((sum: number, group: any) => sum + (group.total_members || 0), 0)
    const confirmedTravelers = (travelGroups as any[]).reduce((sum: number, group: any) => sum + (group.confirmed_members || 0), 0)
    const fullyCoordinatedGroups = (travelGroups as any[]).filter((g: any) => g.coordination_status === 'complete').length
    const coordinationCompletionRate = totalTravelGroups > 0 ? Math.round((fullyCoordinatedGroups / totalTravelGroups) * 100) : 0

    // Calculate logistics stats
    const activeTransportation = (logistics as any[]).filter((t: any) => t.status === 'active' || t.status === 'scheduled').length
    const completedTransportation = (logistics as any[]).filter((t: any) => t.status === 'completed').length
    const logisticsCompletionRate = logistics.length > 0 ? Math.round((completedTransportation / logistics.length) * 100) : 0

    const stats = {
      totalTours: tours.length,
      activeTours: (tours as Array<{ status?: string }>).filter((t) => t.status === 'active').length,
      totalEvents: events.length,
      upcomingEvents: (events as Array<{ event_date?: string }>).filter((e) => new Date(e.event_date as string) > now).length,
      totalArtists: artists.length,
      totalVenues: venues.length,
      totalRevenue: totalRevenue,
      monthlyRevenue: monthlyRevenue,
      ticketsSold: ticketsSold,
      totalCapacity: totalCapacity,
      staffMembers: staff.length,
      completedTasks: 147, // Mock data for now
      pendingTasks: 23, // Mock data for now
      averageRating: 4.7, // Mock data for now
      // Travel coordination metrics
      totalTravelGroups: totalTravelGroups,
      totalTravelers: totalTravelers,
      confirmedTravelers: confirmedTravelers,
      coordinationCompletionRate: coordinationCompletionRate,
      fullyCoordinatedGroups: fullyCoordinatedGroups,
      // Logistics metrics
      activeTransportation: activeTransportation,
      completedTransportation: completedTransportation,
      logisticsCompletionRate: logisticsCompletionRate
    }

    console.log('[Admin Dashboard Stats API] Calculated stats:', stats)

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Dashboard Stats API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      stats: {
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
        // Travel coordination metrics
        totalTravelGroups: 0,
        totalTravelers: 0,
        confirmedTravelers: 0,
        coordinationCompletionRate: 0,
        fullyCoordinatedGroups: 0,
        // Logistics metrics
        activeTransportation: 0,
        completedTransportation: 0,
        logisticsCompletionRate: 0
      }
    }, { status: 500 })
  }
} 