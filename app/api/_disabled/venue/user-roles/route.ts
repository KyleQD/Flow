import { NextRequest, NextResponse } from 'next/server'
import { VenueRolesPermissionsService } from '@/lib/services/venue-roles-permissions.service'
import { authenticateUser } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venueId')
    const targetUserId = searchParams.get('userId')

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    // If targetUserId is provided, get roles for that specific user
    if (targetUserId) {
      // Check if user has permission to view roles or is viewing their own roles
      const hasPermission = await VenueRolesPermissionsService.userHasPermission(
        venueId,
        user.id,
        'admin.manage_roles' as any
      )

      if (!hasPermission && user.id !== targetUserId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const userRoles = await VenueRolesPermissionsService.getUserRoles(venueId, targetUserId)
      return NextResponse.json({ userRoles })
    }

    // Otherwise, get all users with roles for the venue
    const hasPermission = await VenueRolesPermissionsService.userHasPermission(
      venueId,
      user.id,
      'admin.manage_roles' as any
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const usersWithRoles = await VenueRolesPermissionsService.getUsersWithRoles(venueId)

    return NextResponse.json({ usersWithRoles })
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { venueId, userId, roleId, expiresAt, notes } = body

    if (!venueId || !userId || !roleId) {
      return NextResponse.json(
        { error: 'Venue ID, user ID, and role ID are required' },
        { status: 400 }
      )
    }

    // Check if user has permission to manage roles
    const hasPermission = await VenueRolesPermissionsService.userHasPermission(
      venueId,
      user.id,
      'admin.manage_roles' as any
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Assign the role to the user
    const assignmentData = {
      venue_id: venueId,
      user_id: userId,
      role_id: roleId,
      expires_at: expiresAt || null,
      notes: notes || null
    }

    const userRole = await VenueRolesPermissionsService.assignUserRole(assignmentData, user.id)

    return NextResponse.json({ 
      userRole,
      message: 'Role assigned successfully' 
    })
  } catch (error) {
    console.error('Error assigning user role:', error)
    return NextResponse.json(
      { error: 'Failed to assign user role' },
      { status: 500 }
    )
  }
} 