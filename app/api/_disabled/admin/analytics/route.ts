import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

// Validation schemas
const createMetricSchema = z.object({
  metric_type: z.string().min(1, 'Metric type is required'),
  metric_name: z.string().min(1, 'Metric name is required'),
  value: z.number(),
  dimensions: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
})

const dashboardConfigSchema = z.object({
  dashboard_name: z.string().min(1, 'Dashboard name is required'),
  layout: z.record(z.any()),
  filters: z.record(z.any()).optional(),
  is_default: z.boolean().default(false),
  is_public: z.boolean().default(false)
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Analytics API] GET request started')
    
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview' // 'overview', 'tours', 'events', 'financial', 'staff', 'custom'
    const period = searchParams.get('period') || 'month' // 'week', 'month', 'quarter', 'year'
    const tour_id = searchParams.get('tour_id')
    const event_id = searchParams.get('event_id')
    const metric_type = searchParams.get('metric_type')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    if (start_date) {
      startDate = new Date(start_date)
    } else {
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setMonth(now.getMonth() - 1)
      }
    }

    const endDateFilter = end_date ? new Date(end_date) : now

    if (type === 'overview') {
      // Comprehensive overview analytics
      try {
        // Key Performance Indicators
        const [
          tourData,
          eventData,
          revenueData,
          expenseData,
          staffData,
          ticketData
        ] = await Promise.all([
          // Tours analytics
          supabase
            .from('tours')
            .select('status, created_at')
            .gte('created_at', startDate.toISOString()),

          // Events analytics
          supabase
            .from('events')
            .select('status, date, capacity, price')
            .gte('date', startDate.toISOString()),

          // Revenue analytics
          supabase
            .from('revenue')
            .select('amount, net_amount, revenue_date, source')
            .gte('revenue_date', startDate.toISOString().split('T')[0])
            .lte('revenue_date', endDateFilter.toISOString().split('T')[0]),

          // Expenses analytics
          supabase
            .from('expenses')
            .select('amount, expense_date, status')
            .gte('expense_date', startDate.toISOString().split('T')[0])
            .lte('expense_date', endDateFilter.toISOString().split('T')[0]),

          // Staff analytics
          supabase
            .from('staff_profiles')
            .select('status, department, hire_date, tours_completed'),

          // Tickets analytics
          supabase
            .from('ticket_sales')
            .select('total_amount, quantity, purchase_date, payment_status')
            .gte('purchase_date', startDate.toISOString())
            .lte('purchase_date', endDateFilter.toISOString())
        ])

        // Calculate KPIs
        const totalTours = tourData.data?.length || 0
        const activeTours = tourData.data?.filter((tour: any) => tour.status === 'active').length || 0
        
        const totalEvents = eventData.data?.length || 0
        const upcomingEvents = eventData.data?.filter((event: any) => new Date(event.date) > now).length || 0
        
        const totalRevenue = revenueData.data?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0
        const totalNetRevenue = revenueData.data?.reduce((sum: number, item: any) => sum + parseFloat(item.net_amount || item.amount), 0) || 0
        
        const totalExpenses = expenseData.data?.filter((exp: any) => exp.status === 'paid')
          .reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0
        
        const netProfit = totalNetRevenue - totalExpenses
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        
        const totalStaff = staffData.data?.length || 0
        const activeStaff = staffData.data?.filter((staff: any) => staff.status === 'active').length || 0
        
        const ticketsSold = ticketData.data?.filter((ticket: any) => ticket.payment_status === 'paid')
          .reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
        const ticketRevenue = ticketData.data?.filter((ticket: any) => ticket.payment_status === 'paid')
          .reduce((sum: number, item: any) => sum + parseFloat(item.total_amount), 0) || 0

        // Trends (daily aggregation)
        const dailyRevenue = revenueData.data?.reduce((acc: Record<string, number>, item: any) => {
          const date = item.revenue_date
          acc[date] = (acc[date] || 0) + parseFloat(item.amount)
          return acc
        }, {}) || {}

        const dailyExpenses = expenseData.data?.filter((exp: any) => exp.status === 'paid')
          .reduce((acc: Record<string, number>, item: any) => {
            const date = item.expense_date
            acc[date] = (acc[date] || 0) + parseFloat(item.amount)
            return acc
          }, {}) || {}

        // Revenue by source
        const revenueBySource = revenueData.data?.reduce((acc: Record<string, number>, item: any) => {
          acc[item.source] = (acc[item.source] || 0) + parseFloat(item.amount)
          return acc
        }, {}) || {}

        // Staff by department
        const staffByDepartment = staffData.data?.reduce((acc: Record<string, number>, item: any) => {
          acc[item.department] = (acc[item.department] || 0) + 1
          return acc
        }, {}) || {}

        return NextResponse.json({
          analytics: {
            kpis: {
              total_tours: totalTours,
              active_tours: activeTours,
              total_events: totalEvents,
              upcoming_events: upcomingEvents,
              total_revenue: totalRevenue,
              total_net_revenue: totalNetRevenue,
              total_expenses: totalExpenses,
              net_profit: netProfit,
              profit_margin: profitMargin,
              total_staff: totalStaff,
              active_staff: activeStaff,
              tickets_sold: ticketsSold,
              ticket_revenue: ticketRevenue
            },
            trends: {
              daily_revenue: dailyRevenue,
              daily_expenses: dailyExpenses
            },
            breakdowns: {
              revenue_by_source: revenueBySource,
              staff_by_department: staffByDepartment
            },
            period: period,
            date_range: {
              start: startDate.toISOString().split('T')[0],
              end: endDateFilter.toISOString().split('T')[0]
            }
          }
        })

      } catch (error) {
        console.error('[Admin Analytics API] Error fetching overview analytics:', error)
        return NextResponse.json({ 
          analytics: { 
            kpis: {}, 
            trends: {}, 
            breakdowns: {},
            period: period 
          } 
        })
      }

    } else if (type === 'tours') {
      // Tours-specific analytics
      try {
        let query = supabase
          .from('tours')
          .select('*')
          .gte('created_at', startDate.toISOString())

        if (tour_id) {
          query = query.eq('id', tour_id)
        }

        const { data: tours } = await query

        // Tour performance metrics
        const toursByStatus = tours?.reduce((acc: Record<string, number>, tour: any) => {
          acc[tour.status] = (acc[tour.status] || 0) + 1
          return acc
        }, {}) || {}

        // Revenue by tour
        const { data: tourRevenue } = await supabase
          .from('revenue')
          .select('tour_id, amount, source')
          .not('tour_id', 'is', null)
          .gte('revenue_date', startDate.toISOString().split('T')[0])

        const revenueByTour = tourRevenue?.reduce((acc: Record<string, number>, item: any) => {
          acc[item.tour_id] = (acc[item.tour_id] || 0) + parseFloat(item.amount)
          return acc
        }, {}) || {}

        return NextResponse.json({
          analytics: {
            tours_by_status: toursByStatus,
            revenue_by_tour: revenueByTour,
            total_tours: tours?.length || 0,
            period: period
          }
        })

      } catch (error) {
        console.error('[Admin Analytics API] Error fetching tours analytics:', error)
        return NextResponse.json({ analytics: { tours_by_status: {}, revenue_by_tour: {}, total_tours: 0 } })
      }

    } else if (type === 'events') {
      // Events-specific analytics
      try {
        let query = supabase
          .from('events')
          .select('*')
          .gte('date', startDate.toISOString())

        if (event_id) {
          query = query.eq('id', event_id)
        }

        const { data: events } = await query

        // Event metrics
        const eventsByStatus = events?.reduce((acc: Record<string, number>, event: any) => {
          acc[event.status] = (acc[event.status] || 0) + 1
          return acc
        }, {}) || {}

        const averageCapacity = events?.reduce((sum: number, event: any) => sum + (event.capacity || 0), 0) / (events?.length || 1) || 0

        // Ticket sales by event
        const { data: eventTickets } = await supabase
          .from('ticket_sales')
          .select('event_id, quantity, total_amount, payment_status')
          .not('event_id', 'is', null)
          .gte('purchase_date', startDate.toISOString())

        const salesByEvent = eventTickets?.filter((ticket: any) => ticket.payment_status === 'paid')
          .reduce((acc: Record<string, { tickets: number, revenue: number }>, item: any) => {
            if (!acc[item.event_id]) {
              acc[item.event_id] = { tickets: 0, revenue: 0 }
            }
            acc[item.event_id].tickets += item.quantity
            acc[item.event_id].revenue += parseFloat(item.total_amount)
            return acc
          }, {}) || {}

        return NextResponse.json({
          analytics: {
            events_by_status: eventsByStatus,
            sales_by_event: salesByEvent,
            average_capacity: averageCapacity,
            total_events: events?.length || 0,
            period: period
          }
        })

      } catch (error) {
        console.error('[Admin Analytics API] Error fetching events analytics:', error)
        return NextResponse.json({ 
          analytics: { 
            events_by_status: {}, 
            sales_by_event: {}, 
            average_capacity: 0, 
            total_events: 0 
          } 
        })
      }

    } else if (type === 'staff') {
      // Staff-specific analytics
      try {
        const { data: staff } = await supabase
          .from('staff_profiles')
          .select('*')

        const { data: schedules } = await supabase
          .from('staff_schedules')
          .select('staff_id, shift_start, shift_end, status')
          .gte('shift_start', startDate.toISOString())

        // Staff metrics
        const staffByDepartment = staff?.reduce((acc: Record<string, number>, member: any) => {
          acc[member.department] = (acc[member.department] || 0) + 1
          return acc
        }, {}) || {}

        const staffByStatus = staff?.reduce((acc: Record<string, number>, member: any) => {
          acc[member.status] = (acc[member.status] || 0) + 1
          return acc
        }, {}) || {}

        const averagePerformanceRating = staff?.reduce((sum: number, member: any) => sum + (member.performance_rating || 0), 0) / (staff?.length || 1) || 0

        // Schedule utilization
        const totalScheduledHours = schedules?.reduce((sum: number, schedule: any) => {
          const start = new Date(schedule.shift_start)
          const end = new Date(schedule.shift_end)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60) // Convert to hours
        }, 0) || 0

        return NextResponse.json({
          analytics: {
            staff_by_department: staffByDepartment,
            staff_by_status: staffByStatus,
            average_performance_rating: averagePerformanceRating,
            total_scheduled_hours: totalScheduledHours,
            total_staff: staff?.length || 0,
            period: period
          }
        })

      } catch (error) {
        console.error('[Admin Analytics API] Error fetching staff analytics:', error)
        return NextResponse.json({ 
          analytics: { 
            staff_by_department: {}, 
            staff_by_status: {}, 
            average_performance_rating: 0,
            total_scheduled_hours: 0,
            total_staff: 0 
          } 
        })
      }

    } else if (type === 'custom') {
      // Custom metrics from analytics_metrics table
      try {
        let query = supabase
          .from('analytics_metrics')
          .select('*')
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDateFilter.toISOString())
          .order('timestamp', { ascending: false })
          .limit(limit)

        if (metric_type) {
          query = query.eq('metric_type', metric_type)
        }

        const { data: metrics, error } = await query

        if (error) {
          console.error('[Admin Analytics API] Error fetching custom metrics:', error)
          if (error.code === '42P01') {
            return NextResponse.json({ metrics: [] })
          }
          return NextResponse.json({ error: 'Failed to fetch custom metrics' }, { status: 500 })
        }

        // Group metrics by type
        const metricsByType = metrics?.reduce((acc: Record<string, any[]>, metric: any) => {
          if (!acc[metric.metric_type]) {
            acc[metric.metric_type] = []
          }
          acc[metric.metric_type].push(metric)
          return acc
        }, {}) || {}

        return NextResponse.json({
          analytics: {
            metrics_by_type: metricsByType,
            total_metrics: metrics?.length || 0,
            period: period
          }
        })

      } catch (error) {
        console.error('[Admin Analytics API] Error fetching custom analytics:', error)
        return NextResponse.json({ analytics: { metrics_by_type: {}, total_metrics: 0 } })
      }

    } else if (type === 'dashboards') {
      // User dashboard configurations
      try {
        const { data: dashboards, error } = await supabase
          .from('dashboard_configurations')
          .select('*')
          .or(`user_id.eq.${user.id},is_public.eq.true`)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[Admin Analytics API] Error fetching dashboards:', error)
          if (error.code === '42P01') {
            return NextResponse.json({ dashboards: [] })
          }
          return NextResponse.json({ error: 'Failed to fetch dashboards' }, { status: 500 })
        }

        return NextResponse.json({ dashboards: dashboards || [] })

      } catch (error) {
        console.error('[Admin Analytics API] Error fetching dashboard configs:', error)
        return NextResponse.json({ dashboards: [] })
      }

    } else {
      return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Analytics API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Analytics API] POST request started')
    
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

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_metric') {
      const validatedData = createMetricSchema.parse(data)

      const { data: metric, error } = await supabase
        .from('analytics_metrics')
        .insert({
          ...validatedData,
          timestamp: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Analytics API] Error creating metric:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ error: 'Analytics system not set up. Please run database migrations.' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 })
      }

      console.log('[Admin Analytics API] Successfully created metric:', metric.id)
      return NextResponse.json({ metric }, { status: 201 })

    } else if (action === 'create_dashboard') {
      const validatedData = dashboardConfigSchema.parse(data)

      const { data: dashboard, error } = await supabase
        .from('dashboard_configurations')
        .insert({
          ...validatedData,
          user_id: user.id
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Analytics API] Error creating dashboard:', error)
        return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 })
      }

      console.log('[Admin Analytics API] Successfully created dashboard:', dashboard.id)
      return NextResponse.json({ dashboard }, { status: 201 })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Admin Analytics API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin Analytics API] PUT request started')
    
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

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 })
    }

    // Only allow updating user's own dashboards or public ones if admin
    const { data: existingDashboard } = await supabase
      .from('dashboard_configurations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingDashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    if (existingDashboard.user_id !== user.id && !hasAdminAccess) {
      return NextResponse.json({ error: 'Not authorized to update this dashboard' }, { status: 403 })
    }

    const { data: updatedDashboard, error } = await supabase
      .from('dashboard_configurations')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('[Admin Analytics API] Error updating dashboard:', error)
      return NextResponse.json({ error: 'Failed to update dashboard' }, { status: 500 })
    }

    console.log('[Admin Analytics API] Successfully updated dashboard:', id)
    return NextResponse.json({ dashboard: updatedDashboard })

  } catch (error) {
    console.error('[Admin Analytics API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 