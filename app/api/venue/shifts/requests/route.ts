import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
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
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const venueId = searchParams.get("venue_id")
    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 })
    }

    const status = searchParams.get("status")
    const staffId = searchParams.get("staff_id")
    const requestType = searchParams.get("request_type")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const schedulingService = new VenueSchedulingService(supabase)
    
    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(venueId)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const requests = await schedulingService.getShiftRequests({
      venueId,
      status: status as any,
      staffId,
      requestType: requestType as any,
      limit,
      offset
    })

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
    const supabase = createClient()
    const body = await request.json()
    
    const validatedData = createRequestSchema.parse(body)
    const schedulingService = new VenueSchedulingService(supabase)

    // Get shift to check venue and validate request
    const shift = await schedulingService.getShift(validatedData.shift_id)
    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(shift.venue_id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Validate request type logic
    if (validatedData.request_type === "drop") {
      // Check if staff is assigned to the shift
      const isAssigned = await schedulingService.isStaffAssignedToShift(
        validatedData.staff_id,
        validatedData.shift_id
      )
      if (!isAssigned) {
        return NextResponse.json({ error: "You are not assigned to this shift" }, { status: 400 })
      }
    } else if (validatedData.request_type === "pickup") {
      // Check if staff is already assigned to the shift
      const isAssigned = await schedulingService.isStaffAssignedToShift(
        validatedData.staff_id,
        validatedData.shift_id
      )
      if (isAssigned) {
        return NextResponse.json({ error: "You are already assigned to this shift" }, { status: 400 })
      }

      // Check if shift is full
      const assignments = await schedulingService.getShiftAssignments(validatedData.shift_id)
      if (assignments.length >= shift.staff_needed) {
        return NextResponse.json({ error: "This shift is already full" }, { status: 400 })
      }
    }

    // Check for existing pending requests
    const existingRequests = await schedulingService.getShiftRequests({
      venueId: shift.venue_id,
      staffId: validatedData.staff_id,
      status: "pending"
    })
    
    if (existingRequests.length > 0) {
      return NextResponse.json({ error: "You already have a pending request" }, { status: 400 })
    }

    const shiftRequest = await schedulingService.createShiftRequest({
      staffId: validatedData.staff_id,
      shiftId: validatedData.shift_id,
      requestType: validatedData.request_type,
      reason: validatedData.reason
    })

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
    const supabase = createClient()
    const body = await request.json()
    
    const validatedData = updateRequestSchema.parse(body)
    const schedulingService = new VenueSchedulingService(supabase)

    // Get the request to check permissions
    const shiftRequest = await schedulingService.getShiftRequest(validatedData.request_id)
    if (!shiftRequest) {
      return NextResponse.json({ error: "Shift request not found" }, { status: 404 })
    }

    // Get shift to check venue
    const shift = await schedulingService.getShift(shiftRequest.shift_id)
    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(shift.venue_id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Update the request status
    const updatedRequest = await schedulingService.updateShiftRequestStatus(
      validatedData.request_id,
      validatedData.status,
      validatedData.response_note
    )

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