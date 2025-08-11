import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { user } = auth
    const hasAdmin = await checkAdminPermissions(user)
    if (!hasAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { recipientGroup, message, templateId } = body || {}

    if (!recipientGroup || !message) {
      return NextResponse.json({ success: false, error: 'recipientGroup and message are required' }, { status: 400 })
    }

    // TODO: enqueue broadcast job / insert rows; stubbed for now
    console.log('[Broadcast] group=', recipientGroup, 'template=', templateId)

    return NextResponse.json({ success: true, broadcastId: 'stub-' + Date.now() })
  } catch (error) {
    console.error('[Admin Messages Broadcast API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to broadcast message' }, { status: 500 })
  }
}