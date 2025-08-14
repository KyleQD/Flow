import { NextRequest, NextResponse } from 'next/server'

// Use Supabase as the source of truth
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '7')
    const accountId = searchParams.get('accountId') || ''
    const scope = searchParams.get('scope') || 'dashboard'

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Base events query (organizer-scoped when accountId provided)
    let eventsQuery = supabase
      .from('events')
      .select('id, title, start_date, capacity')
      .gte('start_date', startDate.toISOString())
      .order('start_date', { ascending: true })

    if (accountId) eventsQuery = eventsQuery.eq('organizer_id', accountId)

    const { data: events, error: eventsError } = await eventsQuery
    if (eventsError) throw eventsError

    // Try bookings if available; fall back gracefully
    let totalBookings = 0
    let statusDistribution: Record<string, number> = {}
    let revenueTrend: Array<{ date: string; revenue: number }> = []
    let totalRevenue = 0
    let averageOccupancy = 0

    try {
      let bookingsQuery = supabase
        .from('bookings')
        .select('id, event_id, status, amount, created_at')
        .gte('created_at', startDate.toISOString())

      if (accountId) bookingsQuery = bookingsQuery.eq('organizer_id', accountId)

      const { data: bookings, error: bookingsError } = await bookingsQuery
      if (bookingsError) throw bookingsError

      totalBookings = bookings?.length || 0
      totalRevenue = (bookings || []).reduce((sum, b: any) => sum + (b.amount || 0), 0)

      // Trend by day
      revenueTrend = (bookings || []).reduce((acc: Record<string, number>, b: any) => {
        const key = new Date(b.created_at).toISOString().split('T')[0]
        acc[key] = (acc[key] || 0) + (b.amount || 0)
        return acc
      }, {})
      revenueTrend = Object.entries(revenueTrend).map(([date, revenue]) => ({ date, revenue: revenue as number }))

      // Status distribution
      statusDistribution = (bookings || []).reduce((acc: Record<string, number>, b: any) => {
        const key = String(b.status || 'unknown')
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    } catch (_) {
      // Bookings not available; keep defaults
      totalBookings = 0
      totalRevenue = 0
      revenueTrend = []
      statusDistribution = {}
    }

    // Average occupancy if capacity exists and bookings can be mapped by event
    try {
      // If we had bookings per event, compute occupancy; otherwise default 0
      const totalCapacity = (events || []).reduce((sum: number, e: any) => sum + (e.capacity || 0), 0)
      averageOccupancy = totalCapacity > 0 ? Math.min(100, Math.round((totalBookings / totalCapacity) * 100)) : 0
    } catch (_) {
      averageOccupancy = 0
    }

    // Popular events: if bookings table exists, count by event
    let popularEvents: Array<{ id: string; title: string; date: string; capacity: number; bookings: number; occupancyRate: number }> = []
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('event_id')
        .gte('created_at', startDate.toISOString())

      const bookingsCountByEvent = (bookings || []).reduce((acc: Record<string, number>, b: any) => {
        acc[b.event_id] = (acc[b.event_id] || 0) + 1
        return acc
      }, {})

      popularEvents = (events || [])
        .map((e: any) => {
          const bookingsCount = bookingsCountByEvent[e.id] || 0
          const capacity = e.capacity || 0
          const occupancyRate = capacity > 0 ? (bookingsCount / capacity) * 100 : 0
          return {
            id: e.id,
            title: e.title,
            date: e.start_date,
            capacity,
            bookings: bookingsCount,
            occupancyRate
          }
        })
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5)
    } catch (_) {
      popularEvents = []
    }

    return NextResponse.json({
      totalRevenue,
      totalEvents: events?.length || 0,
      totalBookings,
      averageOccupancy,
      revenueTrend,
      statusDistribution,
      popularEvents
    })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}