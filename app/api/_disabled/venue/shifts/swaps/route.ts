import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { authenticateApiRequest } from "@/lib/auth/api-auth"
import { VenueSchedulingService } from "@/lib/services/venue-scheduling.service"

const createSwapSchema = z.object({
  requester_id: z.string().uuid(),
  target_shift_id: z.string().uuid(),
  offered_shift_id: z.string().uuid(),
  reason: z.string().min(1).max(500)
})

const updateSwapSchema = z.object({
  swap_id: z.string().uuid(),
  status: z.enum(["approved", "denied"]),
  response_note: z.string().max(500).optional()
})

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    
    // Get venue ID from query params or user context
    const venueId = searchParams.get("venue_id")
    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 })
    }

    const status = searchParams.get("status")
    const requesterId = searchParams.get("requester_id")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Check permissions
    const hasPermission = await VenueSchedulingService.checkVenuePermission(user.id, venueId, 'shifts.view')
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const swaps = await VenueSchedulingService.getShiftSwaps(
      venueId,
      {
        status: status ? [status as any] : undefined,
        staffMemberId: requesterId || undefined
      }
    )

    return NextResponse.json({ swaps })
  } catch (error) {
    console.error("Error fetching shift swaps:", error)
    return NextResponse.json(
      { error: "Failed to fetch shift swaps" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    
    const validatedData = createSwapSchema.parse(body)
    // Get venue ID from the target shift
    const targetShift = await VenueSchedulingService.getShiftWithDetails(validatedData.target_shift_id)
    if (!targetShift) {
      return NextResponse.json({ error: "Target shift not found" }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await VenueSchedulingService.checkVenuePermission(user.id, targetShift.venue_id, 'shifts.swaps')
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Validate that requester is assigned to the offered shift
    const offeredShift = await VenueSchedulingService.getShiftWithDetails(validatedData.offered_shift_id)
    if (!offeredShift) {
      return NextResponse.json({ error: "Offered shift not found" }, { status: 404 })
    }

    const offeredAssignments = await VenueSchedulingService.getShiftAssignments(validatedData.offered_shift_id)
    const isAssignedToOffered = offeredAssignments.some(a => a.staff_member_id === validatedData.requester_id)
    if (!isAssignedToOffered) {
      return NextResponse.json({ error: "You must be assigned to the offered shift" }, { status: 400 })
    }

    // Check for existing pending swaps
    const existingSwaps = await VenueSchedulingService.getShiftSwaps(
      targetShift.venue_id,
      { status: ['pending'] as any, staffMemberId: validatedData.requester_id }
    )
    
    if (existingSwaps.length > 0) {
      return NextResponse.json({ error: "You already have a pending swap request" }, { status: 400 })
    }

    const swap = await VenueSchedulingService.requestShiftSwap({
      venue_id: targetShift.venue_id,
      original_shift_id: validatedData.offered_shift_id,
      original_staff_id: validatedData.requester_id,
      requested_staff_id: validatedData.requester_id,
      swap_reason: validatedData.reason,
      request_status: 'pending'
    } as any)

    return NextResponse.json({ swap }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating shift swap:", error)
    return NextResponse.json(
      { error: "Failed to create shift swap" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    
    const validatedData = updateSwapSchema.parse(body)
    const updatedSwap = validatedData.status === 'approved'
      ? await VenueSchedulingService.approveShiftSwap(validatedData.swap_id, user.id)
      : await VenueSchedulingService.denyShiftSwap(validatedData.swap_id, user.id, validatedData.response_note || '')

    return NextResponse.json({ swap: updatedSwap })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating shift swap:", error)
    return NextResponse.json(
      { error: "Failed to update shift swap" },
      { status: 500 }
    )
  }
} 