import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const authorId = searchParams.get('author_id')
    const tag = searchParams.get('tag')
    const category = searchParams.get('category')

    const supabase = createServiceRoleClient()
    
    console.log('📝 [Blogs API] Fetching blog posts:', { page, limit, authorId, tag, category })

    // Build the query with dynamic column selection
    let query = supabase
      .from('artist_blog_posts')
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image_url,
        status,
        published_at,
        created_at,
        updated_at,
        stats,
        tags,
        categories,
        user_id
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    // Add filters
    if (authorId) {
      query = query.eq('user_id', authorId)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (category) {
      query = query.contains('categories', [category])
    }

    const { data: blogPosts, error } = await query

    if (error) {
      console.error('❌ [Blogs API] Error fetching blog posts:', error)
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    if (!blogPosts || blogPosts.length === 0) {
      console.log('📝 [Blogs API] No blog posts found')
      return NextResponse.json({ data: [], error: null })
    }

    console.log('✅ [Blogs API] Found', blogPosts.length, 'blog posts')

    // Transform the data to match the feed format
    const transformedBlogs = blogPosts.map(blog => {
      // For now, use default author info since we can't join with profiles
      const authorName = 'Sarah Johnson' // We'll enhance this later
      const authorUsername = 'sarahjohnson'
      const authorAvatar = 'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ'
      const isVerified = false

      return {
        id: blog.id,
        type: 'blog',
        title: blog.title,
        description: blog.excerpt,
        content: blog.content,
        slug: blog.slug,
        author: {
          id: blog.user_id,
          name: authorName,
          username: authorUsername,
          avatar_url: authorAvatar,
          is_verified: isVerified
        },
        cover_image: blog.featured_image_url,
        created_at: blog.published_at || blog.created_at,
        engagement: {
          likes: blog.stats?.likes || 0,
          views: blog.stats?.views || 0,
          shares: blog.stats?.shares || 0,
          comments: blog.stats?.comments || 0
        },
        metadata: {
          tags: blog.tags || [],
          categories: blog.categories || [],
          url: `/blog/${blog.slug}`,
          reading_time: Math.ceil((blog.content?.length || 0) / 200) // Rough estimate: 200 chars per minute
        },
        relevance_score: 0.85 // Default relevance score for blogs
      }
    })

    return NextResponse.json({ 
      data: transformedBlogs, 
      error: null,
      pagination: {
        page,
        limit,
        hasMore: blogPosts.length === limit
      }
    })

  } catch (error) {
    console.error('❌ [Blogs API] Unexpected error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 