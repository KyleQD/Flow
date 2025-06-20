import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { z } from "zod"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Validation schemas
const positionDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  compensation: z.string().optional()
})

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

const staffInviteSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  positionDetails: positionDetailsSchema,
  status: z.enum(["pending", "accepted", "declined"])
})

const staffSignupInviteSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  positionDetails: positionDetailsSchema,
  signupLink: z.string().url("Invalid signup link")
})

const bookingRequestSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  bookingDetails: bookingDetailsSchema,
  eventId: z.string().uuid().optional(),
  tourId: z.string().uuid().optional(),
  status: z.enum(["pending", "accepted", "declined"]),
  requestType: z.enum(["performance", "collaboration"])
})

const artistSignupInviteSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  bookingDetails: bookingDetailsSchema,
  eventDetails: z.object({
    title: z.string(),
    date: z.string().optional(),
    venue: z.string().optional(),
    location: z.string().optional()
  }),
  signupLink: z.string().url("Invalid signup link")
})

// Email templates
const emailTemplates = {
  staffInvite: (positionDetails: any) => ({
    subject: `New Position Invitation: ${positionDetails.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5; margin-bottom: 24px;">Position Invitation</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          You have been invited to join as ${positionDetails.title}
        </p>
        <div style="background-color: #F9FAFB; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #111827; margin-bottom: 16px;">Position Details:</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <strong>Title:</strong> ${positionDetails.title}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Description:</strong> ${positionDetails.description}
            </li>
            ${positionDetails.startDate ? `
              <li style="margin-bottom: 8px;">
                <strong>Start Date:</strong> ${new Date(positionDetails.startDate).toLocaleDateString()}
              </li>
            ` : ""}
            ${positionDetails.endDate ? `
              <li style="margin-bottom: 8px;">
                <strong>End Date:</strong> ${new Date(positionDetails.endDate).toLocaleDateString()}
              </li>
            ` : ""}
            ${positionDetails.location ? `
              <li style="margin-bottom: 8px;">
                <strong>Location:</strong> ${positionDetails.location}
              </li>
            ` : ""}
            ${positionDetails.compensation ? `
              <li style="margin-bottom: 8px;">
                <strong>Compensation:</strong> ${positionDetails.compensation}
              </li>
            ` : ""}
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Please log in to your Tourify account to accept or decline this invitation.
        </p>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View Invitation
          </a>
        </div>
      </div>
    `
  }),

  staffSignupInvite: (positionDetails: any, signupLink: string) => ({
    subject: `Join Tourify: ${positionDetails.title} Position`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5; margin-bottom: 24px;">Join Tourify</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          You have been invited to join Tourify as ${positionDetails.title}
        </p>
        <div style="background-color: #F9FAFB; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #111827; margin-bottom: 16px;">Position Details:</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <strong>Title:</strong> ${positionDetails.title}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Description:</strong> ${positionDetails.description}
            </li>
            ${positionDetails.startDate ? `
              <li style="margin-bottom: 8px;">
                <strong>Start Date:</strong> ${new Date(positionDetails.startDate).toLocaleDateString()}
              </li>
            ` : ""}
            ${positionDetails.endDate ? `
              <li style="margin-bottom: 8px;">
                <strong>End Date:</strong> ${new Date(positionDetails.endDate).toLocaleDateString()}
              </li>
            ` : ""}
            ${positionDetails.location ? `
              <li style="margin-bottom: 8px;">
                <strong>Location:</strong> ${positionDetails.location}
              </li>
            ` : ""}
            ${positionDetails.compensation ? `
              <li style="margin-bottom: 8px;">
                <strong>Compensation:</strong> ${positionDetails.compensation}
              </li>
            ` : ""}
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Click the button below to create your Tourify account and view the full position details:
        </p>
        <div style="text-align: center;">
          <a href="${signupLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Create Account
          </a>
        </div>
      </div>
    `
  }),

  bookingRequest: (bookingDetails: any, eventDetails?: any) => ({
    subject: `Performance Booking Request: ${bookingDetails.performanceType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E11D48; margin-bottom: 24px;">🎵 Performance Booking Request</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          You have received a booking request for a ${bookingDetails.performanceType} performance.
        </p>
        <div style="background-color: #FEF2F2; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #E11D48;">
          <h2 style="color: #111827; margin-bottom: 16px;">Performance Details:</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <strong>Type:</strong> ${bookingDetails.performanceType}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Date:</strong> ${new Date(bookingDetails.performanceDate).toLocaleDateString()}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Venue:</strong> ${bookingDetails.venue}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Location:</strong> ${bookingDetails.location}
            </li>
            ${bookingDetails.performanceTime ? `
              <li style="margin-bottom: 8px;">
                <strong>Performance Time:</strong> ${bookingDetails.performanceTime}
              </li>
            ` : ""}
            ${bookingDetails.soundcheckTime ? `
              <li style="margin-bottom: 8px;">
                <strong>Soundcheck Time:</strong> ${bookingDetails.soundcheckTime}
              </li>
            ` : ""}
            ${bookingDetails.duration ? `
              <li style="margin-bottom: 8px;">
                <strong>Duration:</strong> ${bookingDetails.duration}
              </li>
            ` : ""}
            <li style="margin-bottom: 8px;">
              <strong>Compensation:</strong> ${bookingDetails.compensation}
            </li>
          </ul>
        </div>
        ${bookingDetails.description ? `
          <div style="background-color: #F9FAFB; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #111827; margin-bottom: 8px;">Description:</h3>
            <p style="margin: 0;">${bookingDetails.description}</p>
          </div>
        ` : ""}
        ${bookingDetails.requirements ? `
          <div style="background-color: #F0F9FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #111827; margin-bottom: 8px;">Technical Requirements:</h3>
            <p style="margin: 0;">${bookingDetails.requirements}</p>
          </div>
        ` : ""}
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Please log in to your Tourify account to accept or decline this booking request.
        </p>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background-color: #E11D48; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View Booking Request
          </a>
        </div>
      </div>
    `
  }),

  artistSignupInvite: (bookingDetails: any, eventDetails: any, signupLink: string) => ({
    subject: `Performance Opportunity: ${eventDetails.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E11D48; margin-bottom: 24px;">🎵 Performance Opportunity</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          You have been invited to perform at ${eventDetails.title}. Join Tourify to view the full details and respond to this booking request.
        </p>
        <div style="background-color: #FEF2F2; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #E11D48;">
          <h2 style="color: #111827; margin-bottom: 16px;">Performance Overview:</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">
              <strong>Event:</strong> ${eventDetails.title}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Type:</strong> ${bookingDetails.performanceType}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Date:</strong> ${new Date(bookingDetails.performanceDate).toLocaleDateString()}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Venue:</strong> ${bookingDetails.venue}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Location:</strong> ${bookingDetails.location}
            </li>
            <li style="margin-bottom: 8px;">
              <strong>Compensation:</strong> ${bookingDetails.compensation}
            </li>
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Create your Tourify account to view the complete performance details and respond to this booking request:
        </p>
        <div style="text-align: center;">
          <a href="${signupLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #E11D48; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Join Tourify & Respond
          </a>
        </div>
      </div>
    `
  })
}

export async function POST(req: Request) {
  try {
    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      )
    }

    const { type, data } = await req.json()

    switch (type) {
      case "staff_invite": {
        const validatedData = staffInviteSchema.parse(data)
        
        // Create notification in database
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: validatedData.userId,
            type: "staff_invite",
            content: `You have been invited to join as ${validatedData.positionDetails.title}`,
            metadata: {
              positionDetails: validatedData.positionDetails,
              status: validatedData.status
            },
            created_at: new Date().toISOString()
          })

        if (notificationError) throw notificationError

        // Get user's email
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", validatedData.userId)
          .single()

        if (userError) throw userError

        // Send email notification
        const emailTemplate = emailTemplates.staffInvite(validatedData.positionDetails)
        await resend.emails.send({
          from: "Tourify <notifications@tourify.com>",
          to: userData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        })
        break
      }

      case "staff_signup_invite": {
        const validatedData = staffSignupInviteSchema.parse(data)

        // Send email with signup link
        const emailTemplate = emailTemplates.staffSignupInvite(
          validatedData.positionDetails,
          validatedData.signupLink
        )
        await resend.emails.send({
          from: "Tourify <notifications@tourify.com>",
          to: validatedData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        })
        break
      }

      case "booking_request": {
        const validatedData = bookingRequestSchema.parse(data)
        
        // Create notification in database
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: validatedData.userId,
            type: "booking_request",
            content: `You have received a booking request for ${validatedData.bookingDetails.performanceType}`,
            metadata: {
              bookingDetails: validatedData.bookingDetails,
              eventId: validatedData.eventId,
              tourId: validatedData.tourId,
              status: validatedData.status,
              requestType: validatedData.requestType
            },
            created_at: new Date().toISOString()
          })

        if (notificationError) throw notificationError

        // Get user's email
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", validatedData.userId)
          .single()

        if (userError) throw userError

        // Send email notification
        const emailTemplate = emailTemplates.bookingRequest(validatedData.bookingDetails)
        await resend.emails.send({
          from: "Tourify <notifications@tourify.com>",
          to: userData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        })
        break
      }

      case "artist_signup_invite": {
        const validatedData = artistSignupInviteSchema.parse(data)

        // Send email with signup link
        const emailTemplate = emailTemplates.artistSignupInvite(
          validatedData.bookingDetails,
          validatedData.eventDetails,
          validatedData.signupLink
        )
        await resend.emails.send({
          from: "Tourify <notifications@tourify.com>",
          to: validatedData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        })
        break
      }

      case "booking_confirmation": {
        const { bookingId } = data
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            event:events(title, date, location),
            user:profiles(email, name)
          `)
          .eq("id", bookingId)
          .single()

        if (bookingError) throw bookingError
        if (!booking) throw new Error("Booking not found")

        await resend.emails.send({
          from: "Tourify <notifications@tourify.com>",
          to: booking.user.email,
          subject: "Booking Confirmation - Tourify",
          html: `
            <h1>Booking Confirmation</h1>
            <p>Dear ${booking.user.name},</p>
            <p>Your booking for ${booking.event.title} has been confirmed!</p>
            <p>Event Details:</p>
            <ul>
              <li>Date: ${new Date(booking.event.date).toLocaleDateString()}</li>
              <li>Location: ${booking.event.location}</li>
              <li>Number of Tickets: ${booking.ticket_quantity}</li>
              <li>Total Amount: $${booking.total_price}</li>
            </ul>
            <p>Thank you for choosing Tourify!</p>
          `,
        })
        break
      }

      case "event_reminder": {
        const { eventId } = data
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            *,
            event:events(title, date, location),
            user:profiles(email, name)
          `)
          .eq("event_id", eventId)
          .eq("status", "confirmed")

        if (bookingsError) throw bookingsError

        for (const booking of bookings) {
          await resend.emails.send({
            from: "Tourify <notifications@tourify.com>",
            to: booking.user.email,
            subject: "Event Reminder - Tourify",
            html: `
              <h1>Event Reminder</h1>
              <p>Dear ${booking.user.name},</p>
              <p>This is a reminder for your upcoming event: ${booking.event.title}</p>
              <p>Event Details:</p>
              <ul>
                <li>Date: ${new Date(booking.event.date).toLocaleDateString()}</li>
                <li>Location: ${booking.event.location}</li>
                <li>Number of Tickets: ${booking.ticket_quantity}</li>
              </ul>
              <p>We look forward to seeing you there!</p>
            `,
          })
        }
        break
      }

      case "booking_cancellation": {
        const { bookingId } = data
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            event:events(title, date, location),
            user:profiles(email, name)
          `)
          .eq("id", bookingId)
          .single()

        if (bookingError) throw bookingError
        if (!booking) throw new Error("Booking not found")

        await resend.emails.send({
          from: "Tourify <notifications@tourify.com>",
          to: booking.user.email,
          subject: "Booking Cancellation - Tourify",
          html: `
            <h1>Booking Cancellation</h1>
            <p>Dear ${booking.user.name},</p>
            <p>Your booking for ${booking.event.title} has been cancelled.</p>
            <p>Event Details:</p>
            <ul>
              <li>Date: ${new Date(booking.event.date).toLocaleDateString()}</li>
              <li>Location: ${booking.event.location}</li>
              <li>Number of Tickets: ${booking.ticket_quantity}</li>
              <li>Total Amount: $${booking.total_price}</li>
            </ul>
            <p>If you did not request this cancellation, please contact our support team.</p>
          `,
        })
        break
      }

      default:
        throw new Error("Invalid notification type")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error sending notification" },
      { status: 500 }
    )
  }
} 