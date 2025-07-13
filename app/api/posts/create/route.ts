import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for database operations (bypasses RLS)
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

// Helper function to manually parse auth session from cookies (same logic as middleware)
function parseAuthFromCookies(request: NextRequest): any | null {
  try {
    const cookies = request.headers.get('cookie') || ''
    const cookieArray = cookies.split(';').map(c => c.trim())
    
    console.log('[Posts API] All cookies:', cookieArray.map(c => {
      const [name] = c.split('=')
      return `${name}: ${c.split('=')[1]?.length || 0} chars`
    }))
    
    // Look for the auth cookie that matches our client configuration
    const authCookie = cookieArray.find(cookie => 
      cookie.startsWith('sb-tourify-auth-token=')
    )
    
    if (!authCookie) {
      console.log('[Posts API] No auth cookie found')
      return null
    }

    const token = authCookie.split('=')[1]
    if (!token) {
      console.log('[Posts API] Auth cookie found but no token')
      return null
    }

    console.log('[Posts API] Found main auth cookie: sb-tourify-auth-token length:', token.length)

    const sessionData = JSON.parse(decodeURIComponent(token))
    console.log('[Posts API] Successfully parsed session from cookie')
    
    if (sessionData?.user) {
      console.log('[Posts API] User from cookie:', sessionData.user.id)
      return sessionData.user
    }
    
    return null
  } catch (error) {
    console.error('[Posts API] Error parsing auth cookie:', error)
    return null
  }
}

// Helper function to get or create account for posting
async function getOrCreatePostingAccount(
  supabase: any, 
  userId: string, 
  postedAs: string
): Promise<{ accountId: string; accountInfo: any } | null> {
  try {
    console.log('🔍 Getting account for posting:', { userId, postedAs })

    let accountId: string
    let accountInfo: any

    if (postedAs === 'artist') {
      // Get artist profile
      console.log('🎨 Looking up artist profile for user:', userId)
      const { data: artistProfile, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (artistError || !artistProfile) {
        console.error('❌ Artist profile not found:', artistError)
        return null
      }

      console.log('✅ Found artist profile:', artistProfile.artist_name)

      // Get or create account using the unified system
      const { data: upsertResult, error: upsertError } = await supabase
        .rpc('upsert_account', {
          p_owner_user_id: userId,
          p_account_type: 'artist',
          p_profile_table: 'artist_profiles',
          p_profile_id: artistProfile.id
        })

      if (upsertError) {
        console.error('❌ Error upserting artist account:', upsertError)
        return null
      }

      accountId = upsertResult
      console.log('✅ Upserted artist account:', accountId)

      // Get account display info
      const { data: displayInfo } = await supabase
        .rpc('get_account_display_info', { account_id: accountId })

      accountInfo = displayInfo || {
        display_name: artistProfile.stage_name || artistProfile.artist_name,
        username: artistProfile.stage_name?.toLowerCase().replace(/\s+/g, '') || 'artist',
        avatar_url: artistProfile.profile_image_url,
        is_verified: artistProfile.is_verified || false,
        account_type: 'artist'
      }

    } else if (postedAs === 'venue') {
      // Similar logic for venue
      const { data: venueProfile, error: venueError } = await supabase
        .from('venue_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (venueError || !venueProfile) {
        console.error('❌ Venue profile not found:', venueError)
        return null
      }

      const { data: upsertResult, error: upsertError } = await supabase
        .rpc('upsert_account', {
          p_owner_user_id: userId,
          p_account_type: 'venue',
          p_profile_table: 'venue_profiles',
          p_profile_id: venueProfile.id
        })

      if (upsertError) {
        console.error('❌ Error upserting venue account:', upsertError)
        return null
      }

      accountId = upsertResult
      const { data: displayInfo } = await supabase
        .rpc('get_account_display_info', { account_id: accountId })

      accountInfo = displayInfo || {
        display_name: venueProfile.name,
        username: venueProfile.name?.toLowerCase().replace(/\s+/g, '') || 'venue',
        avatar_url: venueProfile.logo_url,
        is_verified: venueProfile.is_verified || false,
        account_type: 'venue'
      }

    } else {
      // Primary account
      console.log('👤 Using primary account for user:', userId)
      
      // Get or create primary profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, full_name: 'User' })
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Error creating primary profile:', createError)
          return null
        }
        profile = newProfile
      } else if (profileError) {
        console.error('❌ Error fetching primary profile:', profileError)
        return null
      }

      const { data: upsertResult, error: upsertError } = await supabase
        .rpc('upsert_account', {
          p_owner_user_id: userId,
          p_account_type: 'primary',
          p_profile_table: 'profiles',
          p_profile_id: profile.id
        })

      if (upsertError) {
        console.error('❌ Error upserting primary account:', upsertError)
        return null
      }

      accountId = upsertResult
      const { data: displayInfo } = await supabase
        .rpc('get_account_display_info', { account_id: accountId })

      accountInfo = displayInfo || {
        display_name: profile.full_name || 'User',
        username: profile.username || 'user',
        avatar_url: profile.avatar_url,
        is_verified: profile.is_verified || false,
        account_type: 'primary'
      }
    }

    console.log('✅ Account ready for posting:', {
      accountId,
      displayName: accountInfo.display_name,
      accountType: accountInfo.account_type
    })

    return { accountId, accountInfo }

  } catch (error) {
    console.error('❌ Error in getOrCreatePostingAccount:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Posts API called - initializing...')
    
    const user = parseAuthFromCookies(request)
    if (!user) {
      console.log('❌ Auth session missing!')
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const userId = user.id
    console.log('✅ Successfully authenticated user:', userId)

    const body = await request.json()
    const { 
      content, 
      type = 'text', 
      visibility = 'public', 
      location, 
      hashtags = [], 
      media_urls = [],
      posted_as = 'primary'
    } = body

    console.log('📨 Request data:', {
      content: content?.substring(0, 50) + '...',
      posted_as,
      userId
    })

    if (!content?.trim()) {
      return NextResponse.json({ 
        error: 'Content is required' 
      }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get or create the account for posting
    const accountResult = await getOrCreatePostingAccount(supabase, userId, posted_as)
    if (!accountResult) {
      return NextResponse.json({ 
        error: `Unable to verify ${posted_as} account for posting` 
      }, { status: 400 })
    }

    const { accountId, accountInfo } = accountResult

    // Create the post with the unified account system
    const postData = {
      user_id: userId,
      account_id: accountId, // Use the unified account ID
      content: content.trim(),
      type: type,
      visibility: visibility,
      media_urls: media_urls || [],
      location: location,
      hashtags: hashtags,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Inserting post with unified account system:', {
      account_id: accountId,
      display_name: accountInfo.display_name,
      account_type: accountInfo.account_type
    })
    
    let { data: post, error: postError } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single()

    if (postError) {
      console.error('❌ Error creating post:', postError)
      
      // Try fallback for older schema without account_id
      if (postError.message.includes('account_id') || postError.message.includes('Column not found')) {
        console.log('⚠️  Falling back to older schema without account_id...')
        
        const fallbackData = {
          user_id: userId,
          content: content.trim(),
          post_type: type === 'text' ? 'general' : type,
          visibility: visibility,
          images: media_urls || [],
          engagement_stats: { likes: 0, comments: 0, shares: 0, views: 0 },
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data: fallbackPost, error: fallbackError } = await supabase
          .from('posts')
          .insert([fallbackData])
          .select()
          .single()

        if (fallbackError) {
          console.error('❌ Fallback post creation failed:', fallbackError)
          return NextResponse.json({ 
            error: 'Failed to create post' 
          }, { status: 500 })
        }

        post = fallbackPost
        console.log('✅ Created post with fallback schema:', post.id)
      } else {
        return NextResponse.json({ 
          error: 'Failed to create post' 
        }, { status: 500 })
      }
    } else {
      console.log('✅ Successfully created post with unified account system:', post.id)
    }

    const responsePost = {
      id: post.id,
      content: post.content,
      type: post.type || post.post_type || 'text',
      visibility: post.visibility || 'public',
      media_urls: post.media_urls || post.images || [],
      location: post.location || null,
      hashtags: post.hashtags || [],
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      is_liked: false,
      // Use account info from unified system
      user: accountInfo,
      profiles: accountInfo,
      account_id: accountId,
      account_type: accountInfo.account_type
    }

    console.log('🎉 Returning successful post response with account:', accountInfo.display_name)
    return NextResponse.json({ post: responsePost })

  } catch (error) {
    console.error('💥 Posts API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 