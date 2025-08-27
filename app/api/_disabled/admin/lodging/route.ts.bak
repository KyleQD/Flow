import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createLodgingProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  type: z.enum(['hotel', 'motel', 'resort', 'apartment', 'house', 'airbnb', 'hostel', 'camping']),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().optional(),
  country: z.string().default('USA'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  amenities: z.array(z.string()).default([]),
  max_capacity: z.number().positive().optional(),
  parking_available: z.boolean().default(false),
  parking_spaces: z.number().positive().optional(),
  wifi_available: z.boolean().default(true),
  breakfast_included: z.boolean().default(false),
  pool_available: z.boolean().default(false),
  gym_available: z.boolean().default(false),
  tax_id: z.string().optional(),
  payment_terms: z.string().default('net_30'),
  credit_limit: z.number().default(0),
  preferred_vendor: z.boolean().default(false),
  notes: z.string().optional(),
  special_requirements: z.string().optional(),
  cancellation_policy: z.string().optional(),
  check_in_time: z.string().default('15:00:00'),
  check_out_time: z.string().default('11:00:00')
})

const createLodgingBookingSchema = z.object({
  event_id: z.string().uuid().optional(),
  tour_id: z.string().uuid().optional(),
  provider_id: z.string().uuid(),
  room_type_id: z.string().uuid(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  rooms_booked: z.number().positive().default(1),
  guests_per_room: z.number().positive().default(1),
  total_guests: z.number().positive(),
  primary_guest_name: z.string().min(1, 'Primary guest name is required'),
  primary_guest_email: z.string().email().optional(),
  primary_guest_phone: z.string().optional(),
  special_requests: z.string().optional(),
  dietary_restrictions: z.array(z.string()).default([]),
  accessibility_needs: z.array(z.string()).default([]),
  rate_per_night: z.number().positive(),
  tax_amount: z.number().default(0),
  fees: z.number().default(0),
  discount_amount: z.number().default(0),
  deposit_amount: z.number().default(0),
  booking_source: z.enum(['direct', 'travel_agent', 'online_travel_agent', 'corporate', 'group']).default('direct'),
  confirmation_number: z.string().optional(),
  cancellation_policy: z.string().optional(),
  cancellation_deadline: z.string().optional(),
  assigned_by: z.string().uuid().optional(),
  managed_by: z.string().uuid().optional()
})

const createGuestAssignmentSchema = z.object({
  booking_id: z.string().uuid(),
  guest_name: z.string().min(1, 'Guest name is required'),
  guest_email: z.string().email().optional(),
  guest_phone: z.string().optional(),
  guest_type: z.enum(['crew', 'artist', 'staff', 'vendor', 'guest', 'vip']).default('crew'),
  staff_id: z.string().uuid().optional(),
  crew_member_id: z.string().uuid().optional(),
  team_member_id: z.string().uuid().optional(),
  room_number: z.string().optional(),
  bed_preference: z.string().optional(),
  roommate_preference: z.string().optional(),
  dietary_restrictions: z.array(z.string()).default([]),
  accessibility_needs: z.array(z.string()).default([]),
  special_requests: z.string().optional()
})

const createLodgingPaymentSchema = z.object({
  booking_id: z.string().uuid(),
  payment_type: z.enum(['deposit', 'partial', 'final', 'refund', 'cancellation_fee']),
  amount: z.number().positive(),
  payment_method: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'paypal', 'corporate_account']),
  transaction_id: z.string().optional(),
  payment_date: z.string(),
  processed_by: z.string().uuid().optional(),
  notes: z.string().optional()
})

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'providers'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const provider_id = searchParams.get('provider_id')
    const event_id = searchParams.get('event_id')
    const tour_id = searchParams.get('tour_id')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    let query = supabase.from('lodging_providers').select('*')
    let data: any = null
    let error: any = null

    try {
      switch (type) {
        case 'providers':
          query = supabase.from('lodging_providers').select('*')
          if (status) query = query.eq('status', status)
          if (provider_id) query = query.eq('id', provider_id)
          query = query.range(offset, offset + limit - 1)
          break

        case 'room_types':
          query = supabase.from('lodging_room_types').select('*, lodging_providers(name, type, city, state)')
          if (provider_id) query = query.eq('provider_id', provider_id)
          if (status) query = query.eq('is_active', status === 'active')
          query = query.range(offset, offset + limit - 1)
          break

        case 'bookings':
          query = supabase.from('lodging_bookings')
            .select(`
              *,
              lodging_providers(name, type, city, state),
              lodging_room_types(name, capacity, bed_configuration),
              events(name),
              tours(name)
            `)
          if (status) query = query.eq('status', status)
          if (provider_id) query = query.eq('provider_id', provider_id)
          if (event_id) query = query.eq('event_id', event_id)
          if (tour_id) query = query.eq('tour_id', tour_id)
          if (date_from) query = query.gte('check_in_date', date_from)
          if (date_to) query = query.lte('check_out_date', date_to)
          query = query.range(offset, offset + limit - 1)
          break

        case 'guest_assignments':
          query = supabase.from('lodging_guest_assignments')
            .select(`
              *,
              lodging_bookings(booking_number, check_in_date, check_out_date),
              staff_profiles(first_name, last_name),
              venue_crew_members(name),
              venue_team_members(name)
            `)
          if (status) query = query.eq('status', status)
          if (provider_id) {
            query = query.eq('lodging_bookings.provider_id', provider_id)
          }
          query = query.range(offset, offset + limit - 1)
          break

        case 'payments':
          query = supabase.from('lodging_payments')
            .select(`
              *,
              lodging_bookings(booking_number, primary_guest_name),
              staff_profiles(first_name, last_name)
            `)
          if (status) query = query.eq('status', status)
          if (provider_id) {
            query = query.eq('lodging_bookings.provider_id', provider_id)
          }
          query = query.range(offset, offset + limit - 1)
          break

        case 'calendar_events':
          query = supabase.from('lodging_calendar_events')
            .select(`
              *,
              lodging_bookings(booking_number, primary_guest_name, lodging_providers(name))
            `)
          if (date_from) query = query.gte('start_time', date_from)
          if (date_to) query = query.lte('end_time', date_to)
          query = query.range(offset, offset + limit - 1)
          break

        case 'availability':
          query = supabase.from('lodging_availability')
            .select(`
              *,
              lodging_providers(name, type),
              lodging_room_types(name, capacity, base_rate)
            `)
          if (provider_id) query = query.eq('provider_id', provider_id)
          if (date_from) query = query.gte('date_from', date_from)
          if (date_to) query = query.lte('date_to', date_to)
          query = query.range(offset, offset + limit - 1)
          break

        case 'analytics':
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('lodging_analytics')
            .select('*')
            .range(offset, offset + limit - 1)
          
          if (analyticsError) throw analyticsError
          return NextResponse.json({ data: analyticsData, type: 'analytics' })
          break

        case 'utilization':
          const { data: utilizationData, error: utilizationError } = await supabase
            .from('lodging_utilization')
            .select('*')
            .range(offset, offset + limit - 1)
          
          if (utilizationError) throw utilizationError
          return NextResponse.json({ data: utilizationData, type: 'utilization' })
          break

        default:
          return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
      }

      const result = await query
      data = result.data
      error = result.error

    } catch (dbError: any) {
      // Handle missing tables gracefully
      if (dbError.code === '42P01') {
        return NextResponse.json({ 
          data: [], 
          message: 'Lodging tables not found. Please run the lodging migration first.',
          type 
        })
      }
      throw dbError
    }

    if (error) throw error

    return NextResponse.json({ data, type })

  } catch (error: any) {
    console.error('Lodging API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check admin permissions
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminAllowed = await checkAdminPermissions(authResult.user)
    if (!adminAllowed) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body

    let result: any = null

    switch (action) {
      case 'create_provider':
        const providerData = createLodgingProviderSchema.parse(data)
        result = await supabase
          .from('lodging_providers')
          .insert(providerData)
          .select()
          .single()
        break

      case 'create_room_type':
        const roomTypeData = {
          provider_id: data.provider_id,
          name: data.name,
          description: data.description,
          capacity: data.capacity,
          bed_configuration: data.bed_configuration,
          amenities: data.amenities || [],
          base_rate: data.base_rate,
          weekend_rate: data.weekend_rate,
          holiday_rate: data.holiday_rate,
          group_rate: data.group_rate,
          min_stay: data.min_stay || 1,
          max_stay: data.max_stay,
          available_quantity: data.available_quantity || 0,
          is_active: data.is_active !== false
        }
        result = await supabase
          .from('lodging_room_types')
          .insert(roomTypeData)
          .select()
          .single()
        break

      case 'create_booking':
        const bookingData = createLodgingBookingSchema.parse(data)
        result = await supabase
          .from('lodging_bookings')
          .insert(bookingData)
          .select()
          .single()
        break

      case 'create_guest_assignment':
        const guestData = createGuestAssignmentSchema.parse(data)
        result = await supabase
          .from('lodging_guest_assignments')
          .insert(guestData)
          .select()
          .single()
        break

      case 'create_payment':
        const paymentData = createLodgingPaymentSchema.parse(data)
        result = await supabase
          .from('lodging_payments')
          .insert(paymentData)
          .select()
          .single()
        break

      case 'create_calendar_event':
        const calendarData = {
          booking_id: data.booking_id,
          title: data.title,
          description: data.description,
          start_time: data.start_time,
          end_time: data.end_time,
          location: data.location,
          calendar_type: data.calendar_type || 'lodging',
          external_calendar_id: data.external_calendar_id,
          is_all_day: data.is_all_day || false,
          reminder_minutes: data.reminder_minutes || [1440],
          status: data.status || 'scheduled'
        }
        result = await supabase
          .from('lodging_calendar_events')
          .insert(calendarData)
          .select()
          .single()
        break

      case 'create_availability':
        const availabilityData = {
          provider_id: data.provider_id,
          room_type_id: data.room_type_id,
          date_from: data.date_from,
          date_to: data.date_to,
          rooms_available: data.rooms_available,
          rooms_reserved: data.rooms_reserved || 0,
          rooms_blocked: data.rooms_blocked || 0,
          base_rate: data.base_rate,
          special_rate: data.special_rate,
          rate_notes: data.rate_notes,
          is_blocked: data.is_blocked || false,
          block_reason: data.block_reason,
          blocked_by: data.blocked_by
        }
        result = await supabase
          .from('lodging_availability')
          .insert(availabilityData)
          .select()
          .single()
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (result.error) throw result.error

    return NextResponse.json({ 
      data: result.data, 
      message: `${action.replace('_', ' ')} created successfully` 
    })

  } catch (error: any) {
    console.error('Lodging API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate and check admin permissions
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminAllowed = await checkAdminPermissions(authResult.user)
    if (!adminAllowed) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    let result: any = null

    switch (action) {
      case 'update_provider':
        result = await supabase
          .from('lodging_providers')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_room_type':
        result = await supabase
          .from('lodging_room_types')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_booking':
        result = await supabase
          .from('lodging_bookings')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_guest_assignment':
        result = await supabase
          .from('lodging_guest_assignments')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_payment':
        result = await supabase
          .from('lodging_payments')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_calendar_event':
        result = await supabase
          .from('lodging_calendar_events')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_availability':
        result = await supabase
          .from('lodging_availability')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (result.error) throw result.error

    return NextResponse.json({ 
      data: result.data, 
      message: `${action.replace('_', ' ')} updated successfully` 
    })

  } catch (error: any) {
    console.error('Lodging API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and check admin permissions
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminAllowed = await checkAdminPermissions(authResult.user)
    if (!adminAllowed) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (!action || !id) {
      return NextResponse.json({ error: 'Action and ID are required' }, { status: 400 })
    }

    let result: any = null

    switch (action) {
      case 'delete_provider':
        // Check if provider has active bookings
        const { data: activeBookings } = await supabase
          .from('lodging_bookings')
          .select('id')
          .eq('provider_id', id)
          .in('status', ['pending', 'confirmed', 'checked_in'])
          .limit(1)

        if (activeBookings && activeBookings.length > 0) {
          return NextResponse.json({ 
            error: 'Cannot delete provider with active bookings' 
          }, { status: 400 })
        }

        result = await supabase
          .from('lodging_providers')
          .delete()
          .eq('id', id)
        break

      case 'delete_room_type':
        // Check if room type has active bookings
        const { data: roomBookings } = await supabase
          .from('lodging_bookings')
          .select('id')
          .eq('room_type_id', id)
          .in('status', ['pending', 'confirmed', 'checked_in'])
          .limit(1)

        if (roomBookings && roomBookings.length > 0) {
          return NextResponse.json({ 
            error: 'Cannot delete room type with active bookings' 
          }, { status: 400 })
        }

        result = await supabase
          .from('lodging_room_types')
          .delete()
          .eq('id', id)
        break

      case 'delete_booking':
        result = await supabase
          .from('lodging_bookings')
          .delete()
          .eq('id', id)
        break

      case 'delete_guest_assignment':
        result = await supabase
          .from('lodging_guest_assignments')
          .delete()
          .eq('id', id)
        break

      case 'delete_payment':
        result = await supabase
          .from('lodging_payments')
          .delete()
          .eq('id', id)
        break

      case 'delete_calendar_event':
        result = await supabase
          .from('lodging_calendar_events')
          .delete()
          .eq('id', id)
        break

      case 'delete_availability':
        result = await supabase
          .from('lodging_availability')
          .delete()
          .eq('id', id)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (result.error) throw result.error

    return NextResponse.json({ 
      message: `${action.replace('_', ' ')} deleted successfully` 
    })

  } catch (error: any) {
    console.error('Lodging API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 