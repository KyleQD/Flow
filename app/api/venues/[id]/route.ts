import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// GET - Get venue profile by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const track_view = searchParams.get('track_view') === 'true'
    
    // Get user if authenticated (optional)
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('venue_profiles')
      .select(`
        id,
        user_id,
        venue_name,
        description,
        address,
        city,
        state,
        country,
        postal_code,
        capacity,
        venue_types,
        contact_info,
        social_links,
        settings,
        created_at,
        updated_at
      `)

    // Check if ID is a UUID (venue ID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)
    
    if (isUUID) {
      query = query.eq('id', params.id)
    } else {
      query = query.eq('url_slug', params.id)
    }

    const { data: venue, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
      }
      console.error('Error fetching venue:', error)
      return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 })
    }

    // Check if user owns the venue (for private access)
    // Note: is_public column doesn't exist yet, so allowing all access for now
    // if (!venue.is_public && (!user || user.id !== venue.user_id)) {
    //   return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    // }

    // Track profile view if requested
    if (track_view) {
      const viewerIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      const userAgent = request.headers.get('user-agent')
      const referrer = request.headers.get('referer')

      await supabase
        .rpc('track_venue_profile_view', {
          venue_id: venue.id,
          viewer_id: user?.id || null,
          viewer_ip: viewerIP,
          user_agent: userAgent,
          referrer,
        })
        .then(({ error: trackError }) => {
          if (trackError) {
            console.warn('Failed to track venue view:', trackError)
          }
        })
    }

    // Calculate average rating
    // Note: venue_reviews table doesn't exist yet, so using placeholder data
    const reviews: any[] = []
    const averageRating = 0

    // Get recent events at this venue
    const { data: recentEvents } = await supabase
      .from('events')
      .select('id, title, description, event_date, event_time, ticket_price, status')
      .eq('venue_id', venue.id)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5)

    // Get venue stats
    const { data: viewStats } = await supabase
      .from('venue_profile_views')
      .select('id')
      .eq('venue_id', venue.id)
      .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    const enhancedVenue = {
      ...venue,
      stats: {
        average_rating: parseFloat(averageRating.toFixed(1)),
        total_reviews: reviews.length,
        monthly_views: viewStats?.length || 0,
        upcoming_events: recentEvents?.length || 0,
      },
      recent_events: recentEvents || [],
      reviews: reviews.slice(0, 5), // Limit to 5 most recent reviews
    }

    return NextResponse.json({
      success: true,
      venue: enhancedVenue,
    })
  } catch (error) {
    console.error('Error fetching venue profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update venue profile (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Verify venue ownership
    const { data: venue, error: ownershipError } = await supabase
      .from('venue_profiles')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (ownershipError || !venue) {
      return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 403 })
    }

    // Update venue profile
    const { data: updatedVenue, error: updateError } = await supabase
      .from('venue_profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating venue:', updateError)
      return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('account_activity_log')
      .insert([
        {
          user_id: user.id,
          profile_id: user.id,
          account_type: 'venue',
          action_type: 'update_profile',
          action_details: {
            venue_id: updatedVenue.id,
            updated_fields: Object.keys(body),
          },
        },
      ])

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
      message: 'Venue updated successfully',
    })
  } catch (error) {
    console.error('Error updating venue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete venue profile (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify venue ownership
    const { data: venue, error: ownershipError } = await supabase
      .from('venue_profiles')
      .select('id, user_id, venue_name')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (ownershipError || !venue) {
      return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 403 })
    }

    // Delete venue profile
    const { error: deleteError } = await supabase
      .from('venue_profiles')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting venue:', deleteError)
      return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('account_activity_log')
      .insert([
        {
          user_id: user.id,
          profile_id: user.id,
          account_type: 'venue',
          action_type: 'delete_account',
          action_details: {
            venue_id: venue.id,
            venue_name: venue.venue_name,
          },
        },
      ])

    return NextResponse.json({
      success: true,
      message: 'Venue deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 