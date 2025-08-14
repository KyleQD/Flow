import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'

interface QueryParams {
  eventId?: string | null
  tourId?: string | null
  type?: string | null
}

function parseQuery(request: NextRequest): QueryParams {
  const { searchParams } = new URL(request.url)
  return {
    eventId: searchParams.get('eventId'),
    tourId: searchParams.get('tourId'),
    type: searchParams.get('type')
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { eventId, tourId, type } = parseQuery(request)

    let query = supabase.from('logistics_tasks').select('*').order('updated_at', { ascending: false })

    if (eventId) query = query.eq('event_id', eventId)
    if (tourId) query = query.eq('tour_id', tourId)
    if (type && type !== 'all') query = query.eq('type', type)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('[Logistics Items] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch logistics items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    // Map UI payload to DB columns
    let resolvedAssignee: string | null = null
    if (body.assignedTo) {
      const candidate: string = body.assignedTo
      const uuidRegex = /^[0-9a-fA-F-]{36}$/
      if (uuidRegex.test(candidate)) resolvedAssignee = candidate
      else if (candidate.includes('@')) {
        // try to resolve by email
        const { data: user } = await supabase
          .from('profiles')
          .select('id, email')
          .ilike('email', candidate)
          .single()
        if (user) resolvedAssignee = user.id as any
      }
    }

    const payload = {
      event_id: body.eventId || null,
      tour_id: body.tourId || null,
      type: body.type,
      title: body.title,
      description: body.description || null,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      assigned_to_user_id: resolvedAssignee,
      due_date: body.dueDate || null,
      budget: body.budget ?? null,
      actual_cost: body.actualCost ?? null,
      notes: body.notes || null,
      tags: body.tags || null,
      created_by: body.createdBy || null
    }

    const { data, error } = await supabase
      .from('logistics_tasks')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ item: data }, { status: 201 })
  } catch (error) {
    console.error('[Logistics Items] POST error:', error)
    return NextResponse.json({ error: 'Failed to create logistics item' }, { status: 500 })
  }
}


