import { NextRequest, NextResponse } from 'next/server'

async function resolveEventId(param: string, supabase: any) {
  if (/^[0-9a-fA-F-]{36}$/.test(param)) return param
  const { data } = await supabase.from('events').select('id').eq('slug', param).single()
  return data?.id || null
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const eventId = await resolveEventId(params.id, supabase)
    if (!eventId) return NextResponse.json({ guests: [] })

    const { data, error } = await supabase
      .from('event_guestlist')
      .select('id, user_id, full_name, contact_email, contact_phone, guests_count, status, invite_code, notes, checked_in_at, created_at, updated_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ guests: [] })
    return NextResponse.json({ guests: data || [] })
  } catch (error) {
    console.error('[Event Guestlist API] GET error:', error)
    return NextResponse.json({ guests: [] })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authenticateApiRequest } = await import('@/lib/auth/api-auth')
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase, user } = auth

    const body = await request.json()
    const eventId = await resolveEventId(params.id, supabase)
    if (!eventId) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const insert = {
      event_id: eventId,
      user_id: body.user_id || null,
      full_name: body.full_name || null,
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      guests_count: body.guests_count || 1,
      status: body.status || 'invited',
      invited_by: user.id,
      invite_code: body.invite_code || null,
      notes: body.notes || null
    }

    const { data, error } = await supabase.from('event_guestlist').insert([insert]).select().single()
    if (error) return NextResponse.json({ error: 'Failed to add guest' }, { status: 500 })
    return NextResponse.json({ guest: data })
  } catch (error) {
    console.error('[Event Guestlist API] POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authenticateApiRequest } = await import('@/lib/auth/api-auth')
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase } = auth
    const body = await request.json()

    const eventId = await resolveEventId(params.id, supabase)
    if (!eventId) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!body?.id) return NextResponse.json({ error: 'Guest id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('event_guestlist')
      .update({
        status: body.status,
        full_name: body.full_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        guests_count: body.guests_count,
        notes: body.notes,
        checked_in_at: body.checked_in_at || null
      })
      .eq('id', body.id)
      .eq('event_id', eventId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
    return NextResponse.json({ guest: data })
  } catch (error) {
    console.error('[Event Guestlist API] PATCH error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


