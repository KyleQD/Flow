import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
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
    const supabase = createClient()
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

    const schedulingService = new VenueSchedulingService(supabase)
    
    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(venueId)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const swaps = await schedulingService.getShiftSwaps({
      venueId,
      status: status as any,
      requesterId,
      limit,
      offset
    })

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
    const supabase = createClient()
    const body = await request.json()
    
    const validatedData = createSwapSchema.parse(body)
    const schedulingService = new VenueSchedulingService(supabase)

    // Get venue ID from the target shift
    const targetShift = await schedulingService.getShift(validatedData.target_shift_id)
    if (!targetShift) {
      return NextResponse.json({ error: "Target shift not found" }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(targetShift.venue_id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Validate that requester is assigned to the offered shift
    const offeredShift = await schedulingService.getShift(validatedData.offered_shift_id)
    if (!offeredShift) {
      return NextResponse.json({ error: "Offered shift not found" }, { status: 404 })
    }

    const isAssignedToOffered = await schedulingService.isStaffAssignedToShift(
      validatedData.requester_id,
      validatedData.offered_shift_id
    )
    if (!isAssignedToOffered) {
      return NextResponse.json({ error: "You must be assigned to the offered shift" }, { status: 400 })
    }

    // Check for existing pending swaps
    const existingSwaps = await schedulingService.getShiftSwaps({
      venueId: targetShift.venue_id,
      requesterId: validatedData.requester_id,
      status: "pending"
    })
    
    if (existingSwaps.length > 0) {
      return NextResponse.json({ error: "You already have a pending swap request" }, { status: 400 })
    }

    const swap = await schedulingService.createShiftSwap({
      requesterId: validatedData.requester_id,
      targetShiftId: validatedData.target_shift_id,
      offeredShiftId: validatedData.offered_shift_id,
      reason: validatedData.reason
    })

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
    const supabase = createClient()
    const body = await request.json()
    
    const validatedData = updateSwapSchema.parse(body)
    const schedulingService = new VenueSchedulingService(supabase)

    // Get the swap to check permissions
    const swap = await schedulingService.getShiftSwap(validatedData.swap_id)
    if (!swap) {
      return NextResponse.json({ error: "Shift swap not found" }, { status: 404 })
    }

    // Get venue ID from the target shift
    const targetShift = await schedulingService.getShift(swap.target_shift_id)
    if (!targetShift) {
      return NextResponse.json({ error: "Target shift not found" }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(targetShift.venue_id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Update the swap status
    const updatedSwap = await schedulingService.updateShiftSwapStatus(
      validatedData.swap_id,
      validatedData.status,
      validatedData.response_note
    )

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