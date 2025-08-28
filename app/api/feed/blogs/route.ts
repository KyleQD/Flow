import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Feed Blogs API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Use the authenticated supabase client if available, otherwise create a service client
    let supabase
    if (authResult) {
      supabase = authResult.supabase
      console.log('[Feed Blogs API] Using authenticated client')
    } else {
      // For public feed viewing, we can use a service client
      const { createClient } = await import('@/lib/supabase/server')
      supabase = await createClient()
      console.log('[Feed Blogs API] Using service client for public access')
    }

    console.log('[Feed Blogs API] Fetching blog posts, limit:', limit)

    // Get blog posts (posts with type 'blog' or content that looks like a blog)
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
      .or('type.eq.blog,content.ilike.%blog%')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (postsError) {
      console.error('[Feed Blogs API] Error fetching blog posts:', postsError)
      return NextResponse.json(
        { error: 'Failed to fetch blog posts' },
        { status: 500 }
      )
    }

    console.log('[Feed Blogs API] Found blog posts:', posts?.length || 0)

    // Transform posts to match expected format
    const transformedPosts = (posts || []).map((post: any) => ({
      id: post.id,
      title: post.content.length > 80 ? post.content.slice(0, 77) + '…' : post.content,
      description: post.content,
      author: {
        id: post.user_id,
        name: post.profiles?.username || 'user',
        username: post.profiles?.username || 'user',
        avatar_url: post.profiles?.avatar_url || '',
        is_verified: post.profiles?.verified || false
      },
      cover_image: post.media_urls?.[0] || undefined,
      created_at: post.created_at,
      engagement: {
        likes: post.likes_count || 0,
        views: 0,
        shares: 0,
        comments: post.comments_count || 0
      },
      metadata: {
        url: `/blog/${post.id}`,
        tags: ['Blog Post'],
        reading_time: Math.ceil(post.content.length / 200) // Rough estimate
      },
      relevance_score: 0.85
    }))

    return NextResponse.json({ 
      success: true,
      data: transformedPosts 
    })
  } catch (error) {
    console.error('[Feed Blogs API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 