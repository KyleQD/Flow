import { withAuth } from '@/lib/auth/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const id = params?.id || request.url.split('/comments/')[1]?.split('/')[0]
    if (!id) return NextResponse.json({ error: 'Missing comment id' }, { status: 400 })

    const payload = await request.json()
    const value = Number(payload?.value)
    if (![1, -1].includes(value)) return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 })

    const { error } = await supabase
      .from('forum_votes')
      .upsert({ user_id: user.id, comment_id: id, value }, { onConflict: 'user_id,comment_id' })
    if (error) return NextResponse.json({ error: 'Failed to vote' }, { status: 400 })

    const { data: comment } = await supabase
      .from('forum_comments')
      .select('id, score')
      .eq('id', id)
      .single()

    return NextResponse.json({ success: true, comment })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const id = params?.id || request.url.split('/comments/')[1]?.split('/')[0]
    if (!id) return NextResponse.json({ error: 'Missing comment id' }, { status: 400 })

    const { error } = await supabase
      .from('forum_votes')
      .delete()
      .eq('user_id', user.id)
      .eq('comment_id', id)
    if (error) return NextResponse.json({ error: 'Failed to remove vote' }, { status: 400 })

    const { data: comment } = await supabase
      .from('forum_comments')
      .select('id, score')
      .eq('id', id)
      .single()

    return NextResponse.json({ success: true, comment })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})


