import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { user } = auth
    const hasAdmin = await checkAdminPermissions(user)
    if (!hasAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    // Stubbed data; replace with real query from messages tables
    const threads = [
      { id: 'all-staff', groupName: 'All Staff', lastMessage: 'Reminder: venue check-in at 3 PM', unreadCount: 5 },
      { id: 'tour-managers', groupName: 'Tour Managers', lastMessage: 'Route update posted for Friday', unreadCount: 2 },
      { id: 'vendors', groupName: 'Vendors', lastMessage: 'Invoice batch uploaded', unreadCount: 0 }
    ]

    return NextResponse.json({ success: true, threads })
  } catch (error) {
    console.error('[Admin Messages Threads API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch threads' }, { status: 500 })
  }
}