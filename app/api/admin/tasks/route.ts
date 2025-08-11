import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { user } = auth
    const hasAdmin = await checkAdminPermissions(user)
    if (!hasAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'week'

    // Stubbed task list; replace with DB query filtered by range
    const now = new Date()
    const tasks = [
      { id: '1', title: 'Review tour contracts', priority: 'high', dueAt: now.toISOString(), assignee: 'Kyle Daley', progress: 75, status: 'in_progress' },
      { id: '2', title: 'Update event marketing materials', priority: 'medium', dueAt: new Date(now.getTime() + 86400000).toISOString(), assignee: 'Marketing Team', progress: 45, status: 'not_started' },
      { id: '3', title: 'Finalize venue bookings', priority: 'urgent', dueAt: now.toISOString(), assignee: 'Logistics Team', progress: 90, status: 'in_progress' }
    ]

    return NextResponse.json({ success: true, range, tasks })
  } catch (error) {
    console.error('[Admin Tasks API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = auth
    const hasAdmin = await checkAdminPermissions(user)
    if (!hasAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { ids, op, value } = body || {}

    if (!Array.isArray(ids) || !ids.length || !op) {
      return NextResponse.json({ success: false, error: 'ids[] and op are required' }, { status: 400 })
    }

    // TODO: apply updates in DB (tasks table). For now, echo operation.
    console.log('[Admin Tasks API] Bulk update', { ids, op, value })

    return NextResponse.json({ success: true, updated: ids.length })
  } catch (error) {
    console.error('[Admin Tasks API] PATCH Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update tasks' }, { status: 500 })
  }
}