import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const authResult = await authenticateApiRequest(request)
    const resolvedParams = await params
    const username = decodeURIComponent(resolvedParams.username)

    console.log('[Profile Username API] Fetching profile for username:', username)

    // Use the authenticated supabase client if available, otherwise create a service client
    let supabase
    if (authResult) {
      supabase = authResult.supabase
      console.log('[Profile Username API] Using authenticated client')
    } else {
      // For public profile viewing, we can use a service client
      const { createClient } = await import('@/lib/supabase/server')
      supabase = await createClient()
      console.log('[Profile Username API] Using service client for public access')
    }

    // First, try to find the profile by username in the main profiles table
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        location,
        website,
        is_verified,
        followers_count,
        following_count,
        posts_count,
        created_at,
        updated_at
      `)
      .eq('username', username)
      .single()

    // If not found in main profiles table, try demo_profiles table
    if (profileError || !profile) {
      console.log('[Profile Username API] Profile not found in main table, checking demo_profiles...')
      
      const { data: demoProfile, error: demoProfileError } = await supabase
        .from('demo_profiles')
        .select(`
          id,
          username,
          full_name,
          bio,
          avatar_url,
          location,
          website,
          is_verified,
          followers_count,
          following_count,
          posts_count,
          stats,
          created_at,
          updated_at
        `)
        .eq('username', username)
        .single()

      if (demoProfileError || !demoProfile) {
        console.log('[Profile Username API] Profile not found in either table for username:', username)
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }

      console.log('[Profile Username API] Found profile in demo_profiles table:', demoProfile.username)
      profile = demoProfile
    } else {
      console.log('[Profile Username API] Found profile in main profiles table:', profile.username)
    }

    console.log('[Profile Username API] Found profile:', profile.username)

    // Initialize stats with default values
    let stats = {
      followers: profile.followers_count || 0,
      following: profile.following_count || 0,
      posts: profile.posts_count || 0,
      likes: 0,
      views: 0,
      streams: 0,
      events: 0,
      monthly_listeners: 0,
      total_revenue: 0,
      engagement_rate: 0
    }

    // If profile has stats from demo_profiles, use them
    if (profile.stats) {
      stats = {
        ...stats,
        ...profile.stats
      }
      console.log('[Profile Username API] Using stats from demo profile:', stats)
    } else {
      // Try to get additional stats from posts table if it exists
      try {
        const { count: postCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)

        if (postCount !== null) {
          stats.posts = postCount
        }
      } catch (error) {
        console.log('[Profile Username API] Posts table not available, using profile data')
      }

      // Get like count (sum of likes on posts) if posts table exists
      try {
        const { data: posts } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('user_id', profile.id)

        stats.likes = posts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0
      } catch (error) {
        console.log('[Profile Username API] Could not fetch likes data')
      }

      // Get view count (mock data for now)
      stats.views = Math.floor(Math.random() * 10000) + 1000
    }

    // Transform the profile to match the expected format
    const profileWithStats = {
      id: profile.id,
      username: profile.username,
      account_type: 'general' as const,
      profile_data: {
        name: profile.full_name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website
      },
      avatar_url: profile.avatar_url,
      cover_image: null,
      verified: profile.is_verified,
      bio: profile.bio,
      location: profile.location,
      social_links: {
        website: profile.website,
        instagram: null,
        twitter: null
      },
      stats,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }

    console.log('[Profile Username API] Returning profile with stats')

    return NextResponse.json({ profile: profileWithStats })
  } catch (error) {
    console.error('[Profile Username API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}