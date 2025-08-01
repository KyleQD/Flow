import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

// Validation schemas
const createStaffSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  hire_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid hire date'),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'volunteer']).default('full_time'),
  salary: z.number().optional(),
  hourly_rate: z.number().optional(),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  emergency_contact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  location: z.string().optional(),
  notes: z.string().optional()
})

const updateStaffSchema = createStaffSchema.partial()

const scheduleStaffSchema = z.object({
  staff_id: z.string().uuid('Invalid staff ID'),
  event_id: z.string().uuid('Invalid event ID').optional(),
  tour_id: z.string().uuid('Invalid tour ID').optional(),
  shift_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start time'),
  shift_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end time'),
  role: z.string().min(1, 'Role is required'),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Staff API] GET request started')
    
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
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const availability = searchParams.get('availability')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('staff_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (department && department !== 'all') {
      query = query.eq('department', department)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (availability && availability !== 'all') {
      query = query.eq('availability', availability)
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,position.ilike.%${search}%`)
    }

    const { data: staff, error } = await query

    if (error) {
      console.error('[Admin Staff API] Error fetching staff:', error)
      if (error.code === '42P01') {
        // Table doesn't exist yet, return empty array
        return NextResponse.json({ staff: [], total: 0 })
      }
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('staff_profiles')
      .select('*', { count: 'exact', head: true })

    if (department && department !== 'all') {
      countQuery = countQuery.eq('department', department)
    }
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }
    if (availability && availability !== 'all') {
      countQuery = countQuery.eq('availability', availability)
    }
    if (search) {
      countQuery = countQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,position.ilike.%${search}%`)
    }

    const { count } = await countQuery

    console.log('[Admin Staff API] Successfully fetched staff')
    return NextResponse.json({ 
      staff: staff || [], 
      total: count || 0,
      limit,
      offset 
    })

  } catch (error) {
    console.error('[Admin Staff API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Staff API] POST request started')
    
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

    if (action === 'create') {
      const validatedData = createStaffSchema.parse(data)

      // Check if email already exists
      const { data: existingStaff } = await supabase
        .from('staff_profiles')
        .select('email')
        .eq('email', validatedData.email)
        .single()

      if (existingStaff) {
        return NextResponse.json({ error: 'Email address already exists' }, { status: 400 })
      }

      // Generate employee ID
      const employee_id = `EMP${Date.now()}`

      const { data: newStaff, error } = await supabase
        .from('staff_profiles')
        .insert({
          ...validatedData,
          employee_id,
          status: 'active',
          availability: 'available',
          performance_rating: 0,
          tours_completed: 0
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Staff API] Error creating staff:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ error: 'Staff management system not set up. Please run database migrations.' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
      }

      console.log('[Admin Staff API] Successfully created staff member:', newStaff.id)
      return NextResponse.json({ staff: newStaff }, { status: 201 })

    } else if (action === 'schedule') {
      const validatedData = scheduleStaffSchema.parse(data)

      // Validate that either event_id or tour_id is provided
      if (!validatedData.event_id && !validatedData.tour_id) {
        return NextResponse.json({ error: 'Either event_id or tour_id is required' }, { status: 400 })
      }

      // Validate time range
      const startTime = new Date(validatedData.shift_start)
      const endTime = new Date(validatedData.shift_end)
      
      if (endTime <= startTime) {
        return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
      }

      // Check for scheduling conflicts
      const { data: conflicts } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', validatedData.staff_id)
        .neq('status', 'cancelled')
        .or(`shift_start.lte.${validatedData.shift_end},shift_end.gte.${validatedData.shift_start}`)

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'Staff member has conflicting schedule' }, { status: 400 })
      }

      const { data: schedule, error } = await supabase
        .from('staff_schedules')
        .insert(validatedData)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin Staff API] Error creating schedule:', error)
        return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
      }

      return NextResponse.json({ schedule }, { status: 201 })

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

    console.error('[Admin Staff API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin Staff API] PUT request started')
    
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
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
    }

    const validatedData = updateStaffSchema.parse(updateData)

    // Check if staff member exists
    const { data: existingStaff } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const { data: updatedStaff, error } = await supabase
      .from('staff_profiles')
      .update(validatedData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('[Admin Staff API] Error updating staff:', error)
      return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
    }

    console.log('[Admin Staff API] Successfully updated staff member:', id)
    return NextResponse.json({ staff: updatedStaff })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Admin Staff API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('[Admin Staff API] DELETE request started')
    
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

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
    }

    // Check if staff member exists
    const { data: existingStaff } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Soft delete by updating status to terminated
    const { error } = await supabase
      .from('staff_profiles')
      .update({ status: 'terminated' })
      .eq('id', id)

    if (error) {
      console.error('[Admin Staff API] Error deleting staff:', error)
      return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
    }

    console.log('[Admin Staff API] Successfully deleted staff member:', id)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Admin Staff API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 