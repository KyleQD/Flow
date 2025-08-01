import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { withAuth, checkAuth } from '@/lib/auth/server'

// GET /api/events/[id]/attendance - Get event attendance data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient()
    const resolvedParams = await params
    const eventId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'attending', 'interested', 'not_going'

    // Get attendance data
    let query = supabase
      .from('event_attendance')
      .select(`
        id,
        user_id,
        status,
        created_at
      `)
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')

    if (status) {
      query = query.eq('status', status)
    }

    const { data: attendanceData, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching attendance:', error)
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }

    // Get event details to check if attendance list should be shown
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get event page settings
    const { data: pageSettings } = await supabase
      .from('event_page_settings')
      .select('show_attendee_list')
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .single()

    // Check if user is authenticated (optional)
    const authResult = await checkAuth()
    let currentUser = null

    if (authResult) {
      currentUser = authResult.user
    }

    // Process attendance data
    const attendees = attendanceData?.filter(a => a.status === 'attending') || []
    const interested = attendanceData?.filter(a => a.status === 'interested') || []
    const notGoing = attendanceData?.filter(a => a.status === 'not_going') || []

    // Get current user's attendance status
    let userAttendance = null
    if (currentUser) {
      const userRecord = attendanceData?.find(a => a.user_id === currentUser.id)
      userAttendance = userRecord ? userRecord.status : null
    }

    // Determine if attendance list should be shown
    const showAttendeeList = pageSettings?.show_attendee_list !== false
    const showAttendanceCount = true // Always show attendance count

    // If attendee list should be shown, fetch profile data
    let attendeesWithProfiles: any[] = []
    let interestedWithProfiles: any[] = []
    let notGoingWithProfiles: any[] = []

    if (showAttendeeList && attendanceData && attendanceData.length > 0) {
      const userIds = attendanceData.map(a => a.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_verified')
        .in('id', userIds)

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      
      attendeesWithProfiles = attendees.map(a => ({
        ...a,
        profile: profileMap.get(a.user_id)
      }))
      
      interestedWithProfiles = interested.map(a => ({
        ...a,
        profile: profileMap.get(a.user_id)
      }))
      
      notGoingWithProfiles = notGoing.map(a => ({
        ...a,
        profile: profileMap.get(a.user_id)
      }))
    }

    const response = {
      event: {
        id: event.id,
        title: event.title,
        creator_id: event.user_id
      },
      attendance: {
        attending: showAttendanceCount ? attendees.length : 0,
        interested: showAttendanceCount ? interested.length : 0,
        not_going: showAttendanceCount ? notGoing.length : 0,
        user_status: userAttendance,
        attendees: showAttendeeList ? attendeesWithProfiles : [],
        interested_users: showAttendeeList ? interestedWithProfiles : [],
        not_going_users: showAttendeeList ? notGoingWithProfiles : []
      },
      settings: {
        show_attendee_list: showAttendeeList,
        show_attendance_count: showAttendanceCount
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in attendance API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/events/[id]/attendance - Update user's attendance status
export const POST = withAuth(async (
  request: Request,
  { user, supabase: authSupabase }
) => {
  try {
    const supabase = createServiceRoleClient()
    const url = new URL(request.url)
    const eventId = url.pathname.split('/')[3] // Extract event ID from path

    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['attending', 'interested', 'not_going']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid attendance status' }, { status: 400 })
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id, status')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Don't allow attendance changes for completed or cancelled events
    if (event.status === 'completed' || event.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot change attendance for completed or cancelled events' }, { status: 400 })
    }

    // Upsert attendance record
    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from('event_attendance')
      .upsert({
        event_id: eventId,
        event_table: 'artist_events',
        user_id: user.id,
        status
      }, {
        onConflict: 'event_id,user_id,event_table'
      })
      .select(`
        id,
        status,
        created_at,
        updated_at
      `)
      .single()

    if (attendanceError) {
      console.error('Error updating attendance:', attendanceError)
      return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
    }

    // Get updated attendance counts
    const { data: attendanceCounts } = await supabase
      .from('event_attendance')
      .select('status')
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')

    const counts = {
      attending: attendanceCounts?.filter(a => a.status === 'attending').length || 0,
      interested: attendanceCounts?.filter(a => a.status === 'interested').length || 0,
      not_going: attendanceCounts?.filter(a => a.status === 'not_going').length || 0
    }

    // Send notification to event creator (if it's not the creator updating their own attendance)
    if (user.id !== event.user_id) {
      // TODO: Implement notification system
      console.log(`User ${user.id} is now ${status} for event ${eventId}`)
    }

    return NextResponse.json({
      attendance: attendanceRecord,
      counts,
      message: `Successfully updated attendance to ${status}`
    })
  } catch (error) {
    console.error('Error in attendance update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE /api/events/[id]/attendance - Remove user's attendance
export const DELETE = withAuth(async (
  request: Request,
  { user, supabase: authSupabase }
) => {
  try {
    const supabase = createServiceRoleClient()
    const url = new URL(request.url)
    const eventId = url.pathname.split('/')[3] // Extract event ID from path

    // Delete attendance record
    const { error } = await supabase
      .from('event_attendance')
      .delete()
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting attendance:', error)
      return NextResponse.json({ error: 'Failed to remove attendance' }, { status: 500 })
    }

    // Get updated attendance counts
    const { data: attendanceCounts } = await supabase
      .from('event_attendance')
      .select('status')
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')

    const counts = {
      attending: attendanceCounts?.filter(a => a.status === 'attending').length || 0,
      interested: attendanceCounts?.filter(a => a.status === 'interested').length || 0,
      not_going: attendanceCounts?.filter(a => a.status === 'not_going').length || 0
    }

    return NextResponse.json({
      counts,
      message: 'Successfully removed attendance'
    })
  } catch (error) {
    console.error('Error in attendance deletion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}) 