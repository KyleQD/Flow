import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
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

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    // Check if user has permission to view roles
    const hasPermission = await VenueRolesPermissionsService.userHasPermission(
      venueId,
      user.id,
      'admin.manage_roles' as any
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const roles = await VenueRolesPermissionsService.getVenueRoles(venueId)

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Error fetching venue roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venue roles' },
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
    const { venueId, roleName, roleDescription, roleLevel, permissions } = body

    if (!venueId || !roleName || !roleLevel) {
      return NextResponse.json(
        { error: 'Venue ID, role name, and role level are required' },
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

    // Create the role
    const roleData = {
      venue_id: venueId,
      role_name: roleName,
      role_description: roleDescription || null,
      role_level: roleLevel,
      is_system_role: false,
      is_active: true,
      created_by: user.id
    }

    const newRole = await VenueRolesPermissionsService.createVenueRole(roleData)

    // Assign permissions if provided
    if (permissions && permissions.length > 0) {
      await VenueRolesPermissionsService.assignPermissionsToRole(
        newRole.id,
        permissions,
        user.id
      )
    }

    // Get the role with its permissions
    const roleWithPermissions = await VenueRolesPermissionsService.getRoleWithPermissions(newRole.id)

    return NextResponse.json({ 
      role: roleWithPermissions,
      message: 'Role created successfully' 
    })
  } catch (error) {
    console.error('Error creating venue role:', error)
    return NextResponse.json(
      { error: 'Failed to create venue role' },
      { status: 500 }
    )
  }
} 