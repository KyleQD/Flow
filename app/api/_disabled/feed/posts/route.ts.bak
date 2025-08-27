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
    return sessionData?.user || null
  } catch (error) {
    console.error('Error parsing auth cookie:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const feedType = searchParams.get('type') || 'all'

    const supabase = createServiceRoleClient()
    const user = parseAuthFromCookies(request)
    
    console.log('📊 Feed API called with comprehensive system:', { feedType, page, limit, authenticated: !!user })

    // Get posts from database with optimized query
    const { data: posts, error } = await supabase
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
        account_avatar_url
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      console.log('📊 No posts found')
      return NextResponse.json({ data: [], error: null })
    }

    console.log('📊 Loaded posts from database:', posts.length)

    // Process posts with comprehensive system (using cached display info)
    const extendedPosts = await Promise.all(
      posts.map(async (post: any) => {
        let accountInfo = {
          id: post.user_id,
          username: 'user',
          full_name: 'User',
          avatar_url: null,
          is_verified: false,
          account_type: 'primary'
        }

        // First try: Use cached account display info (fast path)
        if (post.account_display_name) {
          console.log(`✅ Using cached account info for post ${post.id}: ${post.account_display_name}`)
          accountInfo = {
            id: post.posted_as_profile_id || post.user_id,
            username: post.account_username || 'user',
            full_name: post.account_display_name,
            avatar_url: post.account_avatar_url,
            is_verified: false, // We'll add this to cache later if needed
            account_type: post.posted_as_account_type || 'primary'
          }
        }
        // Second try: Use flexible account info function (slow path)
        else if (post.posted_as_profile_id && post.posted_as_account_type) {
          console.log(`🔄 Loading account info for post ${post.id} (${post.posted_as_account_type})`)
          
          const { data: displayInfo, error: displayError } = await supabase
            .rpc('get_account_info_flexible', {
              p_user_id: post.user_id,
              p_account_type: post.posted_as_account_type,
              p_profile_id: post.posted_as_profile_id
            })

          if (displayInfo && displayInfo.length > 0) {
            const account = displayInfo[0]
            accountInfo = {
              id: post.posted_as_profile_id,
              username: account.username || 'user',
              full_name: account.display_name || 'User',
              avatar_url: account.avatar_url,
              is_verified: account.is_verified || false,
              account_type: account.account_type
            }
            
            // TODO: Update cache in background for future requests
            
            console.log(`✅ Loaded account info: ${accountInfo.full_name} (${accountInfo.account_type})`)
          } else {
            console.log(`⚠️  No account info found for post ${post.id}`)
          }
        }
        // Third try: Fallback to primary account
        else {
          console.log(`👤 Using primary account fallback for post ${post.id}`)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, is_verified, metadata')
            .eq('id', post.user_id)
            .single()

          if (profile && !profileError) {
            accountInfo = {
              id: profile.id,
              username: profile.metadata?.username || profile.username || 'user',
              full_name: profile.metadata?.full_name || profile.full_name || 'User',
              avatar_url: profile.avatar_url,
              is_verified: profile.is_verified || false,
              account_type: 'primary'
            }
            console.log(`✅ Using primary profile: ${accountInfo.full_name}`)
          } else {
            console.log(`⚠️  Primary profile not found for post ${post.id}`)
          }
        }

        return {
          ...post,
          profiles: accountInfo,
          user: accountInfo, // Add user field for compatibility
          is_liked: false,
          like_count: post.likes_count || 0,
          // Handle schema differences
          media_urls: post.media_urls || [],
          type: post.type || 'text',
          visibility: post.visibility || 'public',
          hashtags: post.hashtags || [],
          // Include account context for frontend
          account_type: accountInfo.account_type
        }
      })
    )

    console.log('✅ Extended posts with comprehensive system:', extendedPosts.length)
    
    // Log account types and caching status for debugging
    const accountTypes = extendedPosts.map(p => ({
      id: p.id.substring(0, 8),
      name: p.profiles.full_name,
      type: p.profiles.account_type,
      cached: !!p.account_display_name
    }))
    console.log('📋 Posts with account types:', accountTypes)

    return NextResponse.json({ data: extendedPosts, error: null })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
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