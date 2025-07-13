import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const action = searchParams.get('action')
    const postId = searchParams.get('postId')
    const userId = searchParams.get('userId')

    // Handle checkLike action
    if (action === 'checkLike' && postId && userId) {
      const { data, error } = await supabase
        .from('demo_likes')
        .select('id')
        .eq('profile_id', userId)
        .eq('post_id', postId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking like status:', error)
        return NextResponse.json({ isLiked: false })
      }

      return NextResponse.json({ isLiked: !!data })
    }

    // Handle regular posts fetch
    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    const { data: posts, error } = await supabase
      .from('demo_posts')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, postId, userId, content } = body

    if (action === 'like') {
      // Add like
      const { error } = await supabase
        .from('demo_likes')
        .insert({
          profile_id: userId,
          post_id: postId
        })

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'unlike') {
      // Remove like
      const { error } = await supabase
        .from('demo_likes')
        .delete()
        .eq('profile_id', userId)
        .eq('post_id', postId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'comment') {
      // Add comment
      const { data, error } = await supabase
        .from('demo_comments')
        .insert({
          post_id: postId,
          profile_id: userId,
          content: content
        })
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, comment: data[0] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 