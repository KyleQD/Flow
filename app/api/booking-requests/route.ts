import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Validation schemas
const bookingDetailsSchema = z.object({
  performanceType: z.string().min(1, "Performance type is required"),
  description: z.string().min(1, "Description is required"),
  performanceDate: z.string().min(1, "Performance date is required"),
  soundcheckTime: z.string().optional(),
  performanceTime: z.string().optional(),
  duration: z.string().optional(),
  venue: z.string().min(1, "Venue is required"),
  location: z.string().min(1, "Location is required"),
  compensation: z.string().min(1, "Compensation is required"),
  requirements: z.string().optional(),
  additionalNotes: z.string().optional()
})

const createBookingRequestSchema = z.object({
  artistId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  eventId: z.string().uuid().optional(),
  tourId: z.string().uuid().optional(),
  bookingDetails: bookingDetailsSchema,
  token: z.string().optional(),
  status: z.enum(["pending", "accepted", "declined"]).default("pending"),
  requestType: z.enum(["performance", "collaboration"]).default("performance")
})

const updateBookingRequestSchema = z.object({
  token: z.string().optional(),
  status: z.enum(["pending", "accepted", "declined"]),
  userId: z.string().uuid().optional(),
  responseMessage: z.string().optional()
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const eventId = searchParams.get("eventId")
    const tourId = searchParams.get("tourId")
    const artistId = searchParams.get("artistId")

    let query = supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (token) {
      query = query.eq("token", token)
    }
    if (eventId) {
      query = query.eq("event_id", eventId)
    }
    if (tourId) {
      query = query.eq("tour_id", tourId)
    }
    if (artistId) {
      query = query.eq("artist_id", artistId)
    }

    const { data: bookingRequests, error } = await query

    if (error) throw error

    if (token) {
      // Return single booking request for token lookup
      const booking = bookingRequests[0]
      if (!booking) {
        return NextResponse.json(
          { error: "Booking request not found" },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: booking })
    }

    return NextResponse.json({ success: true, data: bookingRequests })
  } catch (error) {
    console.error("Error fetching booking requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch booking requests" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = createBookingRequestSchema.parse(body)

    const { data: bookingRequest, error } = await supabase
      .from("booking_requests")
      .insert({
        artist_id: validatedData.artistId,
        email: validatedData.email,
        phone: validatedData.phone,
        event_id: validatedData.eventId,
        tour_id: validatedData.tourId,
        booking_details: validatedData.bookingDetails,
        token: validatedData.token,
        status: validatedData.status,
        request_type: validatedData.requestType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: bookingRequest })
  } catch (error) {
    console.error("Error creating booking request:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create booking request" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const validatedData = updateBookingRequestSchema.parse(body)

    const updateData = {
      status: validatedData.status,
      artist_id: validatedData.userId,
      response_message: validatedData.responseMessage,
      updated_at: new Date().toISOString()
    }

    let query = supabase
      .from("booking_requests")
      .update(updateData)

    if (validatedData.token) {
      query = query.eq("token", validatedData.token)
    }

    const { data: bookingRequest, error } = await query.select().single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Booking request not found" },
          { status: 404 }
        )
      }
      throw error
    }

    // Create notification for admin when booking is accepted/declined
    if (validatedData.status === "accepted" || validatedData.status === "declined") {
      await supabase
        .from("notifications")
        .insert({
          type: "booking_response",
          content: `An artist has ${validatedData.status} your booking request`,
          metadata: {
            bookingRequestId: bookingRequest.id,
            artistId: bookingRequest.artist_id,
            eventId: bookingRequest.event_id,
            tourId: bookingRequest.tour_id,
            status: validatedData.status,
            responseMessage: validatedData.responseMessage
          },
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ success: true, data: bookingRequest })
  } catch (error) {
    console.error("Error updating booking request:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update booking request" },
      { status: 500 }
    )
  }
} 