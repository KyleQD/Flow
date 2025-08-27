import { NextRequest, NextResponse } from 'next/server'
import { VenueSchedulingService } from '@/lib/services/venue-scheduling.service'
import { authenticateApiRequest } from '@/lib/auth/api-auth'
import { z } from 'zod'

// Validation schemas
const createShiftSchema = z.object({
  venue_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  shift_title: z.string().min(1, 'Shift title is required'),
  shift_description: z.string().optional(),
  shift_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  location: z.string().optional(),
  department: z.string().optional(),
  role_required: z.string().optional(),
  staff_needed: z.number().int().positive().default(1),
  hourly_rate: z.number().positive().optional(),
  flat_rate: z.number().positive().optional(),
  is_recurring: z.boolean().default(false),
  recurring_pattern: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  dress_code: z.string().optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional()
})

const getShiftsSchema = z.object({
  venue_id: z.string().uuid(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.array(z.enum(['open', 'filled', 'in_progress', 'completed', 'cancelled'])).optional(),
  department: z.string().optional(),
  staff_member_id: z.string().uuid().optional()
})

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryData = {
      venue_id: searchParams.get('venue_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      status: searchParams.get('status')?.split(','),
      department: searchParams.get('department'),
      staff_member_id: searchParams.get('staff_member_id')
    }

    const validatedData = getShiftsSchema.parse(queryData)

    // Check if user has permission to view shifts for this venue
    const hasPermission = await VenueSchedulingService.checkVenuePermission(
      user.id,
      validatedData.venue_id,
      'shifts.view'
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const shifts = await VenueSchedulingService.getShifts(validatedData.venue_id, {
      startDate: validatedData.start_date,
      endDate: validatedData.end_date,
      status: validatedData.status as any,
      department: validatedData.department,
      staffMemberId: validatedData.staff_member_id as any
    })

    return NextResponse.json({ shifts })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Venue Shifts API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createShiftSchema.parse(body)

    // Check if user has permission to create shifts for this venue
    const hasPermission = await VenueSchedulingService.checkVenuePermission(
      user.id,
      validatedData.venue_id,
      'shifts.create'
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate time range
    const startTime = new Date(`2000-01-01T${validatedData.start_time}`)
    const endTime = new Date(`2000-01-01T${validatedData.end_time}`)
    
    if (endTime <= startTime) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    const shift = await VenueSchedulingService.createShift({
      venue_id: validatedData.venue_id,
      event_id: validatedData.event_id ?? null,
      shift_title: validatedData.shift_title,
      shift_description: validatedData.shift_description ?? null,
      shift_date: validatedData.shift_date,
      start_time: validatedData.start_time,
      end_time: validatedData.end_time,
      location: validatedData.location ?? null,
      department: validatedData.department ?? null,
      role_required: validatedData.role_required ?? null,
      staff_needed: validatedData.staff_needed,
      staff_assigned: 0,
      hourly_rate: validatedData.hourly_rate ?? null,
      flat_rate: validatedData.flat_rate ?? null,
      is_recurring: validatedData.is_recurring ?? false,
      recurring_pattern: validatedData.recurring_pattern ?? null,
      shift_status: 'open',
      priority: validatedData.priority,
      dress_code: validatedData.dress_code ?? null,
      special_requirements: validatedData.special_requirements ?? null,
      notes: validatedData.notes ?? null,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Venue Shifts API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 