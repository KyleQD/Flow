import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

// Validation schemas
const createTransportationSchema = z.object({
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  event_id: z.string().uuid('Invalid event ID').optional(),
  type: z.enum(['bus', 'van', 'truck', 'plane', 'train', 'other']),
  provider: z.string().optional(),
  vehicle_details: z.record(z.any()).optional(),
  departure_location: z.string().min(1, 'Departure location is required'),
  arrival_location: z.string().min(1, 'Arrival location is required'),
  departure_time: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid departure time'),
  arrival_time: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid arrival time'),
  capacity: z.number().int().min(1).optional(),
  assigned_staff: z.array(z.string().uuid()).default([]),
  cost: z.number().min(0).optional(),
  driver_info: z.record(z.any()).optional(),
  notes: z.string().optional()
})

const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid purchase date').optional(),
  purchase_price: z.number().min(0).optional(),
  current_value: z.number().min(0).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged']).default('good'),
  location: z.string().optional(),
  assigned_to: z.string().uuid('Invalid staff ID').optional(),
  maintenance_schedule: z.record(z.any()).optional(),
  last_maintenance: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid maintenance date').optional(),
  next_maintenance: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid maintenance date').optional(),
  warranty_expiry: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid warranty date').optional(),
  metadata: z.record(z.any()).optional()
})

const assignEquipmentSchema = z.object({
  equipment_id: z.string().uuid('Invalid equipment ID'),
  event_id: z.string().uuid('Invalid event ID').optional(),
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  assigned_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid assigned date').optional(),
  return_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid return date').optional(),
  condition_out: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Logistics API] GET request started')
    
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
    const type = searchParams.get('type') || 'transportation' // 'transportation', 'equipment', 'assignments', 'analytics'
    const event_id = searchParams.get('event_id')
    const tour_id = searchParams.get('tour_id')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const availability = searchParams.get('availability')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (type === 'transportation') {
      // Fetch transportation records
      let query = supabase
        .from('transportation')
        .select('*')
        .order('departure_time', { ascending: false })
        .range(offset, offset + limit - 1)

      if (event_id) {
        query = query.eq('event_id', event_id)
      }
      if (tour_id) {
        query = query.eq('tour_id', tour_id)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: transportation, error } = await query

      if (error) {
        console.error('[Admin Logistics API] Error fetching transportation:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ transportation: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch transportation' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('transportation')
        .select('*', { count: 'exact', head: true })

      if (event_id) countQuery = countQuery.eq('event_id', event_id)
      if (tour_id) countQuery = countQuery.eq('tour_id', tour_id)
      if (status && status !== 'all') countQuery = countQuery.eq('status', status)

      const { count } = await countQuery

      return NextResponse.json({ 
        transportation: transportation || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'equipment') {
      // Fetch equipment
      let query = supabase
        .from('equipment')
        .select(`
          *,
          staff_profiles:assigned_to (
            id,
            first_name,
            last_name,
            position
          )
        `)
        .order('name')
        .range(offset, offset + limit - 1)

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }
      if (availability === 'available') {
        query = query.eq('is_available', true)
      } else if (availability === 'assigned') {
        query = query.eq('is_available', false)
      }

      const { data: equipment, error } = await query

      if (error) {
        console.error('[Admin Logistics API] Error fetching equipment:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ equipment: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })

      if (category && category !== 'all') countQuery = countQuery.eq('category', category)
      if (availability === 'available') countQuery = countQuery.eq('is_available', true)
      else if (availability === 'assigned') countQuery = countQuery.eq('is_available', false)

      const { count } = await countQuery

      return NextResponse.json({ 
        equipment: equipment || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'assignments') {
      // Fetch equipment assignments
      let query = supabase
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment_id (
            id,
            name,
            category,
            condition
          )
        `)
        .order('assigned_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (event_id) {
        query = query.eq('event_id', event_id)
      }
      if (tour_id) {
        query = query.eq('tour_id', tour_id)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: assignments, error } = await query

      if (error) {
        console.error('[Admin Logistics API] Error fetching assignments:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ assignments: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('equipment_assignments')
        .select('*', { count: 'exact', head: true })

      if (event_id) countQuery = countQuery.eq('event_id', event_id)
      if (tour_id) countQuery = countQuery.eq('tour_id', tour_id)
      if (status && status !== 'all') countQuery = countQuery.eq('status', status)

      const { count } = await countQuery

      return NextResponse.json({ 
        assignments: assignments || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'analytics') {
      // Fetch logistics analytics
      try {
        // Transportation costs by type
        const { data: transportData } = await supabase
          .from('transportation')
          .select('type, cost, status')
          .not('cost', 'is', null)

        // Equipment by category
        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('category, condition, is_available, current_value')

        // Recent assignments
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: recentAssignments } = await supabase
          .from('equipment_assignments')
          .select('assigned_date, status, equipment:equipment_id(category)')
          .gte('assigned_date', thirtyDaysAgo.toISOString())

        // Calculate analytics
        const transportCostsByType = transportData?.reduce((acc: Record<string, number>, item: any) => {
          acc[item.type] = (acc[item.type] || 0) + parseFloat(item.cost)
          return acc
        }, {}) || {}

        const equipmentByCategory = equipmentData?.reduce((acc: Record<string, { total: number, available: number, value: number }>, item: any) => {
          if (!acc[item.category]) {
            acc[item.category] = { total: 0, available: 0, value: 0 }
          }
          acc[item.category].total += 1
          if (item.is_available) acc[item.category].available += 1
          acc[item.category].value += parseFloat(item.current_value || 0)
          return acc
        }, {}) || {}

        const equipmentCondition = equipmentData?.reduce((acc: Record<string, number>, item: any) => {
          acc[item.condition] = (acc[item.condition] || 0) + 1
          return acc
        }, {}) || {}

        const totalTransportCost = transportData?.reduce((sum: number, item: any) => sum + parseFloat(item.cost), 0) || 0
        const totalEquipmentValue = equipmentData?.reduce((sum: number, item: any) => sum + parseFloat(item.current_value || 0), 0) || 0
        const availableEquipment = equipmentData?.filter((item: any) => item.is_available).length || 0
        const totalEquipment = equipmentData?.length || 0

        const utilizationRate = totalEquipment > 0 ? ((totalEquipment - availableEquipment) / totalEquipment) * 100 : 0

        return NextResponse.json({
          analytics: {
            summary: {
              total_transport_cost: totalTransportCost,
              total_equipment_value: totalEquipmentValue,
              total_equipment: totalEquipment,
              available_equipment: availableEquipment,
              utilization_rate: utilizationRate
            },
            transport_costs_by_type: transportCostsByType,
            equipment_by_category: equipmentByCategory,
            equipment_condition: equipmentCondition,
            recent_assignments: recentAssignments?.length || 0
          }
        })

      } catch (error) {
        console.error('[Admin Logistics API] Error fetching analytics:', error)
        return NextResponse.json({ 
          analytics: { 
            summary: {}, 
            transport_costs_by_type: {}, 
            equipment_by_category: {},
            equipment_condition: {},
            recent_assignments: 0
          } 
        })
      }

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Logistics API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Logistics API] POST request started')
    
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

    if (action === 'create_transportation') {
      const validatedData = createTransportationSchema.parse(data)

      // Validate that either event_id or tour_id is provided
      if (!validatedData.event_id && !validatedData.tour_id) {
        return NextResponse.json({ error: 'Either event_id or tour_id is required' }, { status: 400 })
      }

      // Validate time range
      const departureTime = new Date(validatedData.departure_time)
      const arrivalTime = new Date(validatedData.arrival_time)
      
      if (arrivalTime <= departureTime) {
        return NextResponse.json({ error: 'Arrival time must be after departure time' }, { status: 400 })
      }

      const { data: transportation, error } = await supabase
        .from('transportation')
        .insert({
          ...validatedData,
          status: 'planned'
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Logistics API] Error creating transportation:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ error: 'Logistics management system not set up. Please run database migrations.' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to create transportation record' }, { status: 500 })
      }

      console.log('[Admin Logistics API] Successfully created transportation:', transportation.id)
      return NextResponse.json({ transportation }, { status: 201 })

    } else if (action === 'create_equipment') {
      const validatedData = createEquipmentSchema.parse(data)

      // Check if serial number already exists (if provided)
      if (validatedData.serial_number) {
        const { data: existingEquipment } = await supabase
          .from('equipment')
          .select('serial_number')
          .eq('serial_number', validatedData.serial_number)
          .single()

        if (existingEquipment) {
          return NextResponse.json({ error: 'Serial number already exists' }, { status: 400 })
        }
      }

      const { data: equipment, error } = await supabase
        .from('equipment')
        .insert({
          ...validatedData,
          is_available: true
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Logistics API] Error creating equipment:', error)
        return NextResponse.json({ error: 'Failed to create equipment record' }, { status: 500 })
      }

      console.log('[Admin Logistics API] Successfully created equipment:', equipment.id)
      return NextResponse.json({ equipment }, { status: 201 })

    } else if (action === 'assign_equipment') {
      const validatedData = assignEquipmentSchema.parse(data)

      // Validate that either event_id or tour_id is provided
      if (!validatedData.event_id && !validatedData.tour_id) {
        return NextResponse.json({ error: 'Either event_id or tour_id is required' }, { status: 400 })
      }

      // Check if equipment exists and is available
      const { data: equipment } = await supabase
        .from('equipment')
        .select('id, is_available')
        .eq('id', validatedData.equipment_id)
        .single()

      if (!equipment) {
        return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
      }

      if (!equipment.is_available) {
        return NextResponse.json({ error: 'Equipment is not available' }, { status: 400 })
      }

      // Create assignment
      const { data: assignment, error } = await supabase
        .from('equipment_assignments')
        .insert({
          ...validatedData,
          assigned_date: validatedData.assigned_date || new Date().toISOString(),
          status: 'assigned'
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Logistics API] Error creating assignment:', error)
        return NextResponse.json({ error: 'Failed to assign equipment' }, { status: 500 })
      }

      // Update equipment availability
      await supabase
        .from('equipment')
        .update({ is_available: false })
        .eq('id', validatedData.equipment_id)

      console.log('[Admin Logistics API] Successfully assigned equipment:', assignment.id)
      return NextResponse.json({ assignment }, { status: 201 })

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

    console.error('[Admin Logistics API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin Logistics API] PUT request started')
    
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

    if (type === 'transportation') {
      const { status: transportStatus } = updateData

      if (transportStatus && !['planned', 'booked', 'in_transit', 'completed', 'cancelled'].includes(transportStatus)) {
        return NextResponse.json({ error: 'Invalid transportation status' }, { status: 400 })
      }

      const { data: updatedTransportation, error } = await supabase
        .from('transportation')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Logistics API] Error updating transportation:', error)
        return NextResponse.json({ error: 'Failed to update transportation' }, { status: 500 })
      }

      if (!updatedTransportation) {
        return NextResponse.json({ error: 'Transportation record not found' }, { status: 404 })
      }

      return NextResponse.json({ transportation: updatedTransportation })

    } else if (type === 'equipment') {
      const { data: updatedEquipment, error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Logistics API] Error updating equipment:', error)
        return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 })
      }

      if (!updatedEquipment) {
        return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
      }

      return NextResponse.json({ equipment: updatedEquipment })

    } else if (type === 'assignment') {
      const { status: assignmentStatus, condition_in, return_date } = updateData

      if (assignmentStatus && !['assigned', 'in_use', 'returned', 'damaged'].includes(assignmentStatus)) {
        return NextResponse.json({ error: 'Invalid assignment status' }, { status: 400 })
      }

      const updateFields: any = {}
      if (assignmentStatus) updateFields.status = assignmentStatus
      if (condition_in) updateFields.condition_in = condition_in
      if (return_date) updateFields.return_date = return_date

      const { data: updatedAssignment, error } = await supabase
        .from('equipment_assignments')
        .update(updateFields)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Logistics API] Error updating assignment:', error)
        return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
      }

      if (!updatedAssignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
      }

      // If equipment is returned, update equipment availability
      if (assignmentStatus === 'returned') {
        await supabase
          .from('equipment')
          .update({ is_available: true })
          .eq('id', updatedAssignment.equipment_id)
      }

      return NextResponse.json({ assignment: updatedAssignment })

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin Logistics API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 