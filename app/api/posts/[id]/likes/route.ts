import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { parseAuthFromCookies } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const postId = resolvedParams.id
    const supabase = createServiceRoleClient()
    const user = parseAuthFromCookies(request)

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    console.log('👍 Checking like status for post:', postId)

    // Get total likes count
    const { count: totalLikes } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    // Check if current user has liked the post
    let isLiked = false
    if (user) {
      const { data: userLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      isLiked = !!userLike
    }

    console.log('👍 Like status:', { totalLikes, isLiked, userId: user?.id })

    return NextResponse.json({
      likes_count: totalLikes || 0,
      is_liked: isLiked
    })

  } catch (error) {
    console.error('Error fetching like status:', error)
    return NextResponse.json({ error: 'Failed to fetch like status' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const postId = resolvedParams.id
    const supabase = createServiceRoleClient()
    const user = parseAuthFromCookies(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const { action } = await request.json()
    console.log('👍 Processing like action:', { action, postId, userId: user.id })

    // Check if user has already liked the post
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (action === 'like') {
      if (existingLike) {
        return NextResponse.json({ error: 'Post already liked' }, { status: 400 })
      }

      // Add like
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
          created_at: new Date().toISOString()
        })

      if (likeError) {
        console.error('Error adding like:', likeError)
        return NextResponse.json({ error: 'Failed to like post' }, { status: 500 })
      }

      // Update post likes count
      const { error: updateError } = await supabase
        .from('posts')
        .update({ likes_count: supabase.sql`likes_count + 1` })
        .eq('id', postId)

      if (updateError) {
        console.error('Error updating likes count:', updateError)
        // Don't fail the request, just log the error
      }

      console.log('✅ Successfully liked post')
      return NextResponse.json({ success: true, action: 'liked' })

    } else if (action === 'unlike') {
      if (!existingLike) {
        return NextResponse.json({ error: 'Post not liked' }, { status: 400 })
      }

      // Remove like
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (unlikeError) {
        console.error('Error removing like:', unlikeError)
        return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 })
      }

      // Update post likes count
      const { error: updateError } = await supabase
        .from('posts')
        .update({ likes_count: supabase.sql`GREATEST(likes_count - 1, 0)` })
        .eq('id', postId)

      if (updateError) {
        console.error('Error updating likes count:', updateError)
        // Don't fail the request, just log the error
      }

      console.log('✅ Successfully unliked post')
      return NextResponse.json({ success: true, action: 'unliked' })

    } else {
      return NextResponse.json({ error: 'Invalid action. Use "like" or "unlike"' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error processing like action:', error)
    return NextResponse.json({ error: 'Failed to process like action' }, { status: 500 })
  }
} 