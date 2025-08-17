import { withAuth } from '@/lib/auth/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const slug = params?.slug || request.url.split('/forums/')[1]?.split('/')[0]
    if (!slug) return NextResponse.json({ error: 'Missing forum slug' }, { status: 400 })

    const { data: forum } = await supabase
      .from('forums')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!forum) return NextResponse.json({ error: 'Forum not found' }, { status: 404 })

    const { error } = await supabase
      .from('forum_subscriptions')
      .upsert({ forum_id: forum.id, user_id: user.id }, { onConflict: 'forum_id,user_id' })

    if (error) return NextResponse.json({ error: 'Failed to subscribe' }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request, { supabase, user }) => {
  try {
    const { params } = (request as any)
    const slug = params?.slug || request.url.split('/forums/')[1]?.split('/')[0]
    if (!slug) return NextResponse.json({ error: 'Missing forum slug' }, { status: 400 })

    const { data: forum } = await supabase
      .from('forums')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!forum) return NextResponse.json({ error: 'Forum not found' }, { status: 404 })

    const { error } = await supabase
      .from('forum_subscriptions')
      .delete()
      .eq('forum_id', forum.id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})


