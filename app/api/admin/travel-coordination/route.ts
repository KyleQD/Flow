import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createTravelGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  group_type: z.enum(['crew', 'artists', 'staff', 'vendors', 'guests', 'vip', 'media', 'security', 'catering', 'technical', 'management']),
  department: z.string().optional(),
  priority_level: z.number().min(1).max(5).default(3),
  arrival_date: z.string(),
  departure_date: z.string(),
  arrival_location: z.string().optional(),
  departure_location: z.string().optional(),
  group_leader_id: z.string().uuid().optional(),
  backup_contact_id: z.string().uuid().optional(),
  special_requirements: z.array(z.string()).default([]),
  dietary_restrictions: z.array(z.string()).default([]),
  accessibility_needs: z.array(z.string()).default([]),
  event_id: z.string().uuid().optional(),
  tour_id: z.string().uuid().optional()
})

const createGroupMemberSchema = z.object({
  group_id: z.string().uuid(),
  member_name: z.string().min(1, 'Member name is required'),
  member_email: z.string().email().optional(),
  member_phone: z.string().optional(),
  member_role: z.string().optional(),
  staff_id: z.string().uuid().optional(),
  crew_member_id: z.string().uuid().optional(),
  team_member_id: z.string().uuid().optional(),
  seat_preference: z.string().optional(),
  meal_preference: z.string().optional(),
  special_assistance: z.boolean().default(false),
  wheelchair_required: z.boolean().default(false),
  mobility_assistance: z.boolean().default(false)
})

const createFlightCoordinationSchema = z.object({
  flight_number: z.string().min(1, 'Flight number is required'),
  airline: z.string().min(1, 'Airline is required'),
  departure_airport: z.string().min(1, 'Departure airport is required'),
  arrival_airport: z.string().min(1, 'Arrival airport is required'),
  departure_time: z.string(),
  arrival_time: z.string(),
  aircraft_type: z.string().optional(),
  total_seats: z.number().positive().optional(),
  group_id: z.string().uuid().optional(),
  is_group_flight: z.boolean().default(false),
  booking_reference: z.string().optional(),
  ticket_class: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
  fare_type: z.enum(['standard', 'flexible', 'refundable', 'group']).default('standard'),
  gate: z.string().optional(),
  terminal: z.string().optional(),
  ticket_cost: z.number().positive().optional(),
  total_cost: z.number().positive().optional(),
  event_id: z.string().uuid().optional(),
  tour_id: z.string().uuid().optional()
})

const createGroundTransportationSchema = z.object({
  transport_type: z.enum(['shuttle_bus', 'limo', 'van', 'car', 'train', 'subway', 'walking']),
  provider_name: z.string().optional(),
  vehicle_details: z.record(z.any()).default({}),
  pickup_location: z.string().min(1, 'Pickup location is required'),
  dropoff_location: z.string().min(1, 'Dropoff location is required'),
  pickup_time: z.string(),
  estimated_dropoff_time: z.string(),
  vehicle_capacity: z.number().positive().optional(),
  group_id: z.string().uuid().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  driver_license: z.string().optional(),
  vehicle_plate: z.string().optional(),
  tracking_enabled: z.boolean().default(false),
  cost_per_person: z.number().positive().optional(),
  total_cost: z.number().positive().optional(),
  event_id: z.string().uuid().optional(),
  tour_id: z.string().uuid().optional(),
  flight_id: z.string().uuid().optional()
})

const createFlightPassengerAssignmentSchema = z.object({
  flight_id: z.string().uuid(),
  group_member_id: z.string().uuid(),
  seat_number: z.string().optional(),
  seat_class: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
  ticket_number: z.string().optional(),
  ticket_cost: z.number().positive().optional(),
  boarding_group: z.string().optional(),
  special_meal: z.string().optional(),
  special_assistance: z.boolean().default(false),
  wheelchair_assistance: z.boolean().default(false)
})

const createTransportationPassengerAssignmentSchema = z.object({
  transportation_id: z.string().uuid(),
  group_member_id: z.string().uuid(),
  pickup_instructions: z.string().optional(),
  dropoff_instructions: z.string().optional(),
  special_assistance: z.boolean().default(false),
  wheelchair_required: z.boolean().default(false),
  luggage_count: z.number().positive().default(1)
})

const createHotelRoomAssignmentSchema = z.object({
  lodging_booking_id: z.string().uuid(),
  group_member_id: z.string().uuid(),
  room_number: z.string().optional(),
  room_type: z.string().optional(),
  bed_configuration: z.string().optional(),
  roommate_preference: z.string().optional(),
  floor_preference: z.string().optional(),
  accessibility_required: z.boolean().default(false),
  dietary_restrictions: z.array(z.string()).default([]),
  accessibility_needs: z.array(z.string()).default([]),
  special_requests: z.string().optional()
})

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateApiRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'groups'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const group_type = searchParams.get('group_type')
    const event_id = searchParams.get('event_id')
    const tour_id = searchParams.get('tour_id')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    let query: any = null
    let data: any = null
    let error: any = null

    try {
      switch (type) {
        case 'groups':
          query = supabase.from('travel_groups')
            .select(`
              *,
              staff_profiles!travel_groups_group_leader_id_fkey(first_name, last_name, email),
              staff_profiles!travel_groups_backup_contact_id_fkey(first_name, last_name, email)
            `)
          if (status) query = query.eq('status', status)
          if (group_type) query = query.eq('group_type', group_type)
          if (event_id) query = query.eq('event_id', event_id)
          if (tour_id) query = query.eq('tour_id', tour_id)
          if (date_from) query = query.gte('arrival_date', date_from)
          if (date_to) query = query.lte('departure_date', date_to)
          query = query.range(offset, offset + limit - 1)
          break

        case 'group_members':
          query = supabase.from('travel_group_members')
            .select(`
              *,
              travel_groups(name, group_type, department),
              staff_profiles(first_name, last_name, email),
              venue_crew_members(name, specialty),
              venue_team_members(name, role)
            `)
          if (status) query = query.eq('status', status)
          if (group_type) {
            query = query.eq('travel_groups.group_type', group_type)
          }
          query = query.range(offset, offset + limit - 1)
          break

        case 'flights':
          query = supabase.from('flight_coordination')
            .select(`
              *,
              travel_groups(name, group_type, department)
            `)
          if (status) query = query.eq('status', status)
          if (event_id) query = query.eq('event_id', event_id)
          if (tour_id) query = query.eq('tour_id', tour_id)
          if (date_from) query = query.gte('departure_time', date_from)
          if (date_to) query = query.lte('arrival_time', date_to)
          query = query.range(offset, offset + limit - 1)
          break

        case 'flight_passengers':
          query = supabase.from('flight_passenger_assignments')
            .select(`
              *,
              flight_coordination(flight_number, airline, departure_airport, arrival_airport),
              travel_group_members(member_name, member_email, member_role)
            `)
          if (status) query = query.eq('status', status)
          query = query.range(offset, offset + limit - 1)
          break

        case 'transportation':
          query = supabase.from('ground_transportation_coordination')
            .select(`
              *,
              travel_groups(name, group_type, department),
              flight_coordination(flight_number, airline)
            `)
          if (status) query = query.eq('status', status)
          if (event_id) query = query.eq('event_id', event_id)
          if (tour_id) query = query.eq('tour_id', tour_id)
          if (date_from) query = query.gte('pickup_time', date_from)
          if (date_to) query = query.lte('estimated_dropoff_time', date_to)
          query = query.range(offset, offset + limit - 1)
          break

        case 'transportation_passengers':
          query = supabase.from('transportation_passenger_assignments')
            .select(`
              *,
              ground_transportation_coordination(transport_type, provider_name, pickup_location, dropoff_location),
              travel_group_members(member_name, member_email, member_role)
            `)
          if (status) query = query.eq('status', status)
          query = query.range(offset, offset + limit - 1)
          break

        case 'hotel_assignments':
          query = supabase.from('hotel_room_assignments')
            .select(`
              *,
              lodging_bookings(booking_number, lodging_providers(name)),
              travel_group_members(member_name, member_email, member_role)
            `)
          if (status) query = query.eq('status', status)
          query = query.range(offset, offset + limit - 1)
          break

        case 'timeline':
          query = supabase.from('travel_coordination_timeline')
            .select(`
              *,
              travel_groups(name, group_type)
            `)
          if (date_from) query = query.gte('start_time', date_from)
          if (date_to) query = query.lte('end_time', date_to)
          query = query.range(offset, offset + limit - 1)
          break

        case 'analytics':
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('travel_coordination_analytics')
            .select('*')
            .range(offset, offset + limit - 1)
          
          if (analyticsError) throw analyticsError
          return NextResponse.json({ data: analyticsData, type: 'analytics' })

        case 'utilization':
          const { data: utilizationData, error: utilizationError } = await supabase
            .from('travel_group_utilization')
            .select('*')
            .range(offset, offset + limit - 1)
          
          if (utilizationError) throw utilizationError
          return NextResponse.json({ data: utilizationData, type: 'utilization' })

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
          message: 'Travel coordination tables not found. Please run the travel coordination migration first.',
          type 
        })
      }
      throw dbError
    }

    if (error) throw error

    return NextResponse.json({ data, type })

  } catch (error: any) {
    console.error('Travel Coordination API Error:', error)
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
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminCheck = await checkAdminPermissions(authResult.userId)
    if (!adminCheck.success) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body

    let result: any = null

    switch (action) {
      case 'create_travel_group':
        const groupData = createTravelGroupSchema.parse(data)
        result = await supabase
          .from('travel_groups')
          .insert(groupData)
          .select()
          .single()
        break

      case 'create_group_member':
        const memberData = createGroupMemberSchema.parse(data)
        result = await supabase
          .from('travel_group_members')
          .insert(memberData)
          .select()
          .single()
        break

      case 'create_flight_coordination':
        const flightData = createFlightCoordinationSchema.parse(data)
        result = await supabase
          .from('flight_coordination')
          .insert(flightData)
          .select()
          .single()
        break

      case 'create_ground_transportation':
        const transportData = createGroundTransportationSchema.parse(data)
        result = await supabase
          .from('ground_transportation_coordination')
          .insert(transportData)
          .select()
          .single()
        break

      case 'create_flight_passenger_assignment':
        const flightPassengerData = createFlightPassengerAssignmentSchema.parse(data)
        result = await supabase
          .from('flight_passenger_assignments')
          .insert(flightPassengerData)
          .select()
          .single()
        break

      case 'create_transportation_passenger_assignment':
        const transportPassengerData = createTransportationPassengerAssignmentSchema.parse(data)
        result = await supabase
          .from('transportation_passenger_assignments')
          .insert(transportPassengerData)
          .select()
          .single()
        break

      case 'create_hotel_room_assignment':
        const hotelAssignmentData = createHotelRoomAssignmentSchema.parse(data)
        result = await supabase
          .from('hotel_room_assignments')
          .insert(hotelAssignmentData)
          .select()
          .single()
        break

      case 'bulk_create_group_members':
        const { group_id, members } = data
        if (!group_id || !Array.isArray(members)) {
          return NextResponse.json({ error: 'Invalid bulk create data' }, { status: 400 })
        }
        
        const memberRecords = members.map((member: any) => ({
          group_id,
          member_name: member.name,
          member_email: member.email,
          member_phone: member.phone,
          member_role: member.role,
          staff_id: member.staff_id,
          crew_member_id: member.crew_member_id,
          team_member_id: member.team_member_id,
          seat_preference: member.seat_preference,
          meal_preference: member.meal_preference,
          special_assistance: member.special_assistance || false,
          wheelchair_required: member.wheelchair_required || false,
          mobility_assistance: member.mobility_assistance || false
        }))
        
        result = await supabase
          .from('travel_group_members')
          .insert(memberRecords)
          .select()
        break

      case 'auto_coordinate_group':
        const { group_id: autoGroupId } = data
        if (!autoGroupId) {
          return NextResponse.json({ error: 'Group ID required for auto-coordination' }, { status: 400 })
        }
        
        // Get group details
        const { data: autoGroupDetails, error: groupError } = await supabase
          .from('travel_groups')
          .select('*')
          .eq('id', autoGroupId)
          .single()
        
        if (groupError) throw groupError
        
        // Get group members
        const { data: autoGroupMembers, error: membersError } = await supabase
          .from('travel_group_members')
          .select('*')
          .eq('group_id', autoGroupId)
        
        if (membersError) throw membersError
        
        // Create flight coordination if not exists
        if (autoGroupDetails.arrival_date && autoGroupDetails.arrival_location) {
          const flightCoordination = {
            flight_number: `GROUP-${autoGroupDetails.name.toUpperCase().replace(/\s+/g, '-')}`,
            airline: 'Group Charter',
            departure_airport: autoGroupDetails.departure_location || 'TBD',
            arrival_airport: autoGroupDetails.arrival_location,
            departure_time: `${autoGroupDetails.arrival_date}T08:00:00Z`,
            arrival_time: `${autoGroupDetails.arrival_date}T10:00:00Z`,
            total_seats: autoGroupDetails.total_members,
            booked_seats: autoGroupDetails.total_members,
            available_seats: 0,
            group_id: autoGroupId,
            is_group_flight: true,
            ticket_class: 'economy',
            fare_type: 'group',
            status: 'scheduled',
            event_id: autoGroupDetails.event_id,
            tour_id: autoGroupDetails.tour_id
          }
          
          const { data: flight, error: flightError } = await supabase
            .from('flight_coordination')
            .insert(flightCoordination)
            .select()
            .single()
          
          if (!flightError && flight) {
            // Assign all members to the flight
            const flightAssignments = autoGroupMembers.map((member: any) => ({
              flight_id: flight.id,
              group_member_id: member.id,
              seat_class: 'economy',
              ticket_status: 'confirmed'
            }))
            
            await supabase
              .from('flight_passenger_assignments')
              .insert(flightAssignments)
          }
        }
        
        // Create ground transportation
        if (autoGroupDetails.arrival_location) {
          const transportation = {
            transport_type: autoGroupDetails.total_members > 20 ? 'shuttle_bus' : 'van',
            provider_name: 'Group Transportation',
            pickup_location: autoGroupDetails.arrival_location,
            dropoff_location: 'Event Venue',
            pickup_time: `${autoGroupDetails.arrival_date}T10:30:00Z`,
            estimated_dropoff_time: `${autoGroupDetails.arrival_date}T11:00:00Z`,
            vehicle_capacity: autoGroupDetails.total_members,
            assigned_passengers: autoGroupDetails.total_members,
            group_id: autoGroupId,
            status: 'scheduled',
            event_id: groupData.event_id,
            tour_id: groupData.tour_id
          }
          
          const { data: transport, error: transportError } = await supabase
            .from('ground_transportation_coordination')
            .insert(transportation)
            .select()
            .single()
          
          if (!transportError && transport) {
            // Assign all members to transportation
            const transportAssignments = members.map((member: any) => ({
              transportation_id: transport.id,
              group_member_id: member.id,
              status: 'confirmed'
            }))
            
            await supabase
              .from('transportation_passenger_assignments')
              .insert(transportAssignments)
          }
        }
        
        result = { success: true, message: 'Group auto-coordinated successfully' }
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
    console.error('Travel Coordination API Error:', error)
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
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminCheck = await checkAdminPermissions(authResult.userId)
    if (!adminCheck.success) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    let result: any = null

    switch (action) {
      case 'update_travel_group':
        result = await supabase
          .from('travel_groups')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_group_member':
        result = await supabase
          .from('travel_group_members')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_flight_coordination':
        result = await supabase
          .from('flight_coordination')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_ground_transportation':
        result = await supabase
          .from('ground_transportation_coordination')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_flight_passenger_assignment':
        result = await supabase
          .from('flight_passenger_assignments')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_transportation_passenger_assignment':
        result = await supabase
          .from('transportation_passenger_assignments')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        break

      case 'update_hotel_room_assignment':
        result = await supabase
          .from('hotel_room_assignments')
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
    console.error('Travel Coordination API Error:', error)
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
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminCheck = await checkAdminPermissions(authResult.userId)
    if (!adminCheck.success) {
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
      case 'delete_travel_group':
        result = await supabase
          .from('travel_groups')
          .delete()
          .eq('id', id)
        break

      case 'delete_group_member':
        result = await supabase
          .from('travel_group_members')
          .delete()
          .eq('id', id)
        break

      case 'delete_flight_coordination':
        result = await supabase
          .from('flight_coordination')
          .delete()
          .eq('id', id)
        break

      case 'delete_ground_transportation':
        result = await supabase
          .from('ground_transportation_coordination')
          .delete()
          .eq('id', id)
        break

      case 'delete_flight_passenger_assignment':
        result = await supabase
          .from('flight_passenger_assignments')
          .delete()
          .eq('id', id)
        break

      case 'delete_transportation_passenger_assignment':
        result = await supabase
          .from('transportation_passenger_assignments')
          .delete()
          .eq('id', id)
        break

      case 'delete_hotel_room_assignment':
        result = await supabase
          .from('hotel_room_assignments')
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
    console.error('Travel Coordination API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 