import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createRentalClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('USA'),
  tax_id: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
  payment_terms: z.string().default('net_30'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  notes: z.string().optional()
})

const createRentalAgreementSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  event_id: z.string().uuid('Invalid event ID').optional(),
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  pickup_date: z.string().datetime('Invalid pickup date').optional(),
  return_date: z.string().datetime('Invalid return date').optional(),
  tax_amount: z.number().min(0).default(0),
  deposit_amount: z.number().min(0).default(0),
  terms_conditions: z.string().optional(),
  special_requirements: z.string().optional(),
  insurance_required: z.boolean().default(false),
  insurance_amount: z.number().min(0).optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Invalid contact email').optional(),
  delivery_address: z.string().optional(),
  delivery_instructions: z.string().optional(),
  pickup_instructions: z.string().optional(),
  items: z.array(z.object({
    equipment_id: z.string().uuid('Invalid equipment ID'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    daily_rate: z.number().min(0, 'Daily rate must be positive'),
    notes: z.string().optional()
  })).min(1, 'At least one item is required')
})

const updateRentalAgreementSchema = z.object({
  status: z.enum(['draft', 'confirmed', 'active', 'completed', 'cancelled', 'overdue']).optional(),
  payment_status: z.enum(['pending', 'partial', 'paid', 'overdue']).optional(),
  pickup_date: z.string().datetime('Invalid pickup date').optional(),
  return_date: z.string().datetime('Invalid return date').optional(),
  paid_amount: z.number().min(0).optional(),
  notes: z.string().optional()
})

// =============================================================================
// API ROUTES
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Rentals API] GET request started')

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
    const type = searchParams.get('type') || 'agreements'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const client_id = searchParams.get('client_id')
    const equipment_id = searchParams.get('equipment_id')

    // Check if rental tables exist, if not return empty data
    try {
      const { error: tableCheckError } = await supabase
        .from('rental_clients')
        .select('id')
        .limit(1)
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        // Table doesn't exist - return empty data
        console.log('[Admin Rentals API] Rental tables not found, returning empty data')
        return NextResponse.json({
          clients: [],
          agreements: [],
          analytics: [],
          utilization: [],
          total: 0,
          limit,
          offset,
          message: 'Rental tables not yet migrated. Please run the database migration.'
        })
      }
    } catch (tableError) {
      console.log('[Admin Rentals API] Error checking tables, returning empty data:', tableError)
      return NextResponse.json({
        clients: [],
        agreements: [],
        analytics: [],
        utilization: [],
        total: 0,
        limit,
        offset,
        message: 'Rental tables not yet migrated. Please run the database migration.'
      })
    }

    if (type === 'clients') {
      // Fetch rental clients
      let query = supabase
        .from('rental_clients')
        .select('*')
        .order('name')
        .range(offset, offset + limit - 1)

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: clients, error } = await query

      if (error) {
        console.error('[Admin Rentals API] Error fetching clients:', error)
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('rental_clients')
        .select('*', { count: 'exact', head: true })

      if (status && status !== 'all') countQuery = countQuery.eq('status', status)

      const { count } = await countQuery

      return NextResponse.json({
        clients: clients || [],
        total: count || 0,
        limit,
        offset
      })

    } else if (type === 'agreements') {
      // Fetch rental agreements with related data
      let query = supabase
        .from('rental_agreements')
        .select(`
          *,
          rental_clients (
            id,
            name,
            email,
            phone,
            company
          ),
          events (
            id,
            name,
            start_date
          ),
          tours (
            id,
            name,
            start_date
          ),
          rental_agreement_items (
            id,
            quantity,
            daily_rate,
            total_days,
            subtotal,
            status,
            equipment_id,
            equipment (
              id,
              name,
              category,
              rental_rate
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }
      if (client_id) {
        query = query.eq('client_id', client_id)
      }

      const { data: agreements, error } = await query

      if (error) {
        console.error('[Admin Rentals API] Error fetching agreements:', error)
        return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('rental_agreements')
        .select('*', { count: 'exact', head: true })

      if (status && status !== 'all') countQuery = countQuery.eq('status', status)
      if (client_id) countQuery = countQuery.eq('client_id', client_id)

      const { count } = await countQuery

      return NextResponse.json({
        agreements: agreements || [],
        total: count || 0,
        limit,
        offset
      })

    } else if (type === 'analytics') {
      // Fetch rental analytics
      try {
        const { data: analytics, error } = await supabase
          .from('rental_analytics')
          .select('*')
          .order('month', { ascending: false })
          .limit(12) // Last 12 months

        if (error) {
          console.error('[Admin Rentals API] Error fetching analytics:', error)
          return NextResponse.json({ 
            analytics: [],
            current_month: {
              total_rentals: 0,
              total_revenue: 0,
              active_rentals: 0,
              overdue_rentals: 0
            }
          })
        }

        // Get current month summary
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
        const currentMonthData = (analytics as Array<{ month?: string; total_rentals?: number; total_revenue?: number; active_rentals?: number; overdue_rentals?: number }>)?.find((a: { month?: string }) => a.month === currentMonth) || {
          total_rentals: 0,
          total_revenue: 0,
          active_rentals: 0,
          overdue_rentals: 0
        }

        return NextResponse.json({
          analytics: analytics || [],
          current_month: currentMonthData
        })
      } catch (analyticsError) {
        console.error('[Admin Rentals API] Error fetching analytics:', analyticsError)
        return NextResponse.json({ 
          analytics: [],
          current_month: {
            total_rentals: 0,
            total_revenue: 0,
            active_rentals: 0,
            overdue_rentals: 0
          }
        })
      }

    } else if (type === 'utilization') {
      // Fetch equipment utilization
      try {
        const { data: utilization, error } = await supabase
          .from('equipment_utilization')
          .select('*')
          .order('total_rental_revenue', { ascending: false })

        if (error) {
          console.error('[Admin Rentals API] Error fetching utilization:', error)
          return NextResponse.json({ utilization: [] })
        }

        return NextResponse.json({
          utilization: utilization || []
        })
      } catch (utilizationError) {
        console.error('[Admin Rentals API] Error fetching utilization:', utilizationError)
        return NextResponse.json({ utilization: [] })
      }

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Rentals API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Rentals API] POST request started')

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
    const action = body.action

    if (action === 'create_client') {
      // Create new rental client
      const validatedData = createRentalClientSchema.parse(body)

      const { data: client, error } = await supabase
        .from('rental_clients')
        .insert(validatedData)
        .select()
        .single()

      if (error) {
        console.error('[Admin Rentals API] Error creating client:', error)
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
      }

      return NextResponse.json({ client })

    } else if (action === 'create_agreement') {
      // Create new rental agreement
      const validatedData = createRentalAgreementSchema.parse(body)

      // Start a transaction
      const { data: agreement, error: agreementError } = await supabase
        .from('rental_agreements')
        .insert({
          client_id: validatedData.client_id,
          event_id: validatedData.event_id,
          tour_id: validatedData.tour_id,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date,
          pickup_date: validatedData.pickup_date,
          return_date: validatedData.return_date,
          tax_amount: validatedData.tax_amount,
          deposit_amount: validatedData.deposit_amount,
          terms_conditions: validatedData.terms_conditions,
          special_requirements: validatedData.special_requirements,
          insurance_required: validatedData.insurance_required,
          insurance_amount: validatedData.insurance_amount,
          contact_name: validatedData.contact_name,
          contact_phone: validatedData.contact_phone,
          contact_email: validatedData.contact_email,
          delivery_address: validatedData.delivery_address,
          delivery_instructions: validatedData.delivery_instructions,
          pickup_instructions: validatedData.pickup_instructions,
          created_by: user.id
        })
        .select()
        .single()

      if (agreementError) {
        console.error('[Admin Rentals API] Error creating agreement:', agreementError)
        return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 })
      }

      // Create rental agreement items
      const items = validatedData.items.map(item => ({
        rental_agreement_id: agreement.id,
        equipment_id: item.equipment_id,
        quantity: item.quantity,
        daily_rate: item.daily_rate,
        total_days: Math.ceil((new Date(validatedData.end_date).getTime() - new Date(validatedData.start_date).getTime()) / (1000 * 60 * 60 * 24)),
        subtotal: item.quantity * item.daily_rate * Math.ceil((new Date(validatedData.end_date).getTime() - new Date(validatedData.start_date).getTime()) / (1000 * 60 * 60 * 24)),
        notes: item.notes
      }))

      const { error: itemsError } = await supabase
        .from('rental_agreement_items')
        .insert(items)

      if (itemsError) {
        console.error('[Admin Rentals API] Error creating agreement items:', itemsError)
        return NextResponse.json({ error: 'Failed to create agreement items' }, { status: 500 })
      }

      // Fetch the complete agreement with items
      const { data: completeAgreement, error: fetchError } = await supabase
        .from('rental_agreements')
        .select(`
          *,
          rental_clients (
            id,
            name,
            email,
            phone,
            company
          ),
          rental_agreement_items (
            id,
            quantity,
            daily_rate,
            total_days,
            subtotal,
            status,
            equipment_id,
            equipment (
              id,
              name,
              category,
              rental_rate
            )
          )
        `)
        .eq('id', agreement.id)
        .single()

      if (fetchError) {
        console.error('[Admin Rentals API] Error fetching complete agreement:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch complete agreement' }, { status: 500 })
      }

      return NextResponse.json({ agreement: completeAgreement })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Rentals API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin Rentals API] PUT request started')

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

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    if (type === 'agreement') {
      // Update rental agreement
      const validatedData = updateRentalAgreementSchema.parse(updateData)

      const { data: agreement, error } = await supabase
        .from('rental_agreements')
        .update(validatedData)
        .eq('id', id)
        .select(`
          *,
          rental_clients (
            id,
            name,
            email,
            phone,
            company
          ),
          rental_agreement_items (
            id,
            quantity,
            daily_rate,
            total_days,
            subtotal,
            status,
            equipment_id,
            equipment (
              id,
              name,
              category,
              rental_rate
            )
          )
        `)
        .single()

      if (error) {
        console.error('[Admin Rentals API] Error updating agreement:', error)
        return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 })
      }

      return NextResponse.json({ agreement })

    } else if (type === 'client') {
      // Update rental client
      const validatedData = createRentalClientSchema.partial().parse(updateData)

      const { data: client, error } = await supabase
        .from('rental_clients')
        .update(validatedData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('[Admin Rentals API] Error updating client:', error)
        return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
      }

      return NextResponse.json({ client })

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Rentals API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('[Admin Rentals API] DELETE request started')

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
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    if (type === 'agreement') {
      // Delete rental agreement (cascade will handle items)
      const { error } = await supabase
        .from('rental_agreements')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[Admin Rentals API] Error deleting agreement:', error)
        return NextResponse.json({ error: 'Failed to delete agreement' }, { status: 500 })
      }

      return NextResponse.json({ success: true })

    } else if (type === 'client') {
      // Check if client has active agreements
      const { data: activeAgreements, error: checkError } = await supabase
        .from('rental_agreements')
        .select('id')
        .eq('client_id', id)
        .in('status', ['draft', 'confirmed', 'active'])

      if (checkError) {
        console.error('[Admin Rentals API] Error checking active agreements:', checkError)
        return NextResponse.json({ error: 'Failed to check active agreements' }, { status: 500 })
      }

      if (activeAgreements && activeAgreements.length > 0) {
        return NextResponse.json({ 
          error: 'Cannot delete client with active agreements',
          active_agreements: activeAgreements.length
        }, { status: 400 })
      }

      // Delete rental client
      const { error } = await supabase
        .from('rental_clients')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[Admin Rentals API] Error deleting client:', error)
        return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
      }

      return NextResponse.json({ success: true })

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Rentals API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 