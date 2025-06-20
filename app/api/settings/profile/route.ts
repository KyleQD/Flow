import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Update request body:', body)

    // Get current profile first
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Current profile:', currentProfile, 'Error:', fetchError)

    const updatedMetadata = {
      ...currentProfile?.metadata,
      full_name: body.full_name,
      username: body.username,
      bio: body.bio,
      phone: body.phone,
      location: body.location,
      website: body.website,
      instagram: body.instagram,
      twitter: body.twitter,
      show_email: body.showEmail,
      show_phone: body.showPhone,
      show_location: body.showLocation,
    }

    console.log('Updated metadata:', updatedMetadata)

    // Use upsert to handle both create and update cases
    // IMPORTANT: Preserve existing avatar_url if it exists
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
        // Preserve existing avatar_url to prevent overwrites from profile form saves
        ...(currentProfile?.avatar_url && { avatar_url: currentProfile.avatar_url }),
      })
      .select()

    console.log('Upsert result:', { data, error })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: error.message,
        success: false 
      }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No data returned from database operation',
        success: false 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Profile updated successfully!' 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 