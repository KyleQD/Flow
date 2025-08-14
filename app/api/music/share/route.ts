import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { musicId } = await request.json()

    if (!musicId) return NextResponse.json({ error: 'Music ID is required' }, { status: 400 })

    const { data: track, error } = await supabase
      .from('artist_music')
      .select('id,title,cover_art_url,file_url,stats,metadata')
      .eq('id', musicId)
      .single()

    if (error || !track) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const payload = {
      type: 'music',
      id: track.id,
      title: track.title,
      cover: track.cover_art_url,
      preview: track.file_url,
      likes: track.stats?.likes || 0,
      plays: track.stats?.plays || 0,
      buy_url: track.metadata?.commerce?.buy_url || null,
      full_track_url: track.metadata?.full_track_url || null,
    }

    return NextResponse.json({ payload })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


