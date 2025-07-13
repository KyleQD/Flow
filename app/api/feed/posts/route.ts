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
    
    console.log('📊 Feed API called:', { feedType, page, limit, authenticated: !!user })

    // Get posts from database
    let query = supabase
      .from('posts')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      console.log('📊 No posts found')
      return NextResponse.json({ data: [], error: null })
    }

    console.log('📊 Loaded posts from database:', posts.length)

    // Load account information using the unified system
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

        // Try to get account info from unified accounts table
        if (post.account_id) {
          console.log(`🔍 Looking up account info for post ${post.id} using account_id: ${post.account_id}`)
          
          const { data: displayInfo } = await supabase
            .rpc('get_account_display_info', { account_id: post.account_id })

          if (displayInfo) {
            accountInfo = {
              id: displayInfo.id,
              username: displayInfo.username || 'user',
              full_name: displayInfo.display_name || 'User',
              avatar_url: displayInfo.avatar_url,
              is_verified: displayInfo.is_verified || false,
              account_type: displayInfo.account_type || 'primary'
            }
            console.log(`✅ Found account info: ${accountInfo.full_name} (${accountInfo.account_type})`)
          } else {
            console.log(`⚠️  No account info found for account_id: ${post.account_id}`)
          }
        } else {
          console.log(`📝 Post ${post.id} has no account_id, trying fallback lookup`)
          
          // Fallback: try to get account info from legacy fields or user profiles
          if (post.posted_as_account_type === 'artist' && post.posted_as_profile_id) {
            console.log('🎨 Trying legacy artist profile lookup')
            const { data: artistProfile } = await supabase
              .from('artist_profiles')
              .select('id, stage_name, artist_name, profile_image_url, is_verified')
              .eq('id', post.posted_as_profile_id)
              .single()

            if (artistProfile) {
              accountInfo = {
                id: artistProfile.id,
                username: artistProfile.stage_name?.toLowerCase().replace(/\s+/g, '') || 'artist',
                full_name: artistProfile.stage_name || artistProfile.artist_name || 'Artist',
                avatar_url: artistProfile.profile_image_url,
                is_verified: artistProfile.is_verified || false,
                account_type: 'artist'
              }
              console.log('🎨 Using legacy artist profile:', accountInfo.full_name)
            }
          } else {
            // Primary account fallback
            console.log('👤 Trying primary account profile lookup')
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, is_verified, metadata')
              .eq('id', post.user_id)
              .single()

            if (profile) {
              accountInfo = {
                id: profile.id,
                username: profile.metadata?.username || profile.username || 'user',
                full_name: profile.metadata?.full_name || profile.full_name || 'User',
                avatar_url: profile.avatar_url,
                is_verified: profile.is_verified || false,
                account_type: 'primary'
              }
              console.log('👤 Using primary profile:', accountInfo.full_name)
            }
          }
        }

        return {
          ...post,
          profiles: accountInfo,
          user: accountInfo, // Add user field for compatibility
          is_liked: false,
          like_count: post.likes_count || 0,
          // Handle schema differences
          media_urls: post.media_urls || post.images || [],
          type: post.type || post.post_type || 'text',
          // Include account context for frontend
          account_id: post.account_id,
          account_type: accountInfo.account_type
        }
      })
    )

    console.log('✅ Extended posts with account data:', extendedPosts.length)
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
        full_name: profile?.metadata?.full_name || 'User',
        avatar_url: profile?.avatar_url,
        is_verified: profile?.is_verified || false
      },
      is_liked: false,
      like_count: 0
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