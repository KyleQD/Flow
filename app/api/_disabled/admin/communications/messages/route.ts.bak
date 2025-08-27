import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createMessageSchema = z.object({
  channel_id: z.string().uuid(),
  content: z.string().min(1),
  message_type: z.enum(['text', 'file', 'image', 'video', 'location', 'announcement', 'system', 'poll', 'task', 'alert']).default('text'),
  priority: z.enum(['emergency', 'urgent', 'important', 'general']).default('general'),
  thread_id: z.string().uuid().optional(),
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
    thumbnail_url: z.string().url().optional()
  })).optional(),
  mentions: z.array(z.string().uuid()).optional()
})

const updateMessageSchema = z.object({
  content: z.string().min(1),
  is_pinned: z.boolean().optional()
})

const messageQuerySchema = z.object({
  channel_id: z.string().uuid().optional(),
  thread_id: z.string().uuid().optional(),
  priority: z.enum(['emergency', 'urgent', 'important', 'general']).optional(),
  message_type: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  before: z.string().optional(), // For pagination
  after: z.string().optional(),
  search: z.string().optional()
})

// =============================================================================
// GET /api/admin/communications/messages
// Retrieve messages with filtering and pagination
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const params = messageQuerySchema.parse({
      channel_id: searchParams.get('channel_id') || undefined,
      thread_id: searchParams.get('thread_id') || undefined,
      priority: searchParams.get('priority') || undefined,
      message_type: searchParams.get('message_type') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      before: searchParams.get('before') || undefined,
      after: searchParams.get('after') || undefined,
      search: searchParams.get('search') || undefined
    })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build base query
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(
          id,
          display_name,
          role
        ),
        attachments:message_attachments(*),
        thread_count:messages!thread_id(count),
        channel:communication_channels(
          id,
          name,
          channel_type
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(params.limit)
      .range(params.offset, params.offset + params.limit - 1)

    // Apply filters
    if (params.channel_id) {
      // Verify user has access to this channel
      const { data: participation } = await supabase
        .from('channel_participants')
        .select('channel_id')
        .eq('user_id', user.id)
        .eq('channel_id', params.channel_id)
        .single()

      if (!participation) {
        return NextResponse.json({ error: 'Access denied to this channel' }, { status: 403 })
      }

      query = query.eq('channel_id', params.channel_id)
    } else {
      // Only show messages from channels user has access to
      const { data: userChannels } = await supabase
        .from('channel_participants')
        .select('channel_id')
        .eq('user_id', user.id)

      const channelIds = userChannels?.map(ch => ch.channel_id) || []
      if (channelIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          meta: { total: 0, hasMore: false }
        })
      }

      query = query.in('channel_id', channelIds)
    }

    if (params.thread_id) {
      query = query.eq('thread_id', params.thread_id)
    }
    if (params.priority) {
      query = query.eq('priority', params.priority)
    }
    if (params.message_type) {
      query = query.eq('message_type', params.message_type)
    }
    if (params.before) {
      query = query.lt('created_at', params.before)
    }
    if (params.after) {
      query = query.gt('created_at', params.after)
    }

    // Add full-text search if provided
    if (params.search) {
      query = query.textSearch('content', params.search)
    }

    const { data: messages, error, count } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Update last_read_at for user in relevant channels
    if (params.channel_id) {
      await supabase
        .from('channel_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('channel_id', params.channel_id)
    }

    return NextResponse.json({
      success: true,
      data: messages || [],
      meta: {
        total: count || 0,
        limit: params.limit,
        offset: params.offset,
        hasMore: (messages?.length || 0) === params.limit
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in GET /api/admin/communications/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// POST /api/admin/communications/messages
// Send a new message
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Verify user has permission to send messages in this channel
    const { data: participation } = await supabase
      .from('channel_participants')
      .select('role_in_channel')
      .eq('user_id', user.id)
      .eq('channel_id', validatedData.channel_id)
      .single()

    if (!participation || participation.role_in_channel === 'viewer') {
      return NextResponse.json({ error: 'No permission to send messages in this channel' }, { status: 403 })
    }

    // If replying to a thread, verify thread exists and is in same channel
    if (validatedData.thread_id) {
      const { data: threadMessage } = await supabase
        .from('messages')
        .select('channel_id')
        .eq('id', validatedData.thread_id)
        .single()

      if (!threadMessage || threadMessage.channel_id !== validatedData.channel_id) {
        return NextResponse.json({ error: 'Invalid thread reference' }, { status: 400 })
      }
    }

    // Create the message
    const { data: newMessage, error: createError } = await supabase
      .from('messages')
      .insert({
        ...validatedData,
        sender_id: user.id
      })
      .select(`
        *,
        sender:profiles!sender_id(
          id,
          display_name,
          role
        ),
        channel:communication_channels(
          id,
          name,
          channel_type
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating message:', createError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Handle attachments if provided
    if (validatedData.attachments && validatedData.attachments.length > 0) {
      const attachmentInserts = validatedData.attachments.map(attachment => ({
        message_id: newMessage.id,
        ...attachment,
        uploaded_by: user.id
      }))

      await supabase
        .from('message_attachments')
        .insert(attachmentInserts)
    }

    // Handle mentions - send notifications to mentioned users
    if (validatedData.mentions && validatedData.mentions.length > 0) {
      // This would integrate with notification system
      // For now, we'll just log it
      console.log('Message mentions:', validatedData.mentions)
    }

    // Trigger real-time notification
    // This would be handled by Supabase real-time subscriptions

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in POST /api/admin/communications/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// PATCH /api/admin/communications/messages/[id]
// Update a message (edit content, pin/unpin, etc.)
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get message ID from URL
    const url = new URL(request.url)
    const messageId = url.pathname.split('/').pop()

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateMessageSchema.parse(body)

    // Get message and verify permissions
    const { data: message } = await supabase
      .from('messages')
      .select(`
        *,
        channel:communication_channels(
          id,
          created_by
        ),
        sender_participation:channel_participants!inner(
          role_in_channel
        )
      `)
      .eq('id', messageId)
      .eq('sender_participation.user_id', user.id)
      .single()

    if (!message) {
      return NextResponse.json({ error: 'Message not found or no permission' }, { status: 404 })
    }

    // Check if user can edit this message
    const canEdit = message.sender_id === user.id || 
                   message.sender_participation.role_in_channel === 'owner' ||
                   message.sender_participation.role_in_channel === 'moderator'

    if (!canEdit) {
      return NextResponse.json({ error: 'No permission to edit this message' }, { status: 403 })
    }

    // Update the message
    const updatePayload: any = {}
    if (validatedData.content) {
      updatePayload.content = validatedData.content
      updatePayload.is_edited = true
      updatePayload.edited_at = new Date().toISOString()
    }
    if (validatedData.is_pinned !== undefined) {
      updatePayload.is_pinned = validatedData.is_pinned
    }

    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update(updatePayload)
      .eq('id', messageId)
      .select(`
        *,
        sender:profiles!sender_id(
          id,
          display_name,
          role
        ),
        attachments:message_attachments(*)
      `)
      .single()

    if (updateError) {
      console.error('Error updating message:', updateError)
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedMessage,
      message: 'Message updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Error in PATCH /api/admin/communications/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// DELETE /api/admin/communications/messages/[id]
// Delete a message (soft delete)
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get message ID from URL
    const url = new URL(request.url)
    const messageId = url.pathname.split('/').pop()

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get message and verify permissions
    const { data: message } = await supabase
      .from('messages')
      .select(`
        *,
        channel:communication_channels(id),
        sender_participation:channel_participants!inner(role_in_channel)
      `)
      .eq('id', messageId)
      .eq('sender_participation.user_id', user.id)
      .single()

    if (!message) {
      return NextResponse.json({ error: 'Message not found or no permission' }, { status: 404 })
    }

    // Check if user can delete this message
    const canDelete = message.sender_id === user.id || 
                     message.sender_participation.role_in_channel === 'owner' ||
                     message.sender_participation.role_in_channel === 'moderator'

    if (!canDelete) {
      return NextResponse.json({ error: 'No permission to delete this message' }, { status: 403 })
    }

    // Soft delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: '[Message deleted]'
      })
      .eq('id', messageId)

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/communications/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}