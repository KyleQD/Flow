import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'following' // 'following' or 'followers'

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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