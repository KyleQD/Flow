import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  announcement_type: z.enum(['emergency', 'schedule', 'weather', 'logistics', 'technical', 'general', 'celebration']).default('general'),
  priority: z.enum(['emergency', 'urgent', 'important', 'general']).default('important'),
  target_audience: z.array(z.string()).default([]), // roles, departments, or user IDs
  tour_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
  publish_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional()
  })).optional(),
  call_to_action: z.object({
    text: z.string(),
    url: z.string().url().optional(),
    action_type: z.enum(['link', 'acknowledge', 'respond']).default('acknowledge')
  }).optional(),
  acknowledgment_required: z.boolean().default(false)
})

const updateAnnouncementSchema = createAnnouncementSchema.partial()

const announcementQuerySchema = z.object({
  tour_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
  announcement_type: z.string().optional(),
  priority: z.enum(['emergency', 'urgent', 'important', 'general']).optional(),
  target_role: z.string().optional(),
  include_expired: z.boolean().default(false),
  include_unpublished: z.boolean().default(false),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
})

// =============================================================================
// GET /api/admin/communications/announcements
// Retrieve announcements with filtering
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const params = announcementQuerySchema.parse({
      tour_id: searchParams.get('tour_id') || undefined,
      event_id: searchParams.get('event_id') || undefined,
      venue_id: searchParams.get('venue_id') || undefined,
      announcement_type: searchParams.get('announcement_type') || undefined,
      priority: searchParams.get('priority') || undefined,
      target_role: searchParams.get('target_role') || undefined,
      include_expired: searchParams.get('include_expired') === 'true',
      include_unpublished: searchParams.get('include_unpublished') === 'true',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for role-based filtering
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Build base query
    let query = supabase
      .from('announcements')
      .select(`
        *,
        created_by_profile:profiles!created_by(
          id,
          display_name,
          role
        ),
        acknowledgment_count:announcement_acknowledgments(count),
        user_acknowledgment:announcement_acknowledgments!inner(
          viewed_at,
          acknowledged_at,
          acknowledgment_note
        )
      `)
      .order('created_at', { ascending: false })
      .limit(params.limit)
      .range(params.offset, params.offset + params.limit - 1)

    // Filter by publication status
    if (!params.include_unpublished) {
      query = query.eq('is_published', true)
    }

    // Filter by expiration
    if (!params.include_expired) {
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    }

    // Apply scope filters
    if (params.tour_id) {
      query = query.eq('tour_id', params.tour_id)
    }
    if (params.event_id) {
      query = query.eq('event_id', params.event_id)
    }
    if (params.venue_id) {
      query = query.eq('venue_id', params.venue_id)
    }
    if (params.announcement_type) {
      query = query.eq('announcement_type', params.announcement_type)
    }
    if (params.priority) {
      query = query.eq('priority', params.priority)
    }

    const { data: announcements, error, count } = await query

    if (error) {
      console.error('Error fetching announcements:', error)
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
    }

    // Filter announcements based on target audience
    const filteredAnnouncements = announcements?.filter(announcement => {
      // If no target audience specified, show to everyone
      if (!announcement.target_audience || announcement.target_audience.length === 0) {
        return true
      }

      // Check if user's role is in target audience
      if (userProfile?.role && announcement.target_audience.includes(userProfile.role)) {
        return true
      }

      // Check if user ID is specifically targeted
      if (announcement.target_audience.includes(user.id)) {
        return true
      }

      // Additional filtering based on department, venue membership, etc.
      // This would require more complex logic based on your specific requirements

      return false
    }) || []

    // Mark announcements as viewed
    const unviewedAnnouncementIds = filteredAnnouncements
      .filter(a => !a.user_acknowledgment || a.user_acknowledgment.length === 0)
      .map(a => a.id)

    if (unviewedAnnouncementIds.length > 0) {
      const viewRecords = unviewedAnnouncementIds.map(announcementId => ({
        announcement_id: announcementId,
        user_id: user.id
      }))

      await supabase
        .from('announcement_acknowledgments')
        .upsert(viewRecords, { onConflict: 'announcement_id,user_id' })
    }

    return NextResponse.json({
      success: true,
      data: filteredAnnouncements,
      meta: {
        total: filteredAnnouncements.length,
        limit: params.limit,
        offset: params.offset,
        hasMore: filteredAnnouncements.length === params.limit
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in GET /api/admin/communications/announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// POST /api/admin/communications/announcements
// Create a new announcement
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createAnnouncementSchema.parse(body)

    // Check user permissions (only admins, managers, and coordinators can create announcements)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const allowedRoles = ['admin', 'manager', 'tour_manager', 'event_coordinator']
    if (!userProfile || !allowedRoles.includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to create announcements' }, { status: 403 })
    }

    // Emergency announcements require admin role
    if (validatedData.priority === 'emergency' && userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create emergency announcements' }, { status: 403 })
    }

    // Set default publish time if not provided
    const publishAt = validatedData.publish_at ? new Date(validatedData.publish_at) : new Date()

    // Create the announcement
    const { data: newAnnouncement, error: createError } = await supabase
      .from('announcements')
      .insert({
        ...validatedData,
        publish_at: publishAt.toISOString(),
        created_by: user.id
      })
      .select(`
        *,
        created_by_profile:profiles!created_by(
          id,
          display_name,
          role
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating announcement:', createError)
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
    }

    // If announcement is published immediately, trigger notifications
    if (publishAt <= new Date()) {
      // This would integrate with your notification system
      // For now, we'll just log it
      console.log('Immediate announcement notification triggered for:', newAnnouncement.id)
      
      // You could trigger push notifications, emails, etc. here
      // based on the target_audience and priority
    }

    return NextResponse.json({
      success: true,
      data: newAnnouncement,
      message: 'Announcement created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in POST /api/admin/communications/announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// PATCH /api/admin/communications/announcements/[id]
// Update an announcement
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get announcement ID from URL
    const url = new URL(request.url)
    const announcementId = url.pathname.split('/').pop()

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateAnnouncementSchema.parse(body)

    // Get announcement and verify permissions
    const { data: announcement } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single()

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const canEdit = announcement.created_by === user.id || 
                   userProfile?.role === 'admin' ||
                   (userProfile?.role === 'manager' && announcement.priority !== 'emergency')

    if (!canEdit) {
      return NextResponse.json({ error: 'No permission to edit this announcement' }, { status: 403 })
    }

    // Update the announcement
    const { data: updatedAnnouncement, error: updateError } = await supabase
      .from('announcements')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', announcementId)
      .select(`
        *,
        created_by_profile:profiles!created_by(
          id,
          display_name,
          role
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating announcement:', updateError)
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Announcement updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in PATCH /api/admin/communications/announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// POST /api/admin/communications/announcements/[id]/acknowledge
// Acknowledge an announcement
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get announcement ID from URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const announcementId = pathParts[pathParts.length - 2] // -1 is 'acknowledge', -2 is the ID

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

// =============================================================================
// DELETE /api/admin/communications/announcements/[id]
// Delete an announcement
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get announcement ID from URL
    const url = new URL(request.url)
    const announcementId = url.pathname.split('/').pop()

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get announcement and verify permissions
    const { data: announcement } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single()

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const canDelete = announcement.created_by === user.id || userProfile?.role === 'admin'

    if (!canDelete) {
      return NextResponse.json({ error: 'No permission to delete this announcement' }, { status: 403 })
    }

    // Archive instead of hard delete
    const { error: deleteError } = await supabase
      .from('announcements')
      .update({
        is_archived: true,
        is_published: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', announcementId)

    if (deleteError) {
      console.error('Error deleting announcement:', deleteError)
      return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/communications/announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}