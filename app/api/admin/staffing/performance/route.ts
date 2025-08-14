import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { hasEntityPermission } from '@/lib/services/rbac'

const createSchema = z.object({
  staff_member_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  metric_date: z.string(),
  attendance_rate: z.number().min(0).max(100).optional(),
  performance_rating: z.number().min(0).max(5).optional(),
  incidents_count: z.number().int().min(0).optional(),
  commendations_count: z.number().int().min(0).optional(),
  training_completed: z.boolean().optional(),
  certifications_valid: z.boolean().optional(),
  customer_feedback_score: z.number().min(0).max(5).optional(),
  supervisor_rating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const input = createSchema.parse(await req.json())
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const allowed = await hasEntityPermission({ userId: user.id, entityType: 'Venue', entityId: input.venue_id, permission: 'MANAGE_MEMBERS' })
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('staff_performance_metrics')
      .insert({ ...input, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const venueId = url.searchParams.get('venueId')
    if (!venueId) return NextResponse.json({ error: 'venueId required' }, { status: 400 })
    const eventId = url.searchParams.get('eventId') || undefined
    const staffMemberId = url.searchParams.get('staff_member_id') || undefined
    const dateFrom = url.searchParams.get('date_from') || undefined
    const dateTo = url.searchParams.get('date_to') || undefined

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const canRead = await hasEntityPermission({ userId: user.id, entityType: 'Venue', entityId: venueId, permission: 'EDIT_EVENT_LOGISTICS' })
    if (!canRead) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let query = supabase
      .from('staff_performance_metrics')
      .select('*')
      .eq('venue_id', venueId)

    if (eventId) query = query.eq('event_id', eventId)
    if (staffMemberId) query = query.eq('staff_member_id', staffMemberId)
    if (dateFrom) query = query.gte('metric_date', dateFrom)
    if (dateTo) query = query.lte('metric_date', dateTo)

    const { data, error } = await query.order('metric_date', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}


