import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createChannelSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  channel_type: z.enum(['general', 'department', 'emergency', 'logistics', 'tour', 'event', 'venue', 'private', 'announcement']),
  tour_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
  department: z.string().max(100).optional(),
  target_roles: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
  allow_file_sharing: z.boolean().default(true),
  require_approval: z.boolean().default(false),
  auto_delete_messages: z.boolean().default(false),
  message_retention_days: z.number().int().positive().default(30)
})

const updateChannelSchema = createChannelSchema.partial().omit({ channel_type: true })

const channelParamsSchema = z.object({
  tour_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
  department: z.string().optional(),
  type: z.string().optional(),
  include_archived: z.boolean().default(false)
})

// =============================================================================
// GET /api/admin/communications/channels
// Retrieve communication channels with filtering
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const params = channelParamsSchema.parse({
      tour_id: searchParams.get('tour_id') || undefined,
      event_id: searchParams.get('event_id') || undefined,
      venue_id: searchParams.get('venue_id') || undefined,
      department: searchParams.get('department') || undefined,
      type: searchParams.get('type') || undefined,
      include_archived: searchParams.get('include_archived') === 'true'
    })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query with filters
    let query = supabase
      .from('communication_channels')
      .select(`
        *,
        created_by_profile:profiles!created_by(
          id,
          display_name,
          role
        ),
        participant_count:channel_participants(count),
        latest_message:messages(
          id,
          content,
          message_type,
          priority,
          created_at,
          sender:profiles!sender_id(
            id,
            display_name
          )
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (params.tour_id) {
      query = query.eq('tour_id', params.tour_id)
    }
    if (params.event_id) {
      query = query.eq('event_id', params.event_id)
    }
    if (params.venue_id) {
      query = query.eq('venue_id', params.venue_id)
    }
    if (params.department) {
      query = query.eq('department', params.department)
    }
    if (params.type) {
      query = query.eq('channel_type', params.type)
    }
    if (!params.include_archived) {
      query = query.eq('is_archived', false)
    }

    const { data: channels, error } = await query

    if (error) {
      console.error('Error fetching channels:', error)
      return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
    }

    // Get user's participation status for each channel
    const channelIds = channels?.map(channel => channel.id) || []
    if (channelIds.length > 0) {
      const { data: participations } = await supabase
        .from('channel_participants')
        .select('channel_id, role_in_channel, is_muted, last_read_at')
        .eq('user_id', user.id)
        .in('channel_id', channelIds)

      // Merge participation data with channels
      const channelsWithParticipation = channels?.map(channel => ({
        ...channel,
        user_participation: participations?.find(p => p.channel_id === channel.id) || null
      }))

      return NextResponse.json({
        success: true,
        data: channelsWithParticipation,
        meta: {
          total: channelsWithParticipation?.length || 0,
          filters: params
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: channels || [],
      meta: {
        total: 0,
        filters: params
      }
    })

  } catch (error) {
    console.error('Error in GET /api/admin/communications/channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// POST /api/admin/communications/channels
// Create a new communication channel
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
    const validatedData = createChannelSchema.parse(body)

    // Check user permissions (only admins, managers, and coordinators can create channels)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const allowedRoles = ['admin', 'manager', 'tour_manager', 'event_coordinator']
    if (!userProfile || !allowedRoles.includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate scope constraints
    const scopeCount = [validatedData.tour_id, validatedData.event_id, validatedData.venue_id]
      .filter(Boolean).length
    
    if (validatedData.channel_type !== 'general' && scopeCount === 0) {
      return NextResponse.json({ 
        error: 'Non-general channels must be scoped to a tour, event, or venue' 
      }, { status: 400 })
    }

    // Create the channel
    const { data: newChannel, error: createError } = await supabase
      .from('communication_channels')
      .insert({
        ...validatedData,
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
      console.error('Error creating channel:', createError)
      return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
    }

    // Add creator as channel owner
    await supabase
      .from('channel_participants')
      .insert({
        channel_id: newChannel.id,
        user_id: user.id,
        role_in_channel: 'owner',
        added_by: user.id
      })

    // Auto-add participants based on scope and target roles
    if (validatedData.target_roles && validatedData.target_roles.length > 0) {
      let participantQuery = supabase
        .from('profiles')
        .select('id')
        .in('role', validatedData.target_roles)

      // Add scope-based filtering for participants
      // This would require additional joins based on tour/event/venue membership
      // Implementation would depend on existing membership tables

      const { data: targetUsers } = await participantQuery

      if (targetUsers && targetUsers.length > 0) {
        const participantInserts = targetUsers
          .filter(u => u.id !== user.id) // Don't duplicate creator
          .map(u => ({
            channel_id: newChannel.id,
            user_id: u.id,
            role_in_channel: 'member',
            added_by: user.id
          }))

        if (participantInserts.length > 0) {
          await supabase
            .from('channel_participants')
            .insert(participantInserts)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: newChannel,
      message: 'Channel created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in POST /api/admin/communications/channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// PATCH /api/admin/communications/channels
// Bulk update multiple channels (archive, delete, etc.)
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { channel_ids, action, ...updateData } = body

    if (!Array.isArray(channel_ids) || channel_ids.length === 0) {
      return NextResponse.json({ error: 'channel_ids array is required' }, { status: 400 })
    }

    // Check permissions for each channel
    const { data: channelPermissions } = await supabase
      .from('communication_channels')
      .select('id, created_by')
      .in('id', channel_ids)

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userProfile?.role === 'admin'
    const ownedChannels = channelPermissions?.filter(ch => ch.created_by === user.id).map(ch => ch.id) || []
    const allowedChannels = isAdmin ? channel_ids : ownedChannels

    if (allowedChannels.length === 0) {
      return NextResponse.json({ error: 'No permission to modify these channels' }, { status: 403 })
    }

    // Perform bulk action
    let query = supabase
      .from('communication_channels')
      .update(updateData)
      .in('id', allowedChannels)
      .select()

    const { data: updatedChannels, error: updateError } = await query

    if (updateError) {
      console.error('Error updating channels:', updateError)
      return NextResponse.json({ error: 'Failed to update channels' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedChannels,
      message: `Updated ${updatedChannels?.length || 0} channels`,
      meta: {
        requested: channel_ids.length,
        updated: updatedChannels?.length || 0,
        allowed: allowedChannels.length
      }
    })

  } catch (error) {
    console.error('Error in PATCH /api/admin/communications/channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}