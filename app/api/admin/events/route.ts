import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Real data: fetch events from Supabase `events_v2` with light normalization for selectors
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ events: [] }, { status: 401 })

    // Select a small subset for the selector UI
    const { data, error } = await supabase
      .from('events_v2')
      .select('id, title, status, start_at, venue_id, created_at')
      .order('start_at', { ascending: true })
      .limit(50)

    if (error) {
      // If table missing during early setup, return empty list gracefully
      if ((error as any)?.code === '42P01') return NextResponse.json({ events: [] })
      return NextResponse.json({ error: error.message, events: [] }, { status: 400 })
    }

    const events = (data || []).map(e => ({
      id: e.id,
      name: e.title,
      status: e.status,
      event_date: e.start_at,
      venue_id: e.venue_id,
      created_at: e.created_at
    }))

    return NextResponse.json({ events })
  } catch (e: any) {
    return NextResponse.json({ events: [], error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}