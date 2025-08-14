import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { hasEntityPermission } from '@/lib/services/rbac'

const addSchema = z.object({
  participant_type: z.string().min(1),
  participant_id: z.string().uuid(),
  role: z.string().optional(),
})

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const canRead = await hasEntityPermission({ userId: user.id, entityType: 'Event', entityId: id, permission: 'EDIT_EVENT_LOGISTICS' })
    if (!canRead) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ participants: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const input = addSchema.parse(await req.json())
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const allowed = await hasEntityPermission({ userId: user.id, entityType: 'Event', entityId: id, permission: 'ASSIGN_EVENT_ROLES' })
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('event_participants')
      .insert({
        event_id: id,
        participant_type: input.participant_type,
        participant_id: input.participant_id,
        role: input.role ?? null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const url = new URL(req.url)
    const participantType = url.searchParams.get('participant_type')
    const participantId = url.searchParams.get('participant_id')
    if (!participantType || !participantId) return NextResponse.json({ error: 'participant_type and participant_id required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const allowed = await hasEntityPermission({ userId: user.id, entityType: 'Event', entityId: id, permission: 'ASSIGN_EVENT_ROLES' })
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', id)
      .eq('participant_type', participantType)
      .eq('participant_id', participantId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}


