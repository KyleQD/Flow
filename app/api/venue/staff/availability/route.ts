import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { VenueSchedulingService } from "@/lib/services/venue-scheduling.service"

const availabilitySchema = z.object({
  staff_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  availability: z.array(z.object({
    day_of_week: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    is_available: z.boolean(),
    notes: z.string().max(200).optional()
  }))
})

const timeOffRequestSchema = z.object({
  staff_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  request_type: z.enum(["vacation", "sick", "personal", "other"]),
  reason: z.string().min(1).max(500),
  is_half_day: z.boolean().optional(),
  half_day_type: z.enum(["morning", "afternoon"]).optional()
})

const updateTimeOffSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(["approved", "denied"]),
  response_note: z.string().max(500).optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const venueId = searchParams.get("venue_id")
    const staffId = searchParams.get("staff_id")
    const weekStartDate = searchParams.get("week_start_date")
    
    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 })
    }

    const schedulingService = new VenueSchedulingService(supabase)
    
    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(venueId)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    if (staffId && weekStartDate) {
      // Get specific staff availability for a week
      const availability = await schedulingService.getStaffAvailability(staffId, weekStartDate)
      return NextResponse.json({ availability })
    } else if (staffId) {
      // Get all availability for a staff member
      const availability = await schedulingService.getStaffAvailabilityHistory(staffId)
      return NextResponse.json({ availability })
    } else {
      // Get all availability for the venue
      const availability = await schedulingService.getVenueAvailability(venueId, weekStartDate)
      return NextResponse.json({ availability })
    }
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const validatedData = availabilitySchema.parse(body)
    const schedulingService = new VenueSchedulingService(supabase)

    // Check permissions
    const hasPermission = await schedulingService.checkVenuePermission(validatedData.venue_id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Validate that the staff member belongs to this venue
    const isVenueStaff = await schedulingService.isStaffMemberOfVenue(
      validatedData.staff_id,
      validatedData.venue_id
    )
    if (!isVenueStaff) {
      return NextResponse.json({ error: "Staff member not found in venue" }, { status: 404 })
    }

    // Check for conflicts with existing shifts
    const conflicts = await schedulingService.checkAvailabilityConflicts(
      validatedData.staff_id,
      validatedData.week_start_date,
      validatedData.availability
    )

    if (conflicts.length > 0) {
      return NextResponse.json({
        error: "Availability conflicts with existing shifts",
        conflicts
      }, { status: 409 })
    }

    const availability = await schedulingService.updateStaffAvailability({
      staffId: validatedData.staff_id,
      venueId: validatedData.venue_id,
      weekStartDate: validatedData.week_start_date,
      availability: validatedData.availability
    })

    return NextResponse.json({ availability }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating availability:", error)
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    )
  }
} 