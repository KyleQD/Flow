import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'recent' // 'recent', 'popular'

    const supabase = createServiceRoleClient()
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    
    if (!user) {
      console.log('[Personal Feed API] Auth error: No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Personal Feed API] Fetching personal feed for user:', user.id, 'sort:', sort)

    // Get user's following relationships
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = following?.map(f => f.following_id) || []
    
    // Include the user's own posts
    const allowedUserIds = [user.id, ...followingIds]

    if (allowedUserIds.length === 0) {
      console.log('[Personal Feed API] No followed accounts, returning empty feed')
      return NextResponse.json({
        success: true,
        content: [],
        total: 0,
        hasMore: false
      })
    }

    // Build the query for posts from followed accounts only
    let query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        type,
        visibility,
        location,
        hashtags,
        media_urls,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        updated_at,
        posted_as_profile_id,
        posted_as_account_type,
        account_display_name,
        account_username,
        account_avatar_url,
        profiles!inner(
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .in('user_id', allowedUserIds)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    const { data: posts, error } = await query

    if (error) {
      console.error('[Personal Feed API] Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      console.log('[Personal Feed API] No posts found for followed accounts')
      return NextResponse.json({
        success: true,
        content: [],
        total: 0,
        hasMore: false
      })
    }

    // Transform posts to match the expected format
    const transformedPosts = posts.map(post => ({
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      type: post.type,
      visibility: post.visibility,
      location: post.location,
      hashtags: post.hashtags || [],
      media_urls: post.media_urls || [],
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      posted_as_profile_id: post.posted_as_profile_id,
      posted_as_account_type: post.posted_as_account_type,
      account_display_name: post.account_display_name,
      account_username: post.account_username,
      account_avatar_url: post.account_avatar_url,
      profiles: post.profiles,
      is_liked: false, // Will be computed separately if needed
      like_count: post.likes_count || 0
    }))

    // Sort content based on parameter
    switch (sort) {
      case 'popular':
        transformedPosts.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count))
        break
      case 'recent':
      default:
        // Already sorted by created_at desc from the query
        break
    }

    console.log('[Personal Feed API] Successfully fetched personal feed:', {
      postsCount: transformedPosts.length,
      followedAccounts: followingIds.length,
      sort
    })

    return NextResponse.json({
      success: true,
      content: transformedPosts,
      total: transformedPosts.length,
      hasMore: transformedPosts.length === limit,
      followedAccounts: followingIds.length
    })

  } catch (error) {
    console.error('[Personal Feed API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 