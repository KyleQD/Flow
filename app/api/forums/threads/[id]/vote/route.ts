import { withAuth } from '@/lib/auth/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const id = params?.id || request.url.split('/threads/')[1]?.split('/')[0]
    if (!id) return NextResponse.json({ error: 'Missing thread id' }, { status: 400 })

    const payload = await request.json()
    const value = Number(payload?.value)
    if (![1, -1].includes(value)) return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 })

    const { error } = await supabase
      .from('forum_votes')
      .upsert({ user_id: user.id, thread_id: id, value }, { onConflict: 'user_id,thread_id' })
    if (error) return NextResponse.json({ error: 'Failed to vote' }, { status: 400 })

    const { data: thread } = await supabase
      .from('forum_threads')
      .select('id, score, comments_count, created_at')
      .eq('id', id)
      .single()

    return NextResponse.json({ success: true, thread })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const id = params?.id || request.url.split('/threads/')[1]?.split('/')[0]
    if (!id) return NextResponse.json({ error: 'Missing thread id' }, { status: 400 })

    const { error } = await supabase
      .from('forum_votes')
      .delete()
      .eq('user_id', user.id)
      .eq('thread_id', id)
    if (error) return NextResponse.json({ error: 'Failed to remove vote' }, { status: 400 })

    const { data: thread } = await supabase
      .from('forum_threads')
      .select('id, score, comments_count, created_at')
      .eq('id', id)
      .single()

    return NextResponse.json({ success: true, thread })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})


