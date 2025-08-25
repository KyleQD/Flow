import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"
import { cookies } from "next/headers"

// Validation schemas
const positionDetailsSchema = z.object({
  title: z.string().min(1, "Position title is required"),
  description: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  employmentType: z.enum(['full_time', 'part_time', 'contractor', 'volunteer', 'intern']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  compensation: z.string().optional(),
  hourlyRate: z.number().optional(),
  salary: z.number().optional(),
  benefits: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([])
})

const inviteExistingUserSchema = z.object({
  venueId: z.string().uuid(),
  userId: z.string().uuid(),
  positionDetails: positionDetailsSchema,
  onboardingTemplateId: z.string().uuid().optional(),
  inviteMessage: z.string().optional(),
  permissions: z.object({
    manageBookings: z.boolean().default(false),
    manageEvents: z.boolean().default(false),
    viewAnalytics: z.boolean().default(false),
    manageTeam: z.boolean().default(false),
    manageDocuments: z.boolean().default(false)
  }).default({
    manageBookings: false,
    manageEvents: false,
    viewAnalytics: false,
    manageTeam: false,
    manageDocuments: false
  })
})

const inviteNewUserSchema = z.object({
  venueId: z.string().uuid(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  positionDetails: positionDetailsSchema,
  onboardingTemplateId: z.string().uuid().optional(),
  inviteMessage: z.string().optional(),
  inviteMethod: z.enum(['email', 'link', 'qr']),
  expirationDays: z.number().min(1).max(30).default(7)
})

const generateInviteLinkSchema = z.object({
  venueId: z.string().uuid(),
  positionDetails: positionDetailsSchema,
  onboardingTemplateId: z.string().uuid().optional(),
  inviteMessage: z.string().optional(),
  expirationDays: z.number().min(1).max(30).default(7),
  maxUses: z.number().min(1).max(100).optional()
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    const supabase = await createClient()

    switch (action) {
      case 'invite_existing_user':
        return await handleInviteExistingUser(supabase, data)
      
      case 'invite_new_user':
        return await handleInviteNewUser(supabase, data)
      
      case 'generate_invite_link':
        return await handleGenerateInviteLink(supabase, data)
      
      case 'bulk_invite':
        return await handleBulkInvite(supabase, data)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Enhanced onboarding API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleInviteExistingUser(supabase: any, data: any) {
  const validatedData = inviteExistingUserSchema.parse(data)

  // Check if user is already a team member
  const { data: existingMember } = await supabase
    .from('venue_team_members')
    .select('id, status')
    .eq('venue_id', validatedData.venueId)
    .eq('user_id', validatedData.userId)
    .single()

  if (existingMember) {
    if (existingMember.status === 'active') {
      return NextResponse.json(
        { error: "User is already an active team member" },
        { status: 409 }
      )
    }
    // Update existing invitation
    const { error: updateError } = await supabase
      .from('venue_team_members')
      .update({
        position: validatedData.positionDetails.title,
        department: validatedData.positionDetails.department,
        employment_type: validatedData.positionDetails.employmentType,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMember.id)

    if (updateError) throw updateError
  } else {
    // Create new team member invitation
    const { error: insertError } = await supabase
      .from('venue_team_members')
      .insert({
        venue_id: validatedData.venueId,
        user_id: validatedData.userId,
        position: validatedData.positionDetails.title,
        department: validatedData.positionDetails.department,
        employment_type: validatedData.positionDetails.employmentType,
        status: 'pending',
        permissions: validatedData.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (insertError) throw insertError
  }

  // Create onboarding candidate record
  const { data: candidate, error: candidateError } = await supabase
    .from('staff_onboarding_candidates')
    .insert({
      venue_id: validatedData.venueId,
      user_id: validatedData.userId,
      name: 'Existing User', // Will be updated when user accepts
      email: 'existing@user.com', // Will be updated when user accepts
      position: validatedData.positionDetails.title,
      department: validatedData.positionDetails.department,
      status: 'pending',
      stage: 'invitation',
      employment_type: validatedData.positionDetails.employmentType,
      start_date: validatedData.positionDetails.startDate,
      salary: validatedData.positionDetails.salary,
      template_id: validatedData.onboardingTemplateId,
      onboarding_progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (candidateError) throw candidateError

  // Send notification to user
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: validatedData.userId,
      type: 'team_invitation',
      title: 'You\'ve been invited to join a team!',
      content: `You've been invited to join as ${validatedData.positionDetails.title} in ${validatedData.positionDetails.department}`,
      metadata: {
        venue_id: validatedData.venueId,
        candidate_id: candidate.id,
        position: validatedData.positionDetails.title,
        department: validatedData.positionDetails.department,
        message: validatedData.inviteMessage
      },
      created_at: new Date().toISOString()
    })

  if (notificationError) {
    console.warn("Failed to send notification:", notificationError)
  }

  return NextResponse.json({
    success: true,
    data: {
      candidate_id: candidate.id,
      message: "Invitation sent successfully"
    }
  })
}

async function handleInviteNewUser(supabase: any, data: any) {
  const validatedData = inviteNewUserSchema.parse(data)

  // Generate unique invitation token
  const invitationToken = crypto.randomUUID()

  // Create invitation record
  const { data: invitation, error: invitationError } = await supabase
    .from('staff_invitations')
    .insert({
      email: validatedData.email,
      phone: validatedData.phone,
      position_details: validatedData.positionDetails,
      token: invitationToken,
      status: 'pending',
      expires_at: new Date(Date.now() + validatedData.expirationDays * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (invitationError) throw invitationError

  // Create onboarding candidate record
  const { data: candidate, error: candidateError } = await supabase
    .from('staff_onboarding_candidates')
    .insert({
      venue_id: validatedData.venueId,
      name: validatedData.email.split('@')[0], // Temporary name
      email: validatedData.email,
      phone: validatedData.phone,
      position: validatedData.positionDetails.title,
      department: validatedData.positionDetails.department,
      status: 'pending',
      stage: 'invitation',
      employment_type: validatedData.positionDetails.employmentType,
      start_date: validatedData.positionDetails.startDate,
      salary: validatedData.positionDetails.salary,
      template_id: validatedData.onboardingTemplateId,
      invitation_token: invitationToken,
      onboarding_progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (candidateError) throw candidateError

  // Send email invitation
  if (validatedData.email) {
    const signupLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${invitationToken}&type=staff&venue=${validatedData.venueId}`
    
    const { error: emailError } = await supabase
      .from('notifications')
      .insert({
        type: 'staff_signup_invite',
        title: 'You\'ve been invited to join our team!',
        content: `You've been invited to join as ${validatedData.positionDetails.title} in ${validatedData.positionDetails.department}`,
        metadata: {
          email: validatedData.email,
          candidate_id: candidate.id,
          invitation_token: invitationToken,
          position: validatedData.positionDetails.title,
          department: validatedData.positionDetails.department,
          signup_link: signupLink,
          message: validatedData.inviteMessage,
          venue_id: validatedData.venueId
        },
        created_at: new Date().toISOString()
      })

    if (emailError) {
      console.warn("Failed to send email notification:", emailError)
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      candidate_id: candidate.id,
      invitation_token: invitationToken,
      signup_link: `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${invitationToken}&type=staff&venue=${validatedData.venueId}`,
      message: "Invitation sent successfully"
    }
  })
}

async function handleGenerateInviteLink(supabase: any, data: any) {
  const validatedData = generateInviteLinkSchema.parse(data)

  // Generate unique invitation token
  const invitationToken = crypto.randomUUID()

  // Create invitation record
  const { data: invitation, error: invitationError } = await supabase
    .from('staff_invitations')
    .insert({
      position_details: validatedData.positionDetails,
      token: invitationToken,
      status: 'pending',
      expires_at: new Date(Date.now() + validatedData.expirationDays * 24 * 60 * 60 * 1000).toISOString(),
      max_uses: validatedData.maxUses,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (invitationError) throw invitationError

  // Create onboarding candidate record
  const { data: candidate, error: candidateError } = await supabase
    .from('staff_onboarding_candidates')
    .insert({
      venue_id: validatedData.venueId,
      name: 'Invitation Link User', // Will be updated when user signs up
      email: 'invitation@link.com', // Will be updated when user signs up
      position: validatedData.positionDetails.title,
      department: validatedData.positionDetails.department,
      status: 'pending',
      stage: 'invitation',
      employment_type: validatedData.positionDetails.employmentType,
      start_date: validatedData.positionDetails.startDate,
      salary: validatedData.positionDetails.salary,
      template_id: validatedData.onboardingTemplateId,
      invitation_token: invitationToken,
      onboarding_progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (candidateError) throw candidateError

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${invitationToken}&type=staff&venue=${validatedData.venueId}`

  return NextResponse.json({
    success: true,
    data: {
      candidate_id: candidate.id,
      invitation_token: invitationToken,
      invite_link: inviteLink,
      qr_code_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/qr?data=${encodeURIComponent(inviteLink)}`,
      expires_at: invitation.expires_at,
      max_uses: invitation.max_uses,
      message: "Invitation link generated successfully"
    }
  })
}

async function handleBulkInvite(supabase: any, data: any) {
  const { emails, positionDetails, venueId, onboardingTemplateId, inviteMessage } = data

  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: "No emails provided" }, { status: 400 })
  }

  const results = []
  const errors = []

  for (const email of emails) {
    try {
      const result = await handleInviteNewUser(supabase, {
        venueId,
        email,
        positionDetails,
        onboardingTemplateId,
        inviteMessage,
        inviteMethod: 'email',
        expirationDays: 7
      })

      const resultData = await result.json()
      if (resultData.success) {
        results.push({ email, success: true, data: resultData.data })
      } else {
        errors.push({ email, error: resultData.error })
      }
    } catch (error: any) {
      errors.push({ email, error: error.message })
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      total: emails.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    }
  })
}

// GET endpoint to retrieve invitation details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const action = searchParams.get('action')

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const supabase = await createClient()

    switch (action) {
      case 'validate_token':
        return await validateInvitationToken(supabase, token)
      
      case 'get_invitation_details':
        return await getInvitationDetails(supabase, token)
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Enhanced onboarding GET error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

async function validateInvitationToken(supabase: any, token: string) {
  const { data: invitation, error } = await supabase
    .from('staff_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (error || !invitation) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 })
  }

  // Check if token has expired
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation has expired" }, { status: 410 })
  }

  // Check if max uses exceeded
  if (invitation.max_uses && invitation.uses_count >= invitation.max_uses) {
    return NextResponse.json({ error: "Invitation usage limit exceeded" }, { status: 410 })
  }

  return NextResponse.json({
    success: true,
    data: {
      valid: true,
      invitation
    }
  })
}

async function getInvitationDetails(supabase: any, token: string) {
  const { data: invitation, error } = await supabase
    .from('staff_invitations')
    .select(`
      *,
      candidate:staff_onboarding_candidates(*)
    `)
    .eq('token', token)
    .single()

  if (error || !invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      invitation,
      candidate: invitation.candidate
    }
  })
} 