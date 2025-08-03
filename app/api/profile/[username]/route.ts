import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // First, try to find in demo profiles
    const { data: demoProfile, error: demoError } = await supabase
      .from('demo_profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (!demoError && demoProfile) {
      return NextResponse.json({
        success: true,
        profile: {
          ...demoProfile,
          is_demo: true
        }
      })
    }

    // Next, try to find in real profiles by joining with auth users
    const { data: realProfile, error: realError } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        username,
        bio,
        avatar_url,
        created_at,
        updated_at
      `)
      .eq('username', username)
      .single()

    if (!realError && realProfile) {
      // Check if this user has an artist profile
      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', realProfile.id)
        .single()

      // Check if this user has a venue profile
      const { data: venueProfile } = await supabase
        .from('venue_profiles')
        .select('*')
        .eq('user_id', realProfile.id)
        .single()

      // Determine account type and format profile data
      let profileData: any = {
        id: realProfile.id,
        username: realProfile.username,
        account_type: 'general',
        profile_data: {
          name: realProfile.name
        },
        avatar_url: realProfile.avatar_url,
        verified: false,
        bio: realProfile.bio,
        stats: {
          followers: 0,
          following: 0,
          posts: 0,
          likes: 0,
          views: 0
        },
        created_at: realProfile.created_at,
        is_demo: false
      }

      if (artistProfile) {
        profileData.account_type = 'artist'
        profileData.profile_data = {
          artist_name: artistProfile.artist_name,
          name: artistProfile.artist_name,
          genres: artistProfile.genres
        }
        profileData.verified = artistProfile.verification_status === 'verified'
        profileData.bio = artistProfile.bio || realProfile.bio
        profileData.social_links = artistProfile.social_links
      } else if (venueProfile) {
        profileData.account_type = 'venue'
        profileData.profile_data = {
          venue_name: venueProfile.venue_name,
          name: venueProfile.venue_name,
          capacity: venueProfile.capacity,
          venue_types: venueProfile.venue_types
        }
        profileData.verified = venueProfile.verification_status === 'verified'
        profileData.bio = venueProfile.description || realProfile.bio
        profileData.location = venueProfile.city && venueProfile.state ? 
          `${venueProfile.city}, ${venueProfile.state}` : 
          venueProfile.city || venueProfile.state
      }

      return NextResponse.json({
        success: true,
        profile: profileData
      })
    }

    // Profile not found
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}