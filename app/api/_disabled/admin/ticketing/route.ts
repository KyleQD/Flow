import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

// Validation schemas
const createTicketTypeSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  name: z.string().min(1, 'Ticket type name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  quantity_available: z.number().int().min(1, 'Quantity must be at least 1'),
  max_per_customer: z.number().int().min(1).optional(),
  sale_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid sale start date').optional(),
  sale_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid sale end date').optional(),
  metadata: z.record(z.any()).optional()
})

const updateTicketTypeSchema = createTicketTypeSchema.partial().omit({ event_id: true })

const createTicketSaleSchema = z.object({
  ticket_type_id: z.string().uuid('Invalid ticket type ID'),
  event_id: z.string().uuid('Invalid event ID'),
  customer_email: z.string().email('Invalid customer email'),
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  payment_method: z.string().optional(),
  transaction_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Ticketing API] GET request started')
    
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
    const type = searchParams.get('type') || 'ticket_types' // 'ticket_types', 'sales', 'analytics'
    const event_id = searchParams.get('event_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (type === 'ticket_types') {
      // Fetch ticket types
      let query = supabase
        .from('ticket_types')
        .select(`
          *,
          events:event_id (
            id,
            title,
            date,
            location
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (event_id) {
        query = query.eq('event_id', event_id)
      }

      const { data: ticketTypes, error } = await query

      if (error) {
        console.error('[Admin Ticketing API] Error fetching ticket types:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ ticket_types: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch ticket types' }, { status: 500 })
      }

      const { count } = await supabase
        .from('ticket_types')
        .select('*', { count: 'exact', head: true })

      return NextResponse.json({ 
        ticket_types: ticketTypes || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'sales') {
      // Fetch ticket sales
      let query = supabase
        .from('ticket_sales')
        .select(`
          *,
          ticket_types:ticket_type_id (
            id,
            name,
            price
          ),
          events:event_id (
            id,
            title,
            date,
            location
          )
        `)
        .order('purchase_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (event_id) {
        query = query.eq('event_id', event_id)
      }

      if (status && status !== 'all') {
        query = query.eq('payment_status', status)
      }

      const { data: sales, error } = await query

      if (error) {
        console.error('[Admin Ticketing API] Error fetching sales:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ sales: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('ticket_sales')
        .select('*', { count: 'exact', head: true })

      if (event_id) {
        countQuery = countQuery.eq('event_id', event_id)
      }
      if (status && status !== 'all') {
        countQuery = countQuery.eq('payment_status', status)
      }

      const { count } = await countQuery

      return NextResponse.json({ 
        sales: sales || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'analytics') {
      // Fetch ticketing analytics
      try {
        // Total sales summary
        const { data: salesSummary } = await supabase
          .from('ticket_sales')
          .select('total_amount, quantity, payment_status')
          .eq('payment_status', 'paid')

        // Sales by event
        const { data: salesByEvent } = await supabase
          .from('ticket_sales')
          .select(`
            event_id,
            total_amount,
            quantity,
            events:event_id (title)
          `)
          .eq('payment_status', 'paid')

        // Recent sales trend (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: recentSales } = await supabase
          .from('ticket_sales')
          .select('purchase_date, total_amount, quantity')
          .eq('payment_status', 'paid')
          .gte('purchase_date', thirtyDaysAgo.toISOString())

        // Calculate analytics
        const totalRevenue = salesSummary?.reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount), 0) || 0
        const totalTicketsSold = salesSummary?.reduce((sum: number, sale: any) => sum + sale.quantity, 0) || 0

        // Group sales by event
        const eventSales = salesByEvent?.reduce((acc: Record<string, { revenue: number, tickets: number }>, sale: any) => {
          const eventTitle = sale.events?.title || 'Unknown Event'
          if (!acc[eventTitle]) {
            acc[eventTitle] = { revenue: 0, tickets: 0 }
          }
          acc[eventTitle].revenue += parseFloat(sale.total_amount)
          acc[eventTitle].tickets += sale.quantity
          return acc
        }, {} as Record<string, { revenue: number, tickets: number }>) || {}

        // Daily sales for the last 30 days
        const dailySales = recentSales?.reduce((acc: Record<string, { revenue: number, tickets: number }>, sale: any) => {
          const date = new Date(sale.purchase_date).toISOString().split('T')[0]
          if (!acc[date]) {
            acc[date] = { revenue: 0, tickets: 0 }
          }
          acc[date].revenue += parseFloat(sale.total_amount)
          acc[date].tickets += sale.quantity
          return acc
        }, {} as Record<string, { revenue: number, tickets: number }>) || {}

        return NextResponse.json({
          analytics: {
            summary: {
              total_revenue: totalRevenue,
              total_tickets_sold: totalTicketsSold,
              average_ticket_price: totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0
            },
            sales_by_event: eventSales,
            daily_sales: dailySales
          }
        })

      } catch (error) {
        console.error('[Admin Ticketing API] Error fetching analytics:', error)
        return NextResponse.json({ analytics: { summary: {}, sales_by_event: {}, daily_sales: {} } })
      }

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Ticketing API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Ticketing API] POST request started')
    
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

    if (action === 'create_ticket_type') {
      const validatedData = createTicketTypeSchema.parse(data)

      // Validate sale dates
      if (validatedData.sale_start && validatedData.sale_end) {
        const startDate = new Date(validatedData.sale_start)
        const endDate = new Date(validatedData.sale_end)
        
        if (endDate <= startDate) {
          return NextResponse.json({ error: 'Sale end date must be after start date' }, { status: 400 })
        }
      }

      // Check if event exists
      const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('id', validatedData.event_id)
        .single()

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      const { data: ticketType, error } = await supabase
        .from('ticket_types')
        .insert({
          ...validatedData,
          quantity_sold: 0,
          is_active: true
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Ticketing API] Error creating ticket type:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ error: 'Ticketing system not set up. Please run database migrations.' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to create ticket type' }, { status: 500 })
      }

      console.log('[Admin Ticketing API] Successfully created ticket type:', ticketType.id)
      return NextResponse.json({ ticket_type: ticketType }, { status: 201 })

    } else if (action === 'create_sale') {
      const validatedData = createTicketSaleSchema.parse(data)

      // Check ticket type availability
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', validatedData.ticket_type_id)
        .single()

      if (!ticketType) {
        return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 })
      }

      if (!ticketType.is_active) {
        return NextResponse.json({ error: 'Ticket type is not active' }, { status: 400 })
      }

      const remainingTickets = ticketType.quantity_available - ticketType.quantity_sold
      if (validatedData.quantity > remainingTickets) {
        return NextResponse.json({ error: 'Not enough tickets available' }, { status: 400 })
      }

      // Check max per customer limit
      if (ticketType.max_per_customer) {
        const { data: existingSales } = await supabase
          .from('ticket_sales')
          .select('quantity')
          .eq('ticket_type_id', validatedData.ticket_type_id)
          .eq('customer_email', validatedData.customer_email)
          .neq('payment_status', 'refunded')

                 const existingQuantity = existingSales?.reduce((sum: number, sale: any) => sum + sale.quantity, 0) || 0
        if (existingQuantity + validatedData.quantity > ticketType.max_per_customer) {
          return NextResponse.json({ error: 'Exceeds maximum tickets per customer' }, { status: 400 })
        }
      }

      // Calculate total amount
      const total_amount = ticketType.price * validatedData.quantity
      const fees = total_amount * 0.03 // 3% processing fee
      const order_number = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`

      const { data: sale, error } = await supabase
        .from('ticket_sales')
        .insert({
          ...validatedData,
          total_amount,
          fees,
          order_number,
          payment_status: 'paid' // Default to paid for admin-created sales
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Ticketing API] Error creating sale:', error)
        return NextResponse.json({ error: 'Failed to create ticket sale' }, { status: 500 })
      }

      console.log('[Admin Ticketing API] Successfully created ticket sale:', sale.id)
      return NextResponse.json({ sale }, { status: 201 })

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

    console.error('[Admin Ticketing API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin Ticketing API] PUT request started')
    
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
    const { id, type, ...updateData } = body

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    if (type === 'ticket_type') {
      const validatedData = updateTicketTypeSchema.parse(updateData)

      const { data: updatedTicketType, error } = await supabase
        .from('ticket_types')
        .update(validatedData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Ticketing API] Error updating ticket type:', error)
        return NextResponse.json({ error: 'Failed to update ticket type' }, { status: 500 })
      }

      if (!updatedTicketType) {
        return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 })
      }

      return NextResponse.json({ ticket_type: updatedTicketType })

    } else if (type === 'sale') {
      // Only allow updating payment status for sales
      const { payment_status } = updateData

      if (!payment_status || !['pending', 'paid', 'refunded', 'failed'].includes(payment_status)) {
        return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
      }

      const { data: updatedSale, error } = await supabase
        .from('ticket_sales')
        .update({ payment_status })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Ticketing API] Error updating sale:', error)
        return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 })
      }

      if (!updatedSale) {
        return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
      }

      return NextResponse.json({ sale: updatedSale })

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Admin Ticketing API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 