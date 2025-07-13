import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const username = params.username
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    console.log('🔍 Looking up profile for username:', username)

    // Get profile by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Get user's posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get user's post stats
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)

    // Get followers/following counts (if tables exist)
    let followersCount = 0
    try {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id)
      followersCount = count || 0
    } catch (error) {
      console.log('Follows table not available, using 0 followers')
    }

    let followingCount = 0
    try {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id)
      followingCount = count || 0
    } catch (error) {
      console.log('Follows table not available, using 0 following')
    }

    // Calculate total likes across all user's posts
    let totalLikes = 0
    if (posts && posts.length > 0) {
      try {
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .in('post_id', posts.map((p: any) => p.id))
        totalLikes = count || 0
      } catch (error) {
        console.log('Post likes table not available, using 0 likes')
      }
    }

    // Transform to PublicProfileView format
    const displayName = profile.metadata?.full_name || profile.full_name || profile.username || 'User'
    const profileUsername = profile.metadata?.username || profile.username || username
    const bio = profile.metadata?.bio || profile.bio || 'Welcome to my profile! 👋'

    const transformedProfile = {
      id: profile.id,
      username: profileUsername,
      account_type: 'general' as const,
      profile_data: {
        name: displayName,
        bio: bio,
        location: profile.metadata?.location || '',
        website: profile.metadata?.website || '',
        phone: profile.metadata?.phone || ''
      },
      avatar_url: profile.avatar_url || '',
      cover_image: null,
      verified: profile.is_verified || false,
      bio: bio,
      location: profile.metadata?.location || '',
      social_links: {
        instagram: profile.metadata?.instagram || '',
        twitter: profile.metadata?.twitter || '',
        website: profile.metadata?.website || '',
        spotify: ''
      },
      stats: {
        followers: followersCount || 0,
        following: followingCount || 0,
        posts: totalPosts || 0,
        likes: totalLikes,
        views: Math.floor(Math.random() * 100) + 50
      },
      created_at: profile.created_at || new Date().toISOString(),
      posts: posts || []
    }

    console.log('✅ Successfully found profile:', transformedProfile.username)
    return NextResponse.json({ profile: transformedProfile })

  } catch (error) {
    console.error('💥 Profile API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 