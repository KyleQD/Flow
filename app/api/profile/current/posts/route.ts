import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('📝 Fetching posts for user:', userId)

    // Get user's posts with comprehensive data
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified,
          metadata
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return NextResponse.json({ posts: [] })
    }

    // Get like counts and user's like status for each post
    const postsWithEngagement = await Promise.all(
      (posts || []).map(async (post) => {
        // Get total likes for this post
        let likesCount = 0
        let isLiked = false
        
        try {
          const { count } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
          
          likesCount = count || 0

          // Check if current user liked this post
          const { data: userLike } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', userId)
            .single()
          
          isLiked = !!userLike
        } catch (error) {
          console.log('Likes data not available for post:', post.id)
        }

        // Get comments count
        let commentsCount = 0
        try {
          const { count } = await supabase
            .from('post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
          
          commentsCount = count || 0
        } catch (error) {
          console.log('Comments data not available for post:', post.id)
        }

        // Transform post data
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
        
        return {
          id: post.id,
          content: post.content,
          type: post.type || 'text',
          visibility: post.visibility || 'public',
          media_url: post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : null,
          likes_count: likesCount,
          comments_count: commentsCount,
          shares_count: post.shares_count || 0,
          created_at: post.created_at,
          updated_at: post.updated_at,
          is_liked: isLiked,
          user: {
            id: userId,
            username: profile?.metadata?.username || profile?.username || 'user',
            full_name: profile?.metadata?.full_name || profile?.full_name || 'Anonymous User',
            avatar_url: profile?.avatar_url || '',
            is_verified: profile?.is_verified || false
          }
        }
      })
    )

    console.log(`✅ Returning ${postsWithEngagement.length} posts with engagement data`)

    return NextResponse.json({ posts: postsWithEngagement })
  } catch (error) {
    console.error('💥 Posts API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      posts: []
    }, { status: 500 })
  }
} 