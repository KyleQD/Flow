import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Feed For You API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // Get content type filter
    
    // Use the authenticated supabase client if available, otherwise create a service client
    let supabase
    if (authResult) {
      supabase = authResult.supabase
      console.log('[Feed For You API] Using authenticated client')
    } else {
      // For public feed viewing, we can use a service client
      const { createClient } = await import('@/lib/supabase/server')
      supabase = await createClient()
      console.log('[Feed For You API] Using service client for public access')
    }

    console.log('[Feed For You API] Fetching personalized content, type:', type, 'limit:', limit)

    // If forums are requested, return ONLY forum content
    if (type === 'forum') {
      console.log('[Feed For You API] Fetching ONLY forum threads')
      
      // Get all threads from all forums for discovery
      let forumThreads: any[] = []
      let userVotesByThread: Record<string, number> = {}
      
      try {
        const { data: allThreads, error: threadsError } = await supabase
          .from('forum_threads_v2')
          .select(`
            id,
            title,
            content_md,
            link_url,
            kind,
            score,
            comments_count,
            created_at,
            forum:forum_id(id, slug, title),
            author:created_by(id, username, avatar_url, is_verified)
          `)
          .order('hot_score', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit * 2) // Get more for variety

        if (threadsError) {
          console.error('[Feed For You API] Error fetching forum threads:', threadsError)
          forumThreads = []
        } else {
          forumThreads = allThreads || []
        }
      } catch (error) {
        console.error('[Feed For You API] Exception fetching forum threads:', error)
        forumThreads = []
      }

      // Hydrate user's existing votes if authenticated
      if (authResult?.user?.id && forumThreads.length) {
        const threadIds = forumThreads.map(t => t.id)
        const { data: userVotes } = await supabase
          .from('forum_votes_v2')
          .select('target_id, kind')
          .eq('user_id', authResult.user.id)
          .eq('target_kind', 'thread')
          .in('target_id', threadIds)
        for (const v of userVotes || []) {
          userVotesByThread[v.target_id] = v.kind === 'up' ? 1 : -1
        }
      }

      const threadContent = forumThreads.map(t => ({
        id: `thread_${t.id}`,
        type: 'forum',
        title: t.title,
        description: t.content_md || t.link_url || undefined,
        author: t.author ? {
          id: t.author.id,
          name: t.author.username,
          username: t.author.username,
          avatar_url: t.author.avatar_url,
          is_verified: t.author.is_verified
        } : undefined,
        cover_image: undefined,
        created_at: t.created_at,
        engagement: {
          likes: t.score || 0,
          views: 0,
          shares: 0,
          comments: t.comments_count || 0
        },
        metadata: {
          url: t.link_url || undefined,
          tags: [t.forum?.title].filter(Boolean),
          forum: t.forum ? { slug: t.forum.slug, name: t.forum.title } : undefined,
          kind: t.kind,
          is_subscribed: false, // We'll check this per user later
          user_vote: userVotesByThread[t.id] || 0
        }
      }))

      return NextResponse.json({ success: true, content: threadContent })
    }

    // For non-forum content, get social posts
    let posts: any[] = []
    if (type !== 'forum') {
      try {
        const { data: postsData, error: postsError } = await supabase
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
          .order('created_at', { ascending: false })
          .limit(limit)

        if (postsError) {
          console.error('[Feed For You API] Error fetching posts:', postsError)
          // Don't return error, just continue with empty posts
          posts = []
        } else {
          posts = postsData || []
        }
      } catch (error) {
        console.error('[Feed For You API] Exception fetching posts:', error)
        posts = []
      }
    }

    // If authenticated and not filtering for specific type, include followed forum threads in mixed feed
    let followedThreads: any[] = []
    let userVotesByThread: Record<string, number> = {}
    if (authResult?.user?.id && !type) {
      const { data: subs } = await supabase
        .from('forum_subscriptions')
        .select('forum_id')
        .eq('user_id', authResult.user.id)
      const forumIds = (subs || []).map((s: any) => s.forum_id)
      if (forumIds.length) {
        const { data: threads2 } = await supabase
          .from('forum_threads')
          .select(`
            id,
            title,
            body,
            media_urls,
            url,
            score,
            comments_count,
            created_at,
            forum:forum_id(id, slug, name),
            author:author_id(id, username, avatar_url, is_verified)
          `)
          .in('forum_id', forumIds)
          .order('score', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit)
        followedThreads = threads2 || []

        // Hydrate user's existing votes for these threads
        const threadIds = (followedThreads || []).map(t => t.id)
        if (threadIds.length) {
          const { data: userVotes } = await supabase
            .from('forum_votes')
            .select('thread_id, value')
            .eq('user_id', authResult.user.id)
            .in('thread_id', threadIds)
          for (const v of userVotes || []) userVotesByThread[v.thread_id] = v.value
        }
      }
    }

    console.log('[Feed For You API] Found posts:', posts?.length || 0, 'threads:', followedThreads.length)

    // Transform posts to match expected format
    const postContent = (posts || []).map(p => ({
      id: p.id,
      type: 'news',
      title: p.content.length > 80 ? p.content.slice(0, 77) + '…' : p.content,
      description: p.content,
      author: {
        id: p.user_id,
        name: p.profiles?.username || 'user',
        username: p.profiles?.username || 'user',
        avatar_url: p.profiles?.avatar_url || '',
        is_verified: p.profiles?.verified || false
      },
      cover_image: undefined,
      created_at: p.created_at,
      engagement: {
        likes: p.likes_count || 0,
        views: 0,
        shares: 0,
        comments: p.comments_count || 0
      },
      metadata: {
        tags: []
      }
    }))

    const threadContent = (followedThreads || []).map(t => ({
      id: `thread_${t.id}`,
      type: 'forum',
      title: t.title,
      description: t.body || undefined,
      author: t.author ? {
        id: t.author.id,
        name: t.author.username,
        username: t.author.username,
        avatar_url: t.author.avatar_url,
        is_verified: t.author.is_verified
      } : undefined,
      cover_image: undefined,
      created_at: t.created_at,
      engagement: {
        likes: t.score || 0,
        views: 0,
        shares: 0,
        comments: t.comments_count || 0
      },
      metadata: {
        url: t.url || undefined,
        tags: [t.forum?.name].filter(Boolean),
        forum: t.forum ? { slug: t.forum.slug, name: t.forum.name } : undefined,
        is_subscribed: true,
        user_vote: userVotesByThread[t.id] || 0
      }
    }))

    const content = [...threadContent, ...postContent]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('[Feed For You API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 