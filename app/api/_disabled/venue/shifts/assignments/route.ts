import { NextRequest, NextResponse } from 'next/server'
import { VenueSchedulingService } from '@/lib/services/venue-scheduling.service'
import { authenticateUser } from '@/lib/auth/api-auth'
import { z } from 'zod'

// Validation schemas
const createAssignmentSchema = z.object({
  shift_id: z.string().uuid(),
  staff_member_id: z.string().uuid(),
  assigned_by: z.string().uuid(),
  notes: z.string().optional()
})

const updateAssignmentSchema = z.object({
  assignment_id: z.string().uuid(),
  status: z.enum(['assigned', 'confirmed', 'declined', 'cancelled']),
  decline_reason: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shiftId = searchParams.get('shift_id')
    const staffMemberId = searchParams.get('staff_member_id')

    if (!shiftId && !staffMemberId) {
      return NextResponse.json({ error: 'Either shift_id or staff_member_id is required' }, { status: 400 })
    }

    let assignments
    if (shiftId) {
      assignments = await VenueSchedulingService.getShiftAssignments(shiftId)
    } else {
      assignments = await VenueSchedulingService.getShiftAssignmentsByStaff(staffMemberId!)
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('[Venue Shift Assignments API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAssignmentSchema.parse(body)

    // Check if user has permission to assign staff
    const shift = await VenueSchedulingService.getShiftWithDetails(validatedData.shift_id)
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const hasPermission = await VenueSchedulingService.checkVenuePermission(
      user.id,
      shift.venue_id,
      'shifts.assign'
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const assignment = await VenueSchedulingService.assignStaffToShift({
      ...validatedData,
      assigned_by: user.id
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Venue Shift Assignments API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAssignmentSchema.parse(body)

    const assignment = await VenueSchedulingService.updateAssignmentStatus(
      validatedData.assignment_id,
      validatedData.status,
      {
        declineReason: validatedData.decline_reason,
        notes: validatedData.notes
      }
    )

    return NextResponse.json({ assignment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Venue Shift Assignments API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 