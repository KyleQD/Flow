import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  try {
    const { pathname } = new URL(request.url)
    const parts = pathname.split('/')
    const idIndex = parts.findIndex(p => p === 'events') + 1
    const eventId = parts[idIndex]

    const { data, error } = await supabase
      .from('event_locations')
      .select('*, locations(*)')
      .eq('event_id', eventId)
      .order('is_primary', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ locations: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load locations' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest, { supabase, user }) => {
  try {
    const { pathname } = new URL(request.url)
    const parts = pathname.split('/')
    const idIndex = parts.findIndex(p => p === 'events') + 1
    const eventId = parts[idIndex]

    const { locationId, locationType, isPrimary } = await request.json()
    if (!locationId || !locationType) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Permission: EDIT_EVENT_LOGISTICS on this event
    const { data: canEdit, error: rpcError } = await supabase.rpc('has_entity_permission', {
      p_user_id: user.id,
      p_entity_type: 'Event',
      p_entity_id: eventId,
      p_permission_name: 'EDIT_EVENT_LOGISTICS'
    })
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 400 })
    if (!canEdit) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    if (isPrimary) {
      await supabase
        .from('event_locations')
        .update({ is_primary: false })
        .eq('event_id', eventId)
    }

    const { data, error } = await supabase
      .from('event_locations')
      .insert({ event_id: eventId, location_id: locationId, location_type: locationType, is_primary: Boolean(isPrimary) })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ location: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to add location' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { supabase, user }) => {
  try {
    const { pathname, searchParams } = new URL(request.url)
    const parts = pathname.split('/')
    const idIndex = parts.findIndex(p => p === 'events') + 1
    const eventId = parts[idIndex]
    const locationId = searchParams.get('locationId')

    if (!locationId) return NextResponse.json({ error: 'Missing locationId' }, { status: 400 })

    // Permission: EDIT_EVENT_LOGISTICS on this event
    const { data: canEdit, error: rpcError } = await supabase.rpc('has_entity_permission', {
      p_user_id: user.id,
      p_entity_type: 'Event',
      p_entity_id: eventId,
      p_permission_name: 'EDIT_EVENT_LOGISTICS'
    })
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 400 })
    if (!canEdit) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const { error } = await supabase
      .from('event_locations')
      .delete()
      .match({ event_id: eventId, location_id: locationId })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to remove location' }, { status: 500 })
  }
})


