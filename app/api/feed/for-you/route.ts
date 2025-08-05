import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Feed For You API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Use the authenticated supabase client if available, otherwise create a service client
    let supabase
    if (authResult) {
      supabase = authResult.supabase
      console.log('[Feed For You API] Using authenticated client')
    } else {
      // For public feed viewing, we can use a service client
      const { createClient } = await import('@/lib/supabase/server')
      supabase = await createClient()
      console.log('[Feed For You API] Using service client for public access')
    }

    console.log('[Feed For You API] Fetching personalized posts, limit:', limit)

    // Get personalized posts (for now, just return recent posts)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        media_urls,
        likes_count,
        comments_count,
        created_at,
        updated_at,
        user_id,
        profiles:user_id (
          id,
          username,
          avatar_url,
          verified
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (postsError) {
      console.error('[Feed For You API] Error fetching posts:', postsError)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    console.log('[Feed For You API] Found posts:', posts?.length || 0)

    // Transform posts to match expected format
    const transformedPosts = (posts || []).map(post => ({
      id: post.id,
      content: post.content,
      media_urls: post.media_urls,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user_id,
        username: post.profiles?.username || 'user',
        avatar_url: post.profiles?.avatar_url || '',
        verified: post.profiles?.verified || false
      }
    }))

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error('[Feed For You API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 