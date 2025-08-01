import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Validation schema for staff onboarding
const createStaffAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'volunteer']).default('full_time'),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  hourly_rate: z.number().optional(),
  skills: z.array(z.string()).default([]),
  notes: z.string().optional(),
  venue_id: z.string().uuid('Invalid venue ID'),
  onboarding_template_id: z.string().optional(),
  permissions: z.object({
    manage_bookings: z.boolean().default(false),
    manage_events: z.boolean().default(false),
    view_analytics: z.boolean().default(false),
    manage_team: z.boolean().default(false),
    manage_documents: z.boolean().default(false)
  }).default({
    manage_bookings: false,
    manage_events: false,
    view_analytics: false,
    manage_team: false,
    manage_documents: false
  })
})

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ [Staff Onboarding API] Starting staff account creation...')
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ [Staff Onboarding API] Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ [Staff Onboarding API] User authenticated:', user.id)

    const body = await request.json()
    const validatedData = createStaffAccountSchema.parse(body)

    console.log('📋 [Staff Onboarding API] Validated data:', {
      name: validatedData.name,
      email: validatedData.email,
      position: validatedData.position,
      department: validatedData.department,
      venue_id: validatedData.venue_id
    })

    // Check if user has access to this venue
    const { data: venueAccess, error: venueError } = await supabase
      .from('venue_profiles')
      .select('id, user_id')
      .eq('id', validatedData.venue_id)
      .single()

    if (venueError || !venueAccess) {
      console.error('❌ [Staff Onboarding API] Venue not found or access denied:', venueError)
      return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 404 })
    }

    if (venueAccess.user_id !== user.id) {
      console.error('❌ [Staff Onboarding API] User does not own this venue')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if email already exists in the system
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const emailExists = existingUser.users.some(u => u.email === validatedData.email)

    if (emailExists) {
      console.log('⚠️ [Staff Onboarding API] Email already exists, creating staff profile only')
      
      // Find the existing user
      const existingUserData = existingUser.users.find(u => u.email === validatedData.email)
      if (!existingUserData) {
        return NextResponse.json({ error: 'User account not found' }, { status: 404 })
      }

      // Create staff profile for existing user
      const { data: staffProfile, error: staffError } = await supabase
        .from('venue_team_members')
        .insert({
          venue_id: validatedData.venue_id,
          user_id: existingUserData.id,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          role: validatedData.position,
          department: validatedData.department,
          employment_type: validatedData.employment_type,
          hire_date: validatedData.start_date,
          hourly_rate: validatedData.hourly_rate,
          status: 'active',
          is_available: true,
          onboarding_completed: false,
          permissions: validatedData.permissions,
          notes: validatedData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (staffError) {
        console.error('❌ [Staff Onboarding API] Error creating staff profile:', staffError)
        return NextResponse.json({ error: 'Failed to create staff profile' }, { status: 500 })
      }

      console.log('✅ [Staff Onboarding API] Staff profile created for existing user:', staffProfile.id)
      
      return NextResponse.json({
        success: true,
        staff_profile: staffProfile,
        user_account: {
          id: existingUserData.id,
          email: existingUserData.email,
          existing_user: true
        },
        message: 'Staff profile created for existing user account'
      })
    }

    // Generate a temporary password for the new user
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    
    console.log('🔐 [Staff Onboarding API] Creating new user account...')

    // Create new user account
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: validatedData.name,
        role: 'staff',
        venue_id: validatedData.venue_id,
        position: validatedData.position,
        department: validatedData.department,
        onboarding_completed: false
      }
    })

    if (userError) {
      console.error('❌ [Staff Onboarding API] Error creating user account:', userError)
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    console.log('✅ [Staff Onboarding API] User account created:', newUser.user.id)

    // Create staff profile
    const { data: staffProfile, error: staffError } = await supabase
      .from('venue_team_members')
      .insert({
        venue_id: validatedData.venue_id,
        user_id: newUser.user.id,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        role: validatedData.position,
        department: validatedData.department,
        employment_type: validatedData.employment_type,
        hire_date: validatedData.start_date,
        hourly_rate: validatedData.hourly_rate,
        status: 'active',
        is_available: true,
        onboarding_completed: false,
        permissions: validatedData.permissions,
        notes: validatedData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (staffError) {
      console.error('❌ [Staff Onboarding API] Error creating staff profile:', staffError)
      // Clean up the user account if staff profile creation fails
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: 'Failed to create staff profile' }, { status: 500 })
    }

    console.log('✅ [Staff Onboarding API] Staff profile created:', staffProfile.id)

    // Create onboarding record if template is provided
    if (validatedData.onboarding_template_id) {
      const { error: onboardingError } = await supabase
        .from('staff_onboarding')
        .insert({
          staff_id: staffProfile.id,
          template_id: validatedData.onboarding_template_id,
          status: 'in_progress',
          progress: 0,
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (onboardingError) {
        console.warn('⚠️ [Staff Onboarding API] Failed to create onboarding record:', onboardingError)
      }
    }

    // Send welcome email with temporary password
    try {
      const { error: emailError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: validatedData.email,
        options: {
          data: {
            full_name: validatedData.name,
            temp_password: tempPassword,
            venue_name: venueAccess.name || 'Your Venue',
            position: validatedData.position
          }
        }
      })

      if (emailError) {
        console.warn('⚠️ [Staff Onboarding API] Failed to send welcome email:', emailError)
      }
    } catch (emailError) {
      console.warn('⚠️ [Staff Onboarding API] Email sending failed:', emailError)
    }

    console.log('✅ [Staff Onboarding API] Staff onboarding completed successfully')

    return NextResponse.json({
      success: true,
      staff_profile: staffProfile,
      user_account: {
        id: newUser.user.id,
        email: newUser.user.email,
        existing_user: false,
        temp_password: tempPassword
      },
      message: 'Staff member onboarded successfully'
    })

  } catch (error) {
    console.error('❌ [Staff Onboarding API] Unexpected error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    // Get onboarding candidates and staff members for the venue
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('staff_onboarding')
      .select(`
        *,
        staff:venue_team_members(*)
      `)
      .eq('staff.venue_id', venueId)

    if (onboardingError) {
      console.error('Error fetching onboarding data:', onboardingError)
      return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      onboarding_data: onboardingData || []
    })

  } catch (error) {
    console.error('Error in GET /api/venue/staff-onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 