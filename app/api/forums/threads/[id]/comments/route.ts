import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, withAuth } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest, context: any) {
  try {
    const auth = await authenticateApiRequest(request)
    let supabase
    if (auth) supabase = auth.supabase
    else {
      const { createClient } = await import('@/lib/supabase/server')
      supabase = await createClient()
    }

    const threadId = context?.params?.id
    if (!threadId) return NextResponse.json({ error: 'Missing thread id' }, { status: 400 })

    const { data: comments, error } = await supabase
      .from('forum_comments')
      .select('id, body, score, parent_comment_id, created_at, author:author_id(id, username, avatar_url, is_verified)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 })

    return NextResponse.json({ comments: comments || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const threadId = params?.id || request.url.split('/threads/')[1]?.split('/')[0]
    if (!threadId) return NextResponse.json({ error: 'Missing thread id' }, { status: 400 })

    const payload = await request.json()
    const body = (payload?.body || '').trim()
    const parent_comment_id = payload?.parent_comment_id || null
    if (!body) return NextResponse.json({ error: 'Comment body required' }, { status: 400 })

    const { data, error } = await supabase
      .from('forum_comments')
      .insert({ thread_id: threadId, author_id: user.id, body, parent_comment_id })
      .select('id, body, score, parent_comment_id, created_at, author:author_id(id, username, avatar_url, is_verified)')
      .single()
    if (error) return NextResponse.json({ error: 'Failed to add comment' }, { status: 400 })

    return NextResponse.json({ comment: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})


