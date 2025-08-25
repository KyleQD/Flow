import { supabase } from '@/lib/supabase'
import type {
  Permission,
  SystemRole,
  TourManagementRole,
  TourManagementPermission,
  UserTourRole,
  UserPermissionContext,
  PermissionChecker,
  DataIsolationContext,
  RoleAssignmentPayload,
  PermissionValidationResult,
  TourAccessLevel,
  UserTourAccess
} from '@/types/rbac'
import { PERMISSIONS, SYSTEM_ROLES, TOUR_ACCESS_LEVELS } from '@/types/rbac'

export class RBACService {
  private static instance: RBACService
  private permissionCache: Map<string, UserPermissionContext> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService()
    }
    return RBACService.instance
  }

  // Clear cache when needed
  public clearCache(): void {
    this.permissionCache.clear()
  }

  // Get user's permission context
  public async getUserPermissionContext(
    userId: string,
    tourId?: string
  ): Promise<UserPermissionContext> {
    const cacheKey = `${userId}:${tourId || 'global'}`
    
    // Check cache first
    if (this.permissionCache.has(cacheKey)) {
      const cached = this.permissionCache.get(cacheKey)!
      return cached
    }

    try {
      // Get user's permissions using the database function
      const { data: permissions, error: permError } = await supabase
        .rpc('get_user_permissions', { user_id: userId, tour_id: tourId })

      if (permError) {
        console.error('Error getting user permissions:', permError)
        throw permError
      }

      // Get user's roles
      const { data: userRoles, error: roleError } = await supabase
        .from('user_tour_roles')
        .select(`
          *,
          tour_management_roles (*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)

      if (roleError) {
        console.error('Error getting user roles:', roleError)
        throw roleError
      }

      const context: UserPermissionContext = {
        userId,
        tourId,
        permissions: permissions?.map((p: any) => p.permission_name) || [],
        roles: userRoles?.map((ur: any) => ({
          role: ur.tour_management_roles,
          tourId: ur.tour_id,
          isActive: ur.is_active
        })) || []
      }

      // Cache the context
      this.permissionCache.set(cacheKey, context)
      
      // Auto-clear cache after timeout
      setTimeout(() => {
        this.permissionCache.delete(cacheKey)
      }, this.cacheTimeout)

      return context
    } catch (error) {
      console.error('Error getting user permission context:', error)
      return {
        userId,
        tourId,
        permissions: [],
        roles: []
      }
    }
  }

  // Create permission checker for a user
  public async createPermissionChecker(
    userId: string,
    tourId?: string
  ): Promise<PermissionChecker> {
    const context = await this.getUserPermissionContext(userId, tourId)
    
    return {
      hasPermission: (permission: Permission, specificTourId?: string) => {
        const targetTourId = specificTourId || tourId
        
        // Check global permissions first
        const hasGlobalPermission = context.permissions.includes(permission)
        
        // If we have a specific tour, check tour-specific permissions
        if (targetTourId) {
          const tourSpecificContext = context.roles.some(
            r => r.tourId === targetTourId && r.isActive
          )
          if (tourSpecificContext) {
            return hasGlobalPermission || context.permissions.includes(permission)
          }
        }
        
        return hasGlobalPermission
      },

      hasAnyPermission: (permissions: Permission[], specificTourId?: string) => {
        return permissions.some(p => context.permissions.includes(p))
      },

      hasAllPermissions: (permissions: Permission[], specificTourId?: string) => {
        return permissions.every(p => context.permissions.includes(p))
      },

      hasRole: (role: SystemRole, specificTourId?: string) => {
        const targetTourId = specificTourId || tourId
        return context.roles.some(r => 
          r.role.name === role && 
          r.isActive && 
          (targetTourId ? r.tourId === targetTourId : true)
        )
      },

      canAccessTour: (tourId: string) => {
        return context.roles.some(r => 
          r.isActive && (r.tourId === tourId || r.tourId === null)
        )
      }
    }
  }

  // Assign role to user
  public async assignRole(payload: RoleAssignmentPayload): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('assign_user_role', {
          target_user_id: payload.userId,
          role_name: payload.roleName,
          target_tour_id: payload.tourId || null,
          assigner_user_id: payload.assignedBy || null
        })

      if (error) {
        console.error('Error assigning role:', error)
        throw error
      }

      // Clear cache for this user
      this.clearUserCache(payload.userId)

      return data
    } catch (error) {
      console.error('Error in assignRole:', error)
      throw error
    }
  }

  // Remove role from user
  public async removeRole(
    userId: string,
    roleName: SystemRole,
    tourId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_tour_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('tour_id', tourId || null)
        .in('role_id', [
          await this.getRoleIdByName(roleName)
        ])

      if (error) {
        console.error('Error removing role:', error)
        throw error
      }

      // Clear cache for this user
      this.clearUserCache(userId)
    } catch (error) {
      console.error('Error in removeRole:', error)
      throw error
    }
  }

  // Get role ID by name
  private async getRoleIdByName(roleName: SystemRole): Promise<string> {
    const { data, error } = await supabase
      .from('tour_management_roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (error || !data) {
      throw new Error(`Role ${roleName} not found`)
    }

    return data.id
  }

  // Clear cache for specific user
  private clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.permissionCache.keys())
      .filter(key => key.startsWith(`${userId}:`))
    
    keysToDelete.forEach(key => {
      this.permissionCache.delete(key)
    })
  }

  // Validate permission for an action
  public async validatePermission(
    userId: string,
    requiredPermissions: Permission[],
    tourId?: string
  ): Promise<PermissionValidationResult> {
    const checker = await this.createPermissionChecker(userId, tourId)
    
    const missingPermissions: Permission[] = []
    
    for (const permission of requiredPermissions) {
      if (!checker.hasPermission(permission, tourId)) {
        missingPermissions.push(permission)
      }
    }

    return {
      isValid: missingPermissions.length === 0,
      reason: missingPermissions.length > 0 
        ? `Missing permissions: ${missingPermissions.join(', ')}` 
        : undefined,
      requiredPermissions,
      missingPermissions
    }
  }

  // Get data isolation context for user
  public async getDataIsolationContext(userId: string): Promise<DataIsolationContext> {
    try {
      // Get all tours the user has access to
      const { data: userRoles, error } = await supabase
        .from('user_tour_roles')
        .select('tour_id')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        console.error('Error getting user tour access:', error)
        throw error
      }

      const accessibleTours = userRoles
        ?.map(ur => ur.tour_id)
        .filter(id => id !== null) || []

      // Get global permissions
      const globalContext = await this.getUserPermissionContext(userId)
      
      // Get tour-specific permissions
      const tourSpecificPermissions: Record<string, Permission[]> = {}
      
      for (const tourId of accessibleTours) {
        const tourContext = await this.getUserPermissionContext(userId, tourId)
        tourSpecificPermissions[tourId] = tourContext.permissions
      }

      return {
        userId,
        accessibleTours,
        globalPermissions: globalContext.permissions,
        tourSpecificPermissions
      }
    } catch (error) {
      console.error('Error getting data isolation context:', error)
      return {
        userId,
        accessibleTours: [],
        globalPermissions: [],
        tourSpecificPermissions: {}
      }
    }
  }

  // Get user's tour access level
  public async getUserTourAccess(
    userId: string,
    tourId: string
  ): Promise<UserTourAccess> {
    const checker = await this.createPermissionChecker(userId, tourId)
    const context = await this.getUserPermissionContext(userId, tourId)
    
    // Determine access level based on permissions
    let accessLevel: TourAccessLevel = TOUR_ACCESS_LEVELS.NONE
    
    if (checker.hasPermission(PERMISSIONS.TOURS_DELETE, tourId) ||
        checker.hasPermission(PERMISSIONS.ADMIN_SETTINGS, tourId)) {
      accessLevel = TOUR_ACCESS_LEVELS.ADMIN
    } else if (checker.hasPermission(PERMISSIONS.TOURS_MANAGE_STAFF, tourId) ||
               checker.hasPermission(PERMISSIONS.TOURS_EDIT, tourId)) {
      accessLevel = TOUR_ACCESS_LEVELS.MANAGE
    } else if (checker.hasPermission(PERMISSIONS.TOURS_EDIT, tourId) ||
               checker.hasPermission(PERMISSIONS.EVENTS_EDIT, tourId)) {
      accessLevel = TOUR_ACCESS_LEVELS.EDIT
    } else if (checker.hasPermission(PERMISSIONS.TOURS_VIEW, tourId)) {
      accessLevel = TOUR_ACCESS_LEVELS.VIEW
    }

    return {
      tourId,
      userId,
      accessLevel,
      permissions: context.permissions,
      roles: context.roles
        .filter(r => r.tourId === tourId || r.tourId === null)
        .map(r => r.role.name as SystemRole),
      isActive: context.roles.some(r => r.isActive),
      expiresAt: context.roles.find(r => r.tourId === tourId)?.role.updated_at
    }
  }

  // Get all roles
  public async getAllRoles(): Promise<TourManagementRole[]> {
    const { data, error } = await supabase
      .from('tour_management_roles')
      .select('*')
      .order('display_name')

    if (error) {
      console.error('Error getting roles:', error)
      throw error
    }

    return data || []
  }

  // Get all permissions
  public async getAllPermissions(): Promise<TourManagementPermission[]> {
    const { data, error } = await supabase
      .from('tour_management_permissions')
      .select('*')
      .order('category, display_name')

    if (error) {
      console.error('Error getting permissions:', error)
      throw error
    }

    return data || []
  }

  // Get permissions for a role
  public async getRolePermissions(roleId: string): Promise<TourManagementPermission[]> {
    const { data, error } = await supabase
      .from('tour_role_permissions')
      .select(`
        tour_management_permissions (*)
      `)
      .eq('role_id', roleId)

    if (error) {
      console.error('Error getting role permissions:', error)
      throw error
    }

    return (data?.map(rp => rp.tour_management_permissions).filter(Boolean).flat() as TourManagementPermission[]) || []
  }

  // Update role permissions
  public async updateRolePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<void> {
    try {
      // Remove existing permissions
      const { error: deleteError } = await supabase
        .from('tour_role_permissions')
        .delete()
        .eq('role_id', roleId)

      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError)
        throw deleteError
      }

      // Add new permissions
      if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
          .from('tour_role_permissions')
          .insert(
            permissionIds.map(permissionId => ({
              role_id: roleId,
              permission_id: permissionId
            }))
          )

        if (insertError) {
          console.error('Error inserting new permissions:', insertError)
          throw insertError
        }
      }

      // Clear all caches since role permissions changed
      this.clearCache()
    } catch (error) {
      console.error('Error updating role permissions:', error)
      throw error
    }
  }

  // Create new role
  public async createRole(
    name: string,
    displayName: string,
    description?: string
  ): Promise<TourManagementRole> {
    const { data, error } = await supabase
      .from('tour_management_roles')
      .insert({
        name,
        display_name: displayName,
        description,
        is_system_role: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating role:', error)
      throw error
    }

    return data
  }

  // Delete role (only non-system roles)
  public async deleteRole(roleId: string): Promise<void> {
    const { error } = await supabase
      .from('tour_management_roles')
      .delete()
      .eq('id', roleId)
      .eq('is_system_role', false)

    if (error) {
      console.error('Error deleting role:', error)
      throw error
    }

    // Clear cache
    this.clearCache()
  }

  // Get users with specific role
  public async getUsersWithRole(
    roleName: SystemRole,
    tourId?: string
  ): Promise<Array<{ userId: string; email?: string; assignedAt: string }>> {
    const { data, error } = await supabase
      .from('user_tour_roles')
      .select(`
        user_id,
        assigned_at,
        tour_management_roles!inner(name)
      `)
      .eq('tour_management_roles.name', roleName)
      .eq('tour_id', tourId || null)
      .eq('is_active', true)

    if (error) {
      console.error('Error getting users with role:', error)
      throw error
    }

    return data?.map(ur => ({
      userId: ur.user_id,
      assignedAt: ur.assigned_at
    })) || []
  }

  // Check if user has access to specific tour
  public async checkTourAccess(userId: string, tourId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('user_has_permission', {
          user_id: userId,
          permission_name: PERMISSIONS.TOURS_VIEW,
          tour_id: tourId
        })

      if (error) {
        console.error('Error checking tour access:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error in checkTourAccess:', error)
      return false
    }
  }
}

// Export singleton instance
export const rbacService = RBACService.getInstance()

// Permission decorators/guards for server actions
export function requirePermission(permission: Permission, tourId?: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const userId = args[0]?.userId // Assuming userId is first arg
      
      if (!userId) {
        throw new Error('User ID is required')
      }

      const validation = await rbacService.validatePermission(
        userId,
        [permission],
        tourId
      )

      if (!validation.isValid) {
        throw new Error(`Permission denied: ${validation.reason}`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// Helper function to check permissions in server actions
export async function checkPermission(
  userId: string,
  permission: Permission,
  tourId?: string
): Promise<boolean> {
  const validation = await rbacService.validatePermission(
    userId,
    [permission],
    tourId
  )
  
  return validation.isValid
}

// Helper function to require permission in server actions
export async function requirePermissionCheck(
  userId: string,
  permission: Permission,
  tourId?: string
): Promise<void> {
  const hasPermission = await checkPermission(userId, permission, tourId)
  
  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`)
  }
} 