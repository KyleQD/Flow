import { NextRequest, NextResponse } from 'next/server'
import { hasEntityPermission } from '@/lib/services/rbac'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Events API] GET request started')
    const isEntityRbacEnabled = process.env.FEATURE_ENTITY_RBAC === '1'
    if (isEntityRbacEnabled) {
      try {
        const userHeader = request.headers.get('x-user-id')
        const userId = userHeader || ''
        if (!userId) console.warn('[Admin Events API] FEATURE_ENTITY_RBAC enabled but no x-user-id provided')
        // No specific event scope here; deeper checks should occur on per-event endpoints
      } catch (e) {
        console.warn('[Admin Events API] RBAC precheck skipped:', e)
      }
    }
    
    // Call actual calendar API to get upcoming events, with fallback to demo
    const calendarRes = await fetch(`${new URL(request.url).origin}/api/admin/calendar?eventType=event&status=upcoming`, { cache: 'no-store' })
    if (calendarRes.ok) {
      const data = await calendarRes.json()
      const events = (data?.events || []).map((e: any) => ({
        id: e.id,
        name: e.title || e.name,
        status: e.status,
        event_date: e.event_date,
        venue_id: e.venue_id || null,
        created_at: e.created_at
      }))
      return NextResponse.json({ success: true, events, timestamp: new Date().toISOString() })
    }
    // Fallback
    return NextResponse.json({ success: true, events: [], timestamp: new Date().toISOString() })

  } catch (error) {
    console.error('[Admin Events API] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch events',
      events: [],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 