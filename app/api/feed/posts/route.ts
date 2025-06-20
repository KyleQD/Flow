import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const feedType = searchParams.get('type') || 'all'

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get posts first, then we'll fetch profile data separately
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (feedType === 'all') {
      // Show all public posts
      query = query.eq('visibility', 'public')
    } else if (feedType === 'following' && user) {
      // Show posts from followed users + user's own posts
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (following && following.length > 0) {
        const followingIds = following.map(f => f.following_id)
        // Include user's own posts and posts from people they follow
        followingIds.push(user.id)
        
        query = query
          .in('user_id', followingIds)
          .or(`visibility.eq.public,and(visibility.eq.followers,user_id.in.(${followingIds.join(',')}))`)
      } else {
        // If not following anyone, show only user's own posts
        query = query.eq('user_id', user.id)
      }
    } else if (feedType === 'personal' && user) {
      // Show only user's own posts
      query = query.eq('user_id', user.id)
    } else {
      // Default to public posts for unauthenticated users
      query = query.eq('visibility', 'public')
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ data: [], error: null })
    }

    // Get unique user IDs from posts
    const userIds = [...new Set(posts.map(post => post.user_id))]
    
    // Fetch profile data for all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, metadata, avatar_url, is_verified')
      .in('id', userIds)

    // Fetch post likes if user is authenticated
    let postLikes: any[] = []
    if (user) {
      const postIds = posts.map(post => post.id)
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds)
      postLikes = likes || []
    }

    // Create profile lookup map
    const profileMap = new Map()
    profiles?.forEach(profile => {
      profileMap.set(profile.id, {
        username: profile.metadata?.username || 'user',
        full_name: profile.metadata?.full_name || 'Anonymous User',
        avatar_url: profile.avatar_url,
        is_verified: profile.is_verified || false
      })
    })

    // Combine posts with profile data and like information
    const extendedPosts = posts.map(post => {
      const profileData = profileMap.get(post.user_id) || {
        username: 'user',
        full_name: 'Anonymous User',
        avatar_url: null,
        is_verified: false
      }

      const postLikeCount = postLikes.filter(like => like.post_id === post.id).length
      const isLiked = user ? postLikes.some(like => like.post_id === post.id && like.user_id === user.id) : false

      return {
        ...post,
        profiles: profileData,
        is_liked: isLiked,
        like_count: postLikeCount
      }
    })

    return NextResponse.json({ data: extendedPosts, error: null })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, type = 'text', visibility = 'public', location, hashtags = [] } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { data: null, error: 'Content is required' },
        { status: 400 }
      )
    }

    // Extract hashtags from content
    const hashtagMatches = content.match(/#[a-zA-Z0-9_]+/g)
    const extractedHashtags = hashtagMatches?.map((tag: string) => tag.substring(1).toLowerCase()) || []
    const allHashtags = [...extractedHashtags, ...hashtags]

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        type,
        visibility,
        location: location || null,
        hashtags: allHashtags,
      })
      .select('*')
      .single()

    if (postError) {
      console.error('Error creating post:', postError)
      return NextResponse.json(
        { data: null, error: postError.message },
        { status: 500 }
      )
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, metadata, avatar_url, is_verified')
      .eq('id', user.id)
      .single()

    // Format the response with profile data
    const extendedPost = {
      ...post,
      profiles: {
        username: profile?.metadata?.username || 'user',
        full_name: profile?.metadata?.full_name || 'Anonymous User',
        avatar_url: profile?.avatar_url,
        is_verified: profile?.is_verified || false
      },
      is_liked: false,
      like_count: 0
    }

    // Create hashtag records
    if (allHashtags.length > 0) {
      for (const hashtag of allHashtags) {
        await supabase
          .from('hashtags')
          .upsert({ name: hashtag }, { onConflict: 'name' })

        const { data: hashtagData } = await supabase
          .from('hashtags')
          .select('id')
          .eq('name', hashtag)
          .single()

        if (hashtagData) {
          await supabase
            .from('post_hashtags')
            .insert({
              post_id: post.id,
              hashtag_id: hashtagData.id
            })
        }
      }
    }

    return NextResponse.json({ data: extendedPost, error: null })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 