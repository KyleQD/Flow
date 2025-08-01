import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Helper function to parse auth from cookies
function parseAuthFromCookies(request: NextRequest) {
  const cookies = request.cookies
  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value
  
  if (!accessToken || !refreshToken) {
    return null
  }
  
  return { accessToken, refreshToken }
}

// GET /api/events/[id]/posts - Get event posts feed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient()
    const resolvedParams = await params
    const eventId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'announcement', 'update', etc.

    // Check if user is authenticated
    const auth = parseAuthFromCookies(request)
    let currentUser = null

    if (auth) {
      const { data: userData } = await supabase.auth.getUser(auth.accessToken)
      if (userData.user) {
        currentUser = userData.user
      }
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id, is_public')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user can view event posts
    let canView = event.is_public
    
    if (currentUser && !canView) {
      // Check if user is attending the event
      const { data: attendance } = await supabase
        .from('event_attendance')
        .select('status')
        .eq('event_id', eventId)
        .eq('event_table', 'artist_events')
        .eq('user_id', currentUser.id)
        .single()

      if (attendance?.status === 'attending') {
        canView = true
      }

      // Check if user is a collaborator
      const { data: collaborator } = await supabase
        .from('event_collaborators')
        .select('status')
        .eq('event_id', eventId)
        .eq('event_table', 'artist_events')
        .eq('user_id', currentUser.id)
        .eq('status', 'accepted')
        .single()

      if (collaborator) {
        canView = true
      }

      // Check if user is the event creator
      if (currentUser.id === event.user_id) {
        canView = true
      }
    }

    if (!canView) {
      return NextResponse.json({ error: 'Unauthorized to view event posts' }, { status: 403 })
    }

    // Build query for posts
    let query = supabase
      .from('event_posts')
      .select(`
        id,
        event_id,
        user_id,
        content,
        type,
        media_urls,
        is_announcement,
        is_pinned,
        visibility,
        likes_count,
        comments_count,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')

    // Filter by type if specified
    if (type) {
      query = query.eq('type', type)
    }

    // Apply visibility filters based on user's relationship to the event
    if (currentUser) {
      if (currentUser.id === event.user_id) {
        // Event creator can see all posts
        query = query.in('visibility', ['public', 'attendees', 'collaborators'])
      } else {
        // Check user's permissions
        const { data: attendance } = await supabase
          .from('event_attendance')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', currentUser.id)
          .single()

        const { data: collaborator } = await supabase
          .from('event_collaborators')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', currentUser.id)
          .eq('status', 'accepted')
          .single()

        if (collaborator) {
          query = query.in('visibility', ['public', 'attendees', 'collaborators'])
        } else if (attendance?.status === 'attending') {
          query = query.in('visibility', ['public', 'attendees'])
        } else {
          query = query.eq('visibility', 'public')
        }
      }
    } else {
      query = query.eq('visibility', 'public')
    }

    // Order by pinned first, then by creation date
    query = query.order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    const { data: posts, error: postsError } = await query

    if (postsError) {
      console.error('Error fetching event posts:', postsError)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // Get like status for current user
    let postsWithLikeStatus = posts
    if (currentUser) {
      const postIds = posts?.map(p => p.id) || []
      const { data: userLikes } = await supabase
        .from('event_post_likes')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', currentUser.id)

      const likedPostIds = new Set(userLikes?.map(l => l.post_id) || [])
      
      postsWithLikeStatus = posts?.map(post => ({
        ...post,
        is_liked: likedPostIds.has(post.id)
      })) || []
    }

    return NextResponse.json({
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        has_more: posts?.length === limit
      },
      event: {
        id: event.id,
        title: event.title,
        creator_id: event.user_id
      }
    })
  } catch (error) {
    console.error('Error in event posts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/events/[id]/posts - Create new event post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceRoleClient()
    const resolvedParams = await params
    const eventId = resolvedParams.id
    const auth = parseAuthFromCookies(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase.auth.getUser(auth.accessToken)
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      content, 
      type = 'text', 
      media_urls = [], 
      is_announcement = false, 
      is_pinned = false, 
      visibility = 'attendees' 
    } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user can post to this event
    let canPost = false
    
    // Event creator can always post
    if (user.user.id === event.user_id) {
      canPost = true
    } else {
      // Check if user is a collaborator with posting permissions
      const { data: collaborator } = await supabase
        .from('event_collaborators')
        .select('permissions')
        .eq('event_id', eventId)
        .eq('event_table', 'artist_events')
        .eq('user_id', user.user.id)
        .eq('status', 'accepted')
        .single()

      if (collaborator?.permissions?.can_post_updates) {
        canPost = true
      } else {
        // Check if user is attending and event allows attendee posts
        const { data: attendance } = await supabase
          .from('event_attendance')
          .select('status')
          .eq('event_id', eventId)
          .eq('event_table', 'artist_events')
          .eq('user_id', user.user.id)
          .single()

        if (attendance?.status === 'attending') {
          const { data: pageSettings } = await supabase
            .from('event_page_settings')
            .select('allow_attendee_posts')
            .eq('event_id', eventId)
            .eq('event_table', 'artist_events')
            .single()

          if (pageSettings?.allow_attendee_posts) {
            canPost = true
          }
        }
      }
    }

    if (!canPost) {
      return NextResponse.json({ error: 'You do not have permission to post to this event' }, { status: 403 })
    }

    // Only event creator and admin collaborators can create announcements or pinned posts
    if ((is_announcement || is_pinned) && user.user.id !== event.user_id) {
      const { data: collaborator } = await supabase
        .from('event_collaborators')
        .select('role')
        .eq('event_id', eventId)
        .eq('user_id', user.user.id)
        .eq('status', 'accepted')
        .single()

      if (collaborator?.role !== 'admin') {
        return NextResponse.json({ error: 'Only event creators and admin collaborators can create announcements or pinned posts' }, { status: 403 })
      }
    }

    // Create the post
    const { data: post, error: postError } = await supabase
      .from('event_posts')
      .insert({
        event_id: eventId,
        event_table: 'artist_events',
        user_id: user.user.id,
        content: content.trim(),
        type,
        media_urls,
        is_announcement,
        is_pinned,
        visibility
      })
      .select(`
        id,
        event_id,
        user_id,
        content,
        type,
        media_urls,
        is_announcement,
        is_pinned,
        visibility,
        likes_count,
        comments_count,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .single()

    if (postError) {
      console.error('Error creating event post:', postError)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    // Add is_liked flag for the creator
    const postWithLikeStatus = {
      ...post,
      is_liked: false
    }

    return NextResponse.json({
      post: postWithLikeStatus,
      message: 'Post created successfully'
    })
  } catch (error) {
    console.error('Error in event post creation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 