import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'

const VALID_STATUS = new Set(['pending','confirmed','in_progress','completed','cancelled','needs_attention'])

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { status } = await request.json()
    const id = params.id

    if (!VALID_STATUS.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Fetch current status
    const { data: current, error: fetchErr } = await supabase
      .from('logistics_tasks')
      .select('id, status')
      .eq('id', id)
      .single()
    if (fetchErr || !current) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('logistics_tasks')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error

    // Log activity
    await supabase.from('logistics_activity').insert({
      task_id: id,
      action: 'status_changed',
      prev_status: current.status,
      new_status: status
    })

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('[Logistics Status] POST error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}


