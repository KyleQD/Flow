import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const { tour_id, event_id, ordinal } = body
    if (!tour_id || !event_id) return NextResponse.json({ error: 'tour_id and event_id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('tour_events')
      .insert({ tour_id, event_id, ordinal: ordinal ?? null })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const url = new URL(req.url)
    const tourId = url.searchParams.get('tour_id')
    const eventId = url.searchParams.get('event_id')
    if (!tourId || !eventId) return NextResponse.json({ error: 'tour_id and event_id required' }, { status: 400 })

    const { error } = await supabase
      .from('tour_events')
      .delete()
      .eq('tour_id', tourId)
      .eq('event_id', eventId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}


