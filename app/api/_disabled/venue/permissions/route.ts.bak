import { NextRequest, NextResponse } from 'next/server'
import { VenueRolesPermissionsService } from '@/lib/services/venue-roles-permissions.service'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    const user = auth?.user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venueId')
    const targetUserId = searchParams.get('userId')
    const category = searchParams.get('category')

    // If category is provided, get permissions by category
    if (category) {
      const permissions = await VenueRolesPermissionsService.getPermissionsByCategory(category)
      return NextResponse.json({ permissions })
    }

    // If venueId and targetUserId are provided, get user permissions
    if (venueId && targetUserId) {
      // Check if user has permission to view permissions or is viewing their own permissions
      const hasPermission = await VenueRolesPermissionsService.userHasPermission(
        venueId,
        user.id,
        'admin.manage_roles' as any
      )

      if (!hasPermission && user.id !== targetUserId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const userPermissionsData = await VenueRolesPermissionsService.getUserPermissionsData(
        venueId,
        targetUserId
      )

      return NextResponse.json({ userPermissionsData })
    }

    // Otherwise, get all system permissions
    const permissions = await VenueRolesPermissionsService.getSystemPermissions()

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
} 