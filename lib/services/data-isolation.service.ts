import { supabase } from '@/lib/supabase'
import { rbacService } from './rbac.service'
import type {
  Permission,
  SystemRole,
  DataIsolationContext,
  Tour,
  TourEvent
} from '@/types/rbac'
import { PERMISSIONS } from '@/types/rbac'

export interface DataAccessPolicy {
  userId: string
  resourceType: 'tour' | 'event' | 'staff' | 'financial' | 'logistics'
  resourceId: string
  accessLevel: 'none' | 'read' | 'write' | 'admin'
  conditions?: Record<string, any>
}

export interface IsolationRule {
  name: string
  description: string
  resourceType: string
  condition: (context: DataIsolationContext, resourceId: string) => boolean
  permissions: Permission[]
}

export class DataIsolationService {
  private static instance: DataIsolationService
  private isolationRules: IsolationRule[] = []
  private policyCache: Map<string, DataAccessPolicy[]> = new Map()
  private cacheTimeout = 10 * 60 * 1000 // 10 minutes

  private constructor() {
    this.initializeRules()
  }

  public static getInstance(): DataIsolationService {
    if (!DataIsolationService.instance) {
      DataIsolationService.instance = new DataIsolationService()
    }
    return DataIsolationService.instance
  }

  // Initialize default isolation rules
  private initializeRules(): void {
    this.isolationRules = [
      // Tour-level isolation
      {
        name: 'tour_access_control',
        description: 'Users can only access tours they are assigned to or have global permissions',
        resourceType: 'tour',
        condition: (context, tourId) => {
          return context.accessibleTours.includes(tourId) ||
                 context.globalPermissions.includes(PERMISSIONS.TOURS_VIEW)
        },
        permissions: [PERMISSIONS.TOURS_VIEW]
      },

      // Event-level isolation (inherits from tour)
      {
        name: 'event_access_control',
        description: 'Users can only access events for tours they have access to',
        resourceType: 'event',
        condition: (context, eventId) => {
          // Would need to get tour ID from event ID in real implementation
          return true // Simplified for now
        },
        permissions: [PERMISSIONS.EVENTS_VIEW]
      },

      // Staff data isolation
      {
        name: 'staff_data_isolation',
        description: 'Users can only view staff data for tours they manage',
        resourceType: 'staff',
        condition: (context, tourId) => {
          return context.globalPermissions.includes(PERMISSIONS.STAFF_VIEW) ||
                 context.tourSpecificPermissions[tourId]?.includes(PERMISSIONS.STAFF_VIEW)
        },
        permissions: [PERMISSIONS.STAFF_VIEW, PERMISSIONS.STAFF_MANAGE]
      },

      // Financial data isolation
      {
        name: 'financial_data_isolation',
        description: 'Financial data is restricted to authorized personnel only',
        resourceType: 'financial',
        condition: (context, tourId) => {
          return context.globalPermissions.includes(PERMISSIONS.FINANCES_VIEW) ||
                 context.tourSpecificPermissions[tourId]?.includes(PERMISSIONS.FINANCES_VIEW)
        },
        permissions: [PERMISSIONS.FINANCES_VIEW, PERMISSIONS.FINANCES_EDIT, PERMISSIONS.FINANCES_APPROVE]
      },

      // Logistics data isolation
      {
        name: 'logistics_data_isolation',
        description: 'Logistics data access based on role and tour assignment',
        resourceType: 'logistics',
        condition: (context, tourId) => {
          return context.globalPermissions.includes(PERMISSIONS.LOGISTICS_VIEW) ||
                 context.tourSpecificPermissions[tourId]?.includes(PERMISSIONS.LOGISTICS_VIEW)
        },
        permissions: [PERMISSIONS.LOGISTICS_VIEW, PERMISSIONS.LOGISTICS_EDIT]
      }
    ]
  }

  // Get data isolation context for user
  public async getIsolationContext(userId: string): Promise<DataIsolationContext> {
    const cacheKey = `isolation_${userId}`
    
    if (this.policyCache.has(cacheKey)) {
      const cached = this.policyCache.get(cacheKey)!
      // Return cached context (simplified)
      return await rbacService.getDataIsolationContext(userId)
    }

    const context = await rbacService.getDataIsolationContext(userId)
    
    // Cache the context
    this.policyCache.set(cacheKey, []) // Simplified cache
    setTimeout(() => {
      this.policyCache.delete(cacheKey)
    }, this.cacheTimeout)

    return context
  }

  // Check if user can access specific resource
  public async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    requiredPermission: Permission
  ): Promise<boolean> {
    try {
      const context = await this.getIsolationContext(userId)
      const rule = this.isolationRules.find(r => r.resourceType === resourceType)
      
      if (!rule) {
        console.warn(`No isolation rule found for resource type: ${resourceType}`)
        return false
      }

      // Check if user has required permission
      const hasPermission = context.globalPermissions.includes(requiredPermission) ||
        Object.values(context.tourSpecificPermissions).some(permissions => 
          permissions.includes(requiredPermission)
        )

      if (!hasPermission) {
        console.log(`User ${userId} lacks permission ${requiredPermission} for ${resourceType}:${resourceId}`)
        return false
      }

      // Apply isolation rule
      const hasAccess = rule.condition(context, resourceId)
      
      if (!hasAccess) {
        console.log(`User ${userId} denied access to ${resourceType}:${resourceId} by isolation rule`)
      }

      return hasAccess
    } catch (error) {
      console.error('Error checking resource access:', error)
      return false
    }
  }

  // Get filtered tours for user
  public async getAccessibleTours(userId: string): Promise<Tour[]> {
    try {
      const context = await this.getIsolationContext(userId)
      
      // Build query with RLS (Row Level Security)
      let query = supabase
        .from('tours')
        .select('*')

      // If user doesn't have global access, filter by accessible tours
      if (!context.globalPermissions.includes(PERMISSIONS.TOURS_VIEW)) {
        if (context.accessibleTours.length === 0) {
          return []
        }
        query = query.in('id', context.accessibleTours)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching accessible tours:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getAccessibleTours:', error)
      return []
    }
  }

  // Get filtered events for user
  public async getAccessibleEvents(userId: string, tourId?: string): Promise<TourEvent[]> {
    try {
      if (tourId && !(await this.canAccessResource(userId, 'tour', tourId, PERMISSIONS.TOURS_VIEW))) {
        return []
      }

      const context = await this.getIsolationContext(userId)
      
      let query = supabase
        .from('tour_events')
        .select('*')

      // Filter by specific tour if provided
      if (tourId) {
        query = query.eq('tour_id', tourId)
      } else {
        // Filter by accessible tours
        if (!context.globalPermissions.includes(PERMISSIONS.EVENTS_VIEW)) {
          if (context.accessibleTours.length === 0) {
            return []
          }
          query = query.in('tour_id', context.accessibleTours)
        }
      }

      const { data, error } = await query.order('event_date', { ascending: true })

      if (error) {
        console.error('Error fetching accessible events:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getAccessibleEvents:', error)
      return []
    }
  }

  // Create data-filtered query builder
  public createFilteredQuery<T>(
    table: string,
    userId: string,
    resourceType: string,
    permission: Permission
  ) {
    return {
      async execute(): Promise<T[]> {
        const context = await rbacService.getDataIsolationContext(userId)
        
        let query = supabase.from(table).select('*')
        
        // Apply data isolation filters based on resource type and user context
        if (resourceType === 'tour') {
          if (!context.globalPermissions.includes(permission)) {
            query = query.in('id', context.accessibleTours)
          }
        } else if (resourceType === 'event') {
          if (!context.globalPermissions.includes(permission)) {
            query = query.in('tour_id', context.accessibleTours)
          }
        }
        
        const { data, error } = await query
        
        if (error) {
          throw error
        }
        
        return data || []
      }
    }
  }

  // Validate data modification permissions
  public async validateModification(
    userId: string,
    resourceType: string,
    resourceId: string,
    operation: 'create' | 'update' | 'delete'
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const context = await this.getIsolationContext(userId)
      
      // Map operations to permissions
      const permissionMap = {
        create: {
          tour: PERMISSIONS.TOURS_CREATE,
          event: PERMISSIONS.EVENTS_CREATE,
          staff: PERMISSIONS.STAFF_INVITE,
          financial: PERMISSIONS.FINANCES_EDIT,
          logistics: PERMISSIONS.LOGISTICS_EDIT
        },
        update: {
          tour: PERMISSIONS.TOURS_EDIT,
          event: PERMISSIONS.EVENTS_EDIT,
          staff: PERMISSIONS.STAFF_MANAGE,
          financial: PERMISSIONS.FINANCES_EDIT,
          logistics: PERMISSIONS.LOGISTICS_EDIT
        },
        delete: {
          tour: PERMISSIONS.TOURS_DELETE,
          event: PERMISSIONS.EVENTS_DELETE,
          staff: PERMISSIONS.STAFF_REMOVE,
          financial: PERMISSIONS.FINANCES_EDIT,
          logistics: PERMISSIONS.LOGISTICS_EDIT
        }
      }

      const requiredPermission = permissionMap[operation][resourceType as keyof typeof permissionMap[typeof operation]]
      
      if (!requiredPermission) {
        return { allowed: false, reason: `Unknown resource type: ${resourceType}` }
      }

      // Check if user has the required permission
      const hasPermission = await this.canAccessResource(userId, resourceType, resourceId, requiredPermission)
      
      if (!hasPermission) {
        return { 
          allowed: false, 
          reason: `Insufficient permissions for ${operation} on ${resourceType}` 
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Error validating modification:', error)
      return { allowed: false, reason: 'Validation error occurred' }
    }
  }

  // Audit access attempt
  public async auditAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('access_audit_log')
        .insert({
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
          action,
          success,
          metadata,
          timestamp: new Date().toISOString(),
          ip_address: metadata?.ip_address,
          user_agent: metadata?.user_agent
        })

      if (error) {
        console.error('Error logging access audit:', error)
      }
    } catch (error) {
      console.error('Error in auditAccess:', error)
    }
  }

  // Get user's data access summary
  public async getAccessSummary(userId: string): Promise<{
    totalTours: number
    accessibleTours: number
    totalEvents: number
    accessibleEvents: number
    permissions: Permission[]
    restrictions: string[]
  }> {
    try {
      const context = await this.getIsolationContext(userId)
      
      // Get total counts
      const [totalToursResult, totalEventsResult] = await Promise.all([
        supabase.from('tours').select('*', { count: 'exact', head: true }),
        supabase.from('tour_events').select('*', { count: 'exact', head: true })
      ])

      const accessibleTours = await this.getAccessibleTours(userId)
      const accessibleEvents = await this.getAccessibleEvents(userId)

      const restrictions = []
      if (!context.globalPermissions.includes(PERMISSIONS.TOURS_VIEW)) {
        restrictions.push('Limited to assigned tours only')
      }
      if (!context.globalPermissions.includes(PERMISSIONS.FINANCES_VIEW)) {
        restrictions.push('No access to financial data')
      }
      if (!context.globalPermissions.includes(PERMISSIONS.STAFF_MANAGE)) {
        restrictions.push('Cannot manage staff assignments')
      }

      return {
        totalTours: totalToursResult.count || 0,
        accessibleTours: accessibleTours.length,
        totalEvents: totalEventsResult.count || 0,
        accessibleEvents: accessibleEvents.length,
        permissions: [...context.globalPermissions, ...Object.values(context.tourSpecificPermissions).flat()],
        restrictions
      }
    } catch (error) {
      console.error('Error getting access summary:', error)
      return {
        totalTours: 0,
        accessibleTours: 0,
        totalEvents: 0,
        accessibleEvents: 0,
        permissions: [],
        restrictions: ['Error loading access information']
      }
    }
  }

  // Clear all caches
  public clearCache(): void {
    this.policyCache.clear()
  }

  // Add custom isolation rule
  public addIsolationRule(rule: IsolationRule): void {
    this.isolationRules.push(rule)
  }

  // Remove isolation rule
  public removeIsolationRule(ruleName: string): void {
    this.isolationRules = this.isolationRules.filter(rule => rule.name !== ruleName)
  }

  // Get all isolation rules
  public getIsolationRules(): IsolationRule[] {
    return [...this.isolationRules]
  }
}

// Export singleton instance
export const dataIsolationService = DataIsolationService.getInstance()

// Middleware function for API routes
export async function withDataIsolation<T>(
  userId: string,
  resourceType: string,
  resourceId: string,
  permission: Permission,
  handler: () => Promise<T>
): Promise<T> {
  const canAccess = await dataIsolationService.canAccessResource(
    userId,
    resourceType,
    resourceId,
    permission
  )

  if (!canAccess) {
    throw new Error(`Access denied to ${resourceType}:${resourceId}`)
  }

  // Audit the access
  await dataIsolationService.auditAccess(
    userId,
    resourceType,
    resourceId,
    'access',
    true
  )

  return handler()
}

// Decorator for data isolation
export function requireDataAccess(
  resourceType: string,
  permission: Permission,
  getResourceId?: (args: any[]) => string
) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const userId = args[0]?.userId || args[0]?.user?.id
      const resourceId = getResourceId ? getResourceId(args) : args[1]

      if (!userId) {
        throw new Error('User ID is required for data isolation')
      }

      if (!resourceId) {
        throw new Error('Resource ID is required for data isolation')
      }

      const canAccess = await dataIsolationService.canAccessResource(
        userId,
        resourceType,
        resourceId,
        permission
      )

      if (!canAccess) {
        await dataIsolationService.auditAccess(
          userId,
          resourceType,
          resourceId,
          propertyKey,
          false
        )
        throw new Error(`Access denied to ${resourceType}:${resourceId}`)
      }

      await dataIsolationService.auditAccess(
        userId,
        resourceType,
        resourceId,
        propertyKey,
        true
      )

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
} 