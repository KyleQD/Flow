import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Settings Profile API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    console.log('[Settings Profile API] User authenticated:', user.id)

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        account_type,
        profile_data,
        avatar_url,
        cover_image,
        verified,
        bio,
        location,
        social_links,
        created_at
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('[Settings Profile API] Profile not found for user:', user.id)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('[Settings Profile API] Profile found:', profile.username)

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[Settings Profile API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Settings Profile API] PUT request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult
    const body = await request.json()

    console.log('[Settings Profile API] Updating profile for user:', user.id)

    // Update the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        username: body.username,
        bio: body.bio,
        location: body.location,
        profile_data: {
          name: body.full_name,
          phone: body.phone,
          website: body.website
        },
        social_links: {
          instagram: body.instagram,
          twitter: body.twitter,
          website: body.website
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (profileError) {
      console.error('[Settings Profile API] Error updating profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('[Settings Profile API] Profile updated successfully')

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[Settings Profile API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 