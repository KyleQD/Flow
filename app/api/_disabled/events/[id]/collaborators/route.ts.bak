import { NextRequest, NextResponse } from 'next/server'
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

// GET /api/events/[id]/collaborators - Get event collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceRoleClient()
  const resolvedParams = await params
    const eventId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'accepted', 'declined'

    // Check if user is authenticated
    const auth = parseAuthFromCookies(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase.auth.getUser(auth.accessToken)
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user can view collaborators (event creator or existing collaborator)
    let canView = user.user.id === event.user_id

    if (!canView) {
      const { data: collaborator } = await supabase
        .from('event_collaborators')
        .select('status')
        .eq('event_id', eventId)
        .eq('event_table', 'artist_events')
        .eq('user_id', user.user.id)
        .eq('status', 'accepted')
        .single()

      if (collaborator) {
        canView = true
      }
    }

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build query for collaborators
    let query = supabase
      .from('event_collaborators')
      .select(`
        id,
        user_id,
        invited_by,
        role,
        permissions,
        status,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        ),
        inviter:invited_by (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')

    if (status) {
      query = query.eq('status', status)
    }

    const { data: collaborators, error: collaboratorsError } = await query
      .order('created_at', { ascending: false })

    if (collaboratorsError) {
      console.error('Error fetching collaborators:', collaboratorsError)
      return NextResponse.json({ error: 'Failed to fetch collaborators' }, { status: 500 })
    }

    return NextResponse.json({
      collaborators: collaborators || [],
      event: {
        id: event.id,
        title: event.title,
        creator_id: event.user_id
      }
    })
  } catch (error) {
    console.error('Error in collaborators API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/events/[id]/collaborators - Invite new collaborator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceRoleClient()
  const resolvedParams = await params
    const eventId = resolvedParams.id
    const auth = parseAuthFromCookies(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase.auth.getUser(auth.accessToken)
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      user_id, 
      role = 'editor', 
      permissions = {
        can_edit_details: true,
        can_post_updates: true,
        can_moderate_posts: true,
        can_manage_collaborators: false
      }
    } = body

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user can invite collaborators
    let canInvite = user.user.id === event.user_id

    if (!canInvite) {
      const { data: collaborator } = await supabase
        .from('event_collaborators')
        .select('permissions')
        .eq('event_id', eventId)
        .eq('event_table', 'artist_events')
        .eq('user_id', user.user.id)
        .eq('status', 'accepted')
        .single()

      if (collaborator?.permissions?.can_manage_collaborators) {
        canInvite = true
      }
    }

    if (!canInvite) {
      return NextResponse.json({ error: 'You do not have permission to invite collaborators' }, { status: 403 })
    }

    // Check if user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', user_id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already a collaborator
    const { data: existingCollaborator } = await supabase
      .from('event_collaborators')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .eq('user_id', user_id)
      .single()

    if (existingCollaborator) {
      if (existingCollaborator.status === 'accepted') {
        return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 })
      } else if (existingCollaborator.status === 'pending') {
        return NextResponse.json({ error: 'User already has a pending invitation' }, { status: 400 })
      }
    }

    // Validate role
    const validRoles = ['admin', 'editor', 'moderator']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Create collaboration invitation
    const { data: collaboration, error: collaborationError } = await supabase
      .from('event_collaborators')
      .insert({
        event_id: eventId,
        event_table: 'artist_events',
        user_id,
        invited_by: user.user.id,
        role,
        permissions,
        status: 'pending'
      })
      .select(`
        id,
        user_id,
        invited_by,
        role,
        permissions,
        status,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        ),
        inviter:invited_by (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (collaborationError) {
      console.error('Error creating collaboration:', collaborationError)
      return NextResponse.json({ error: 'Failed to invite collaborator' }, { status: 500 })
    }

    // TODO: Send notification to invited user
    console.log(`User ${user_id} invited to collaborate on event ${eventId}`)

    return NextResponse.json({
      collaboration,
      message: 'Collaborator invitation sent successfully'
    })
  } catch (error) {
    console.error('Error in collaborator invitation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/events/[id]/collaborators/[collaboratorId] - Update collaborator (accept/decline/update permissions)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceRoleClient()
  const resolvedParams = await params
    const eventId = resolvedParams.id
    const auth = parseAuthFromCookies(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase.auth.getUser(auth.accessToken)
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { collaborator_id, status, role, permissions } = body

    if (!collaborator_id) {
      return NextResponse.json({ error: 'Collaborator ID is required' }, { status: 400 })
    }

    // Get collaboration record
    const { data: collaboration, error: collaborationError } = await supabase
      .from('event_collaborators')
      .select('*')
      .eq('id', collaborator_id)
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .single()

    if (collaborationError) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check permissions
    let canUpdate = false

    if (status && (status === 'accepted' || status === 'declined')) {
      // User can accept/decline their own invitation
      if (user.user.id === collaboration.user_id) {
        canUpdate = true
      }
    }

    if (role || permissions) {
      // Only event creator or admin collaborators can update role/permissions
      if (user.user.id === event.user_id) {
        canUpdate = true
      } else {
        const { data: userCollaborator } = await supabase
          .from('event_collaborators')
          .select('role, permissions')
          .eq('event_id', eventId)
          .eq('user_id', user.user.id)
          .eq('status', 'accepted')
          .single()

        if (userCollaborator?.role === 'admin' || userCollaborator?.permissions?.can_manage_collaborators) {
          canUpdate = true
        }
      }
    }

    if (!canUpdate) {
      return NextResponse.json({ error: 'You do not have permission to update this collaboration' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (role) updateData.role = role
    if (permissions) updateData.permissions = permissions

    // Update collaboration
    const { data: updatedCollaboration, error: updateError } = await supabase
      .from('event_collaborators')
      .update(updateData)
      .eq('id', collaborator_id)
      .select(`
        id,
        user_id,
        invited_by,
        role,
        permissions,
        status,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          is_verified
        ),
        inviter:invited_by (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating collaboration:', updateError)
      return NextResponse.json({ error: 'Failed to update collaboration' }, { status: 500 })
    }

    return NextResponse.json({
      collaboration: updatedCollaboration,
      message: 'Collaboration updated successfully'
    })
  } catch (error) {
    console.error('Error in collaborator update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id]/collaborators/[collaboratorId] - Remove collaborator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceRoleClient()
  const resolvedParams = await params
    const eventId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const collaboratorId = searchParams.get('collaborator_id')
    const auth = parseAuthFromCookies(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase.auth.getUser(auth.accessToken)
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!collaboratorId) {
      return NextResponse.json({ error: 'Collaborator ID is required' }, { status: 400 })
    }

    // Get collaboration record
    const { data: collaboration, error: collaborationError } = await supabase
      .from('event_collaborators')
      .select('*')
      .eq('id', collaboratorId)
      .eq('event_id', eventId)
      .eq('event_table', 'artist_events')
      .single()

    if (collaborationError) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('artist_events')
      .select('id, title, user_id')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check permissions
    let canDelete = false

    // Event creator can remove any collaborator
    if (user.user.id === event.user_id) {
      canDelete = true
    }
    // User can remove themselves
    else if (user.user.id === collaboration.user_id) {
      canDelete = true
    }
    // Admin collaborators can remove other collaborators
    else {
      const { data: userCollaborator } = await supabase
        .from('event_collaborators')
        .select('role, permissions')
        .eq('event_id', eventId)
        .eq('user_id', user.user.id)
        .eq('status', 'accepted')
        .single()

      if (userCollaborator?.role === 'admin' || userCollaborator?.permissions?.can_manage_collaborators) {
        canDelete = true
      }
    }

    if (!canDelete) {
      return NextResponse.json({ error: 'You do not have permission to remove this collaborator' }, { status: 403 })
    }

    // Delete collaboration
    const { error: deleteError } = await supabase
      .from('event_collaborators')
      .delete()
      .eq('id', collaboratorId)

    if (deleteError) {
      console.error('Error deleting collaboration:', deleteError)
      return NextResponse.json({ error: 'Failed to remove collaborator' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Collaborator removed successfully'
    })
  } catch (error) {
    console.error('Error in collaborator deletion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 