import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
}) : null

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 503 }
      )
    }

    const { bookingId, eventId, ticketQuantity } = await req.json()

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title, price")
      .eq("id", eventId)
      .single()

    if (eventError) throw eventError
    if (!event) throw new Error("Event not found")

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title,
              description: `Ticket x${ticketQuantity}`,
            },
            unit_amount: Math.round(event.price * 100), // Convert to cents
          },
          quantity: ticketQuantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings?success=true&booking_id=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings?canceled=true`,
      metadata: {
        bookingId,
        eventId,
        ticketQuantity: ticketQuantity.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Error creating payment session" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === "paid") {
      const { bookingId, eventId, ticketQuantity } = session.metadata!
      
      // Update booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)

      if (updateError) throw updateError

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    )
  }
} 