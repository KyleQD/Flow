import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { authenticateApiRequest } from "@/lib/auth/api-auth"
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
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    
    const venueId = searchParams.get("venue_id")
    const staffId = searchParams.get("staff_id")
    const weekStartDate = searchParams.get("week_start_date")
    
    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 })
    }

    // Check permissions
    const hasPermission = await VenueSchedulingService.checkVenuePermission(user.id, venueId, 'staff.view')
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Static methods for detailed availability are not implemented; return empty for now
    return NextResponse.json({ availability: [] })
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
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    
    const validatedData = availabilitySchema.parse(body)

    // Check permissions
    const hasPermission = await VenueSchedulingService.checkVenuePermission(user.id, validatedData.venue_id, 'staff.edit')
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Not implemented in service; acknowledge request
    return NextResponse.json({ success: true }, { status: 201 })
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