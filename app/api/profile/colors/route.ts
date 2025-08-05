import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'
import { z } from 'zod'

// Validation schema for profile colors
const profileColorsSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  background_gradient: z.enum(['emerald', 'blue', 'purple', 'rose', 'amber', 'cyan', 'indigo', 'custom']),
  custom_gradient_start: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  custom_gradient_end: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  use_dark_mode: z.boolean().default(false),
  enable_animations: z.boolean().default(true),
  enable_glow_effects: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    // Use the same authentication method as other API routes
    const auth = await authenticateApiRequest(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, supabase } = auth

    // Get profile colors from metadata
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile colors:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile colors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      colors: profile.metadata?.profile_colors || {
        primary_color: "#10b981",
        secondary_color: "#059669",
        accent_color: "#34d399",
        background_gradient: "emerald",
        custom_gradient_start: "#0f172a",
        custom_gradient_end: "#1e293b",
        use_dark_mode: false,
        enable_animations: true,
        enable_glow_effects: true,
      }
    })

  } catch (error) {
    console.error('Error in GET /api/profile/colors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Use the same authentication method as other API routes
    const auth = await authenticateApiRequest(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, supabase } = auth

    // Parse and validate request body
    const body = await request.json()
    const validatedColors = profileColorsSchema.parse(body)

    // First, get existing metadata
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching existing metadata:', fetchError)
      return NextResponse.json(
        { error: 'Failed to update profile colors' },
        { status: 500 }
      )
    }

    // Update metadata with new colors
    const existingMetadata = existingProfile?.metadata || {}
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        metadata: {
          ...existingMetadata,
          profile_colors: validatedColors
        }
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile colors:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile colors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile colors updated successfully',
      colors: validatedColors
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid color data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in PUT /api/profile/colors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Use the same authentication method as other API routes
    const auth = await authenticateApiRequest(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, supabase } = auth

    // Reset to default colors
    const defaultColors = {
      primary_color: "#10b981",
      secondary_color: "#059669",
      accent_color: "#34d399",
      background_gradient: "emerald" as const,
      custom_gradient_start: "#0f172a",
      custom_gradient_end: "#1e293b",
      use_dark_mode: false,
      enable_animations: true,
      enable_glow_effects: true,
    }

    // First, get existing metadata
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching existing metadata:', fetchError)
      return NextResponse.json(
        { error: 'Failed to reset profile colors' },
        { status: 500 }
      )
    }

    // Update metadata with default colors
    const existingMetadata = existingProfile?.metadata || {}
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        metadata: {
          ...existingMetadata,
          profile_colors: defaultColors
        }
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error resetting profile colors:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset profile colors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile colors reset to default',
      colors: defaultColors
    })

  } catch (error) {
    console.error('Error in DELETE /api/profile/colors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 