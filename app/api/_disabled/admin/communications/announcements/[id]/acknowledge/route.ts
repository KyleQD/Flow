import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// =============================================================================
// POST /api/admin/communications/announcements/[id]/acknowledge
// Acknowledge an announcement
// =============================================================================

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const announcementId = params.id

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse optional acknowledgment note
    const body = await request.json().catch(() => ({}))
    const acknowledgmentNote = body.note || null

    // Verify announcement exists and user should see it
    const { data: announcement } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .eq('is_published', true)
      .single()

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Check if announcement is expired
    if (announcement.expires_at && new Date(announcement.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Announcement has expired' }, { status: 400 })
    }

    // Create or update acknowledgment
    const { data: acknowledgment, error: ackError } = await supabase
      .from('announcement_acknowledgments')
      .upsert({
        announcement_id: announcementId,
        user_id: user.id,
        acknowledged_at: new Date().toISOString(),
        acknowledgment_note: acknowledgmentNote
      }, {
        onConflict: 'announcement_id,user_id'
      })
      .select()
      .single()

    if (ackError) {
      console.error('Error creating acknowledgment:', ackError)
      return NextResponse.json({ error: 'Failed to acknowledge announcement' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: acknowledgment,
      message: 'Announcement acknowledged successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/admin/communications/announcements/acknowledge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}