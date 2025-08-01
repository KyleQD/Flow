import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Helper function to parse auth from cookies
function parseAuthFromCookies(request: NextRequest) {
  const cookies = request.cookies
  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value
  
  if (!accessToken || !refreshToken) {
    return null
  }
  
  return { accessToken, refreshToken }
}

// GET /api/events/[id]/page - Get event page data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient()
    const resolvedParams = await params
    const eventId = resolvedParams.id

    // Get the event details from artist_events first
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select(`
        id,
        title,
        description,
        type,
        venue_name,
        venue_address,
        venue_city,
        venue_state,
        venue_country,
        event_date,
        start_time,
        end_time,
        doors_open,
        ticket_url,
        ticket_price_min,
        ticket_price_max,
        capacity,
        expected_attendance,
        status,
        is_public,
        poster_url,
        user_id,
        created_at,
        updated_at
      `)
      .eq('id', eventId)
      .single()

    if (eventError) {
      console.error('Error fetching event:', eventError)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get the event creator's profile - prefer artist profile if available
    let profile = null
    
    // First try to get artist profile
    const { data: artistProfile, error: artistError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, is_verified, account_type')
      .eq('id', event.user_id)
      .single()
    
    if (artistProfile) {
      // If user has artist account or is verified, use their profile
      // Otherwise check if they have a linked artist profile
      if (artistProfile.account_type === 'artist' || artistProfile.is_verified) {
        profile = artistProfile
      } else {
        // Check for linked artist accounts
        const { data: linkedArtist, error: linkedError } = await supabase
          .from('accounts')
          .select(`
            id,
            account_type,
            display_name,
            avatar_url,
            is_verified,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url,
              is_verified
            )
          `)
          .eq('user_id', event.user_id)
          .eq('account_type', 'artist')
          .eq('is_active', true)
          .single()
        
        if (linkedArtist && !linkedError) {
          // Use the artist account information  
          profile = {
            id: artistProfile.id,
            username: artistProfile.username,
            full_name: linkedArtist.display_name || artistProfile.full_name,
            avatar_url: linkedArtist.avatar_url || artistProfile.avatar_url,
            is_verified: linkedArtist.is_verified || artistProfile.is_verified
          }
        } else {
          // Fall back to personal profile
          profile = artistProfile
        }
      }
    }

    if (!profile) {
      console.error('Error fetching profile:', artistError)
    }

    // Get event page settings
    const { data: pageSettings, error: settingsError } = await supabase
      .from('event_page_settings')
      .select('*')
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching page settings:', settingsError)
    }

    // Get attendance count
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('event_attendance')
      .select('status, user_id')
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError)
    }

    // Get event collaborators
    const { data: collaborators, error: collaboratorsError } = await supabase
      .from('event_collaborators')
      .select(`
        id,
        user_id,
        role,
        permissions,
        status
      `)
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .eq('status', 'accepted')

    if (collaboratorsError) {
      console.error('Error fetching collaborators:', collaboratorsError)
    }

    // Process attendance data
    const attendees = attendanceData?.filter(a => a.status === 'attending') || []
    const interested = attendanceData?.filter(a => a.status === 'interested') || []
    const notGoing = attendanceData?.filter(a => a.status === 'not_going') || []

    // Check if current user is authenticated and get their attendance status
    const auth = parseAuthFromCookies(request)
    let userAttendance = null

    if (auth) {
      const { data: userData } = await supabase.auth.getUser(auth.accessToken)
      if (userData.user) {
        const userAttendanceRecord = attendanceData?.find(a => a.user_id === userData.user.id)
        userAttendance = userAttendanceRecord ? userAttendanceRecord.status : null
      }
    }

    // Build response
    const eventPageData = {
      event: {
        ...event,
        creator: profile
      },
      settings: pageSettings || {
        is_page_enabled: true,
        allow_public_posts: false,
        allow_attendee_posts: true,
        require_approval_for_posts: false,
        show_attendance_count: true,
        show_attendee_list: true,
        allow_comments: true,
        page_theme: { primary_color: '#8B5CF6', cover_image: null },
        custom_fields: {},
        seo_settings: { title: null, description: null, keywords: [] }
      },
      attendance: {
        attending: attendees.length,
        interested: interested.length,
        not_going: notGoing.length,
        user_status: userAttendance,
        attendees: pageSettings?.show_attendee_list ? attendees : [],
        interested_users: pageSettings?.show_attendee_list ? interested : []
      },
      collaborators: collaborators || [],
      page_url: `/events/${eventId}`,
      share_url: `${request.nextUrl.origin}/events/${eventId}`
    }

    return NextResponse.json(eventPageData)
  } catch (error) {
    console.error('Error in event page API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/events/[id]/page - Update event page settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient()
    const eventId = params.id
    const auth = parseAuthFromCookies(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase.auth.getUser(auth.accessToken)
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can manage this event
    const { data: canManage } = await supabase
      .rpc('can_manage_event', {
        user_id: user.user.id,
        event_id: eventId,
        event_table: 'artist_events'
      })

    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      is_page_enabled,
      allow_public_posts,
      allow_attendee_posts,
      require_approval_for_posts,
      show_attendance_count,
      show_attendee_list,
      allow_comments,
      page_theme,
      custom_fields,
      seo_settings
    } = body

    // Upsert page settings
    const { data: updatedSettings, error } = await supabase
      .from('event_page_settings')
      .upsert({
        event_id: eventId,
        event_table: 'artist_events',
        is_page_enabled,
        allow_public_posts,
        allow_attendee_posts,
        require_approval_for_posts,
        show_attendance_count,
        show_attendee_list,
        allow_comments,
        page_theme,
        custom_fields,
        seo_settings
      }, {
        onConflict: 'event_id,event_table'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating page settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error in event page update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 