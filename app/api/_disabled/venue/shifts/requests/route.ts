import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { authenticateApiRequest } from "@/lib/auth/api-auth"
import { VenueSchedulingService } from "@/lib/services/venue-scheduling.service"

const createRequestSchema = z.object({
  staff_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  request_type: z.enum(["drop", "pickup"]),
  reason: z.string().min(1).max(500)
})

const updateRequestSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(["approved", "denied"]),
  response_note: z.string().max(500).optional()
})

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    
    const venueId = searchParams.get("venue_id")
    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 })
    }

    const status = searchParams.get("status")
    const staffId = searchParams.get("staff_id")
    const requestType = searchParams.get("request_type")
    // Check permissions
    const hasPermission = await VenueSchedulingService.checkVenuePermission(
      user.id,
      venueId,
      'shifts.view'
    )
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    let requests = await VenueSchedulingService.getShiftRequests(
      venueId,
      {
        status: status ? [status as any] : undefined,
        staffMemberId: staffId || undefined
      }
    )

    if (requestType) requests = requests.filter(r => r.request_type === requestType)

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching shift requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch shift requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    
    const validatedData = createRequestSchema.parse(body)
    // Get shift to check venue and validate request
    const shift = await VenueSchedulingService.getShiftWithDetails(validatedData.shift_id)
    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await VenueSchedulingService.checkVenuePermission(
      user.id,
      shift.venue_id,
      'shifts.requests'
    )
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Validate request type logic
    if (validatedData.request_type === "drop") {
      // Check if staff is assigned to the shift
      const assignments = await VenueSchedulingService.getShiftAssignments(validatedData.shift_id)
      const isAssigned = assignments.some(a => a.staff_member_id === validatedData.staff_id)
      if (!isAssigned) {
        return NextResponse.json({ error: "You are not assigned to this shift" }, { status: 400 })
      }
    } else if (validatedData.request_type === "pickup") {
      // Check if staff is already assigned to the shift
      const assignments2 = await VenueSchedulingService.getShiftAssignments(validatedData.shift_id)
      const isAssigned = assignments2.some(a => a.staff_member_id === validatedData.staff_id)
      if (isAssigned) {
        return NextResponse.json({ error: "You are already assigned to this shift" }, { status: 400 })
      }

      // Check if shift is full
      const assignments3 = await VenueSchedulingService.getShiftAssignments(validatedData.shift_id)
      if (assignments3.length >= (shift.staff_needed || 0)) {
        return NextResponse.json({ error: "This shift is already full" }, { status: 400 })
      }
    }

    // Check for existing pending requests
    const existingRequests = await VenueSchedulingService.getShiftRequests(
      shift.venue_id,
      { staffMemberId: validatedData.staff_id, status: ['pending'] as any }
    )
    
    if (existingRequests.length > 0) {
      return NextResponse.json({ error: "You already have a pending request" }, { status: 400 })
    }

    const shiftRequest = await VenueSchedulingService.requestShiftChange({
      staff_member_id: validatedData.staff_id,
      shift_id: validatedData.shift_id,
      request_type: validatedData.request_type as any,
      request_reason: validatedData.reason
    } as any)

    return NextResponse.json({ request: shiftRequest }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating shift request:", error)
    return NextResponse.json(
      { error: "Failed to create shift request" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    
    const validatedData = updateRequestSchema.parse(body)
    // Update the request status
    const updatedRequest = validatedData.status === 'approved'
      ? await VenueSchedulingService.approveShiftRequest(validatedData.request_id, user.id)
      : await VenueSchedulingService.denyShiftRequest(validatedData.request_id, user.id, validatedData.response_note || '')

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating shift request:", error)
    return NextResponse.json(
      { error: "Failed to update shift request" },
      { status: 500 }
    )
  }
} 