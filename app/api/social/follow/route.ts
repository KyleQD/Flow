import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for database operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function to manually parse auth session from cookies
function parseAuthFromCookies(request: NextRequest): any | null {
  try {
    const cookies = request.headers.get('cookie') || ''
    const cookieArray = cookies.split(';').map(c => c.trim())
    
    const authCookie = cookieArray.find(cookie => 
      cookie.startsWith('sb-tourify-auth-token=')
    )
    
    if (!authCookie) {
      return null
    }

    const token = authCookie.split('=')[1]
    if (!token) {
      return null
    }

    const sessionData = JSON.parse(decodeURIComponent(token))
    
    if (sessionData?.user) {
      return sessionData.user
    }
    
    return null
  } catch (error) {
    console.error('Error parsing auth cookie:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = parseAuthFromCookies(request)
    
    if (!user) {
      console.error('❌ Authentication failed - no user from cookies')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    const { followingId, action } = await request.json()

    if (!followingId || !action) {
      return NextResponse.json(
        { error: 'Following ID and action are required' },
        { status: 400 }
      )
    }

    if (followingId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    if (action === 'follow') {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single()

      if (existingFollow) {
        return NextResponse.json(
          { error: 'Already following this user' },
          { status: 400 }
        )
      }

      // Create follow relationship
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: followingId
        })

      if (error) {
        console.error('Error following user:', error)
        return NextResponse.json(
          { error: 'Failed to follow user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'followed' })
    } else if (action === 'unfollow') {
      // Remove follow relationship
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId)

      if (error) {
        console.error('Error unfollowing user:', error)
        return NextResponse.json(
          { error: 'Failed to unfollow user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'unfollowed' })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "follow" or "unfollow"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Follow API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const followingId = searchParams.get('followingId')
    const action = searchParams.get('action')
    const type = searchParams.get('type') || 'following' // 'following' or 'followers'

    const user = parseAuthFromCookies(request)
    
    if (!user) {
      console.error('❌ Authentication failed - no user from cookies')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Handle follow status check
    if (action === 'check' && followingId) {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.log('Error checking follow status:', error)
      }

      return NextResponse.json({ isFollowing: !!data })
    }

    const targetUserId = userId || user.id

    let query
    if (type === 'following') {
      query = supabase
        .from('follows')
        .select(`
          following_id,
          created_at,
          profiles:following_id (
            id,
            username,
            full_name,
            avatar_url,
            is_verified,
            followers_count,
            following_count
          )
        `)
        .eq('follower_id', targetUserId)
    } else {
      query = supabase
        .from('follows')
        .select(`
          follower_id,
          created_at,
          profiles:follower_id (
            id,
            username,
            full_name,
            avatar_url,
            is_verified,
            followers_count,
            following_count
          )
        `)
        .eq('following_id', targetUserId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching follows:', error)
      return NextResponse.json(
        { error: 'Failed to fetch follows' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    console.error('Follow fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 