import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('[Profile Create API] POST request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult
    console.log('[Profile Create API] User authenticated:', user.id)

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('[Profile Create API] Profile already exists for user:', user.id)
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists',
        profileId: existingProfile.id 
      })
    }

    // Create basic profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: user.email?.split('@')[0] || `user-${user.id.slice(0, 8)}`,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        bio: null,
        avatar_url: user.user_metadata?.avatar_url || null,
        location: null,
        website: null,
        is_verified: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('[Profile Create API] Failed to create profile:', createError)
      return NextResponse.json(
        { error: 'Failed to create profile', details: createError.message },
        { status: 500 }
      )
    }

    console.log('[Profile Create API] Profile created successfully:', newProfile.username)

    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      profile: newProfile 
    })
  } catch (error) {
    console.error('[Profile Create API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
