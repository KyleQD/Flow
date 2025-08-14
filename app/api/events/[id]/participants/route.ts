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
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ participants: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load participants' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest, { supabase, user }) => {
  try {
    const { pathname } = new URL(request.url)
    const parts = pathname.split('/')
    const idIndex = parts.findIndex(p => p === 'events') + 1
    const eventId = parts[idIndex]

    const { participantType, participantId, role } = await request.json()
    if (!participantType || !participantId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Permission: ASSIGN_EVENT_ROLES on this event
    const { data: canAssign, error: rpcError } = await supabase.rpc('has_entity_permission', {
      p_user_id: user.id,
      p_entity_type: 'Event',
      p_entity_id: eventId,
      p_permission_name: 'ASSIGN_EVENT_ROLES'
    })
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 400 })
    if (!canAssign) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const { data, error } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, participant_type: participantType, participant_id: participantId, role: role ?? null })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ participant: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to add participant' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { supabase, user }) => {
  try {
    const { pathname, searchParams } = new URL(request.url)
    const parts = pathname.split('/')
    const idIndex = parts.findIndex(p => p === 'events') + 1
    const eventId = parts[idIndex]
    const participantType = searchParams.get('participantType')
    const participantId = searchParams.get('participantId')

    if (!participantType || !participantId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    // Permission: ASSIGN_EVENT_ROLES on this event
    const { data: canAssign, error: rpcError } = await supabase.rpc('has_entity_permission', {
      p_user_id: user.id,
      p_entity_type: 'Event',
      p_entity_id: eventId,
      p_permission_name: 'ASSIGN_EVENT_ROLES'
    })
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 400 })
    if (!canAssign) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .match({ event_id: eventId, participant_type: participantType, participant_id: participantId })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to remove participant' }, { status: 500 })
  }
})


