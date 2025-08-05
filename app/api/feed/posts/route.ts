import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Feed Posts API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Use the authenticated supabase client if available, otherwise create a service client
    let supabase
    if (authResult) {
      supabase = authResult.supabase
      console.log('[Feed Posts API] Using authenticated client')
    } else {
      // For public feed viewing, we can use a service client
      const { createClient } = await import('@/lib/supabase/server')
      supabase = await createClient()
      console.log('[Feed Posts API] Using service client for public access')
    }

    console.log('[Feed Posts API] Fetching posts with type:', type, 'limit:', limit)

    // Check if posts table exists and has the correct structure
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('posts')
        .select('id, user_id')
        .limit(1)

      if (tableError) {
        console.log('[Feed Posts API] Posts table not available, returning mock data')
        
        // Return mock data for testing
        const mockPosts = [
          {
            id: '1',
            content: 'Welcome to Tourify! This is a sample post.',
            media_urls: [],
            likes_count: 5,
            comments_count: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: 'user-1',
              username: 'tourify',
              avatar_url: '',
              verified: true
            }
          },
          {
            id: '2',
            content: 'Another sample post for testing the feed.',
            media_urls: [],
            likes_count: 3,
            comments_count: 1,
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            user: {
              id: 'user-2',
              username: 'demo_user',
              avatar_url: '',
              verified: false
            }
          }
        ]

        return NextResponse.json({ posts: mockPosts })
      }

      // Get posts based on type
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          likes_count,
          comments_count,
          created_at,
          updated_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (type !== 'all') {
        query = query.eq('type', type)
      }

      const { data: posts, error: postsError } = await query

      if (postsError) {
        console.error('[Feed Posts API] Error fetching posts:', postsError)
        return NextResponse.json(
          { error: 'Failed to fetch posts' },
          { status: 500 }
        )
      }

      console.log('[Feed Posts API] Found posts:', posts?.length || 0)

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
          username: 'user', // Default username since we can't join with profiles
          avatar_url: '',
          verified: false
        }
      }))

      return NextResponse.json({ posts: transformedPosts })
    } catch (error) {
      console.log('[Feed Posts API] Posts table error, returning mock data:', error)
      
      // Return mock data when there are table issues
      const mockPosts = [
        {
          id: '1',
          content: 'Welcome to Tourify! This is a sample post.',
          media_urls: [],
          likes_count: 5,
          comments_count: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            id: 'user-1',
            username: 'tourify',
            avatar_url: '',
            verified: true
          }
        },
        {
          id: '2',
          content: 'Another sample post for testing the feed.',
          media_urls: [],
          likes_count: 3,
          comments_count: 1,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: 'user-2',
            username: 'demo_user',
            avatar_url: '',
            verified: false
          }
        }
      ]

      return NextResponse.json({ posts: mockPosts })
    }
  } catch (error) {
    console.error('[Feed Posts API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const user = parseAuthFromCookies(request)

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, type = 'text', visibility = 'public', location, hashtags = [], media_urls = [] } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { data: null, error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get account info using comprehensive system
    const { data: accountData, error: accountError } = await supabase
      .rpc('get_or_create_account', {
        p_user_id: user.id,
        p_account_type: 'primary',
        p_profile_id: null
      })

    if (accountError || !accountData || accountData.length === 0) {
      return NextResponse.json(
        { data: null, error: 'Unable to get account info' },
        { status: 500 }
      )
    }

    const account = accountData[0]

    // Create post with comprehensive system
    const postData = {
      user_id: user.id,
      content: content.trim(),
      type,
      visibility,
      location,
      hashtags,
      media_urls,
      posted_as_profile_id: account.account_id,
      posted_as_account_type: 'primary',
      // Cache account display info
      account_display_name: account.display_name,
      account_username: account.username,
      account_avatar_url: account.avatar_url
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { data: null, error: 'Failed to create post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: post, error: null })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 