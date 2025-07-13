// Tour/Event Management RBAC Types

export interface TourManagementRole {
  id: string
  name: string
  display_name: string
  description: string | null
  is_system_role: boolean
  created_at: string
  updated_at: string
}

export interface TourManagementPermission {
  id: string
  name: string
  display_name: string
  description: string | null
  category: string
  created_at: string
}

export interface TourRolePermission {
  id: string
  role_id: string
  permission_id: string
  created_at: string
}

export interface UserTourRole {
  id: string
  user_id: string
  role_id: string
  tour_id: string | null
  assigned_by: string | null
  assigned_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Tour {
  id: string
  name: string
  description: string | null
  tour_manager_id: string | null
  artist_id: string | null
  start_date: string | null
  end_date: string | null
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
}

export interface TourEvent {
  id: string
  tour_id: string
  name: string
  description: string | null
  venue_name: string | null
  venue_address: string | null
  event_date: string
  event_time: string | null
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  created_by: string
  created_at: string
  updated_at: string
}

// Permission categories
export const PERMISSION_CATEGORIES = {
  TOUR_MANAGEMENT: 'tour_management',
  EVENT_MANAGEMENT: 'event_management',
  STAFF_MANAGEMENT: 'staff_management',
  FINANCIAL_MANAGEMENT: 'financial_management',
  LOGISTICS_MANAGEMENT: 'logistics_management',
  COMMUNICATIONS: 'communications',
  ANALYTICS: 'analytics',
  ADMINISTRATION: 'administration'
} as const

export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES]

// System roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  TOUR_MANAGER: 'tour_manager',
  ARTIST: 'artist',
  CREW_CHIEF: 'crew_chief',
  CREW_MEMBER: 'crew_member',
  VENDOR: 'vendor',
  VENUE_COORDINATOR: 'venue_coordinator',
  FINANCIAL_MANAGER: 'financial_manager'
} as const

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES]

// Permission names
export const PERMISSIONS = {
  // Tour Management
  TOURS_CREATE: 'tours.create',
  TOURS_VIEW: 'tours.view',
  TOURS_EDIT: 'tours.edit',
  TOURS_DELETE: 'tours.delete',
  TOURS_MANAGE_STAFF: 'tours.manage_staff',
  
  // Event Management
  EVENTS_CREATE: 'events.create',
  EVENTS_VIEW: 'events.view',
  EVENTS_EDIT: 'events.edit',
  EVENTS_DELETE: 'events.delete',
  EVENTS_MANAGE_LOGISTICS: 'events.manage_logistics',
  
  // Staff Management
  STAFF_VIEW: 'staff.view',
  STAFF_INVITE: 'staff.invite',
  STAFF_MANAGE: 'staff.manage',
  STAFF_REMOVE: 'staff.remove',
  
  // Financial Management
  FINANCES_VIEW: 'finances.view',
  FINANCES_EDIT: 'finances.edit',
  FINANCES_APPROVE: 'finances.approve',
  FINANCES_REPORTS: 'finances.reports',
  
  // Logistics Management
  LOGISTICS_VIEW: 'logistics.view',
  LOGISTICS_EDIT: 'logistics.edit',
  LOGISTICS_EQUIPMENT: 'logistics.equipment',
  LOGISTICS_TRANSPORT: 'logistics.transport',
  
  // Communications
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_SEND: 'communications.send',
  COMMUNICATIONS_BROADCAST: 'communications.broadcast',
  
  // Analytics & Reporting
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // System Administration
  ADMIN_USERS: 'admin.users',
  ADMIN_ROLES: 'admin.roles',
  ADMIN_SETTINGS: 'admin.settings'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-based permission sets
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SYSTEM_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [SYSTEM_ROLES.TOUR_MANAGER]: [
    PERMISSIONS.TOURS_CREATE,
    PERMISSIONS.TOURS_VIEW,
    PERMISSIONS.TOURS_EDIT,
    PERMISSIONS.TOURS_DELETE,
    PERMISSIONS.TOURS_MANAGE_STAFF,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_EDIT,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.EVENTS_MANAGE_LOGISTICS,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_INVITE,
    PERMISSIONS.STAFF_MANAGE,
    PERMISSIONS.STAFF_REMOVE,
    PERMISSIONS.FINANCES_VIEW,
    PERMISSIONS.FINANCES_EDIT,
    PERMISSIONS.FINANCES_APPROVE,
    PERMISSIONS.FINANCES_REPORTS,
    PERMISSIONS.LOGISTICS_VIEW,
    PERMISSIONS.LOGISTICS_EDIT,
    PERMISSIONS.LOGISTICS_EQUIPMENT,
    PERMISSIONS.LOGISTICS_TRANSPORT,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND,
    PERMISSIONS.COMMUNICATIONS_BROADCAST,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT
  ],
  
  [SYSTEM_ROLES.ARTIST]: [
    PERMISSIONS.TOURS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND
  ],
  
  [SYSTEM_ROLES.CREW_CHIEF]: [
    PERMISSIONS.TOURS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_MANAGE,
    PERMISSIONS.LOGISTICS_VIEW,
    PERMISSIONS.LOGISTICS_EDIT,
    PERMISSIONS.LOGISTICS_EQUIPMENT,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND
  ],
  
  [SYSTEM_ROLES.CREW_MEMBER]: [
    PERMISSIONS.TOURS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND
  ],
  
  [SYSTEM_ROLES.VENDOR]: [
    PERMISSIONS.TOURS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.FINANCES_VIEW,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND
  ],
  
  [SYSTEM_ROLES.VENUE_COORDINATOR]: [
    PERMISSIONS.TOURS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_EDIT,
    PERMISSIONS.EVENTS_MANAGE_LOGISTICS,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND
  ],
  
  [SYSTEM_ROLES.FINANCIAL_MANAGER]: [
    PERMISSIONS.TOURS_VIEW,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.FINANCES_VIEW,
    PERMISSIONS.FINANCES_EDIT,
    PERMISSIONS.FINANCES_APPROVE,
    PERMISSIONS.FINANCES_REPORTS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT
  ]
}

// User permission context
export interface UserPermissionContext {
  userId: string
  tourId?: string
  permissions: Permission[]
  roles: Array<{
    role: TourManagementRole
    tourId?: string
    isActive: boolean
  }>
}

// Permission check functions
export interface PermissionChecker {
  hasPermission: (permission: Permission, tourId?: string) => boolean
  hasAnyPermission: (permissions: Permission[], tourId?: string) => boolean
  hasAllPermissions: (permissions: Permission[], tourId?: string) => boolean
  hasRole: (role: SystemRole, tourId?: string) => boolean
  canAccessTour: (tourId: string) => boolean
}

// Data isolation context
export interface DataIsolationContext {
  userId: string
  accessibleTours: string[]
  globalPermissions: Permission[]
  tourSpecificPermissions: Record<string, Permission[]>
}

// Role assignment payload
export interface RoleAssignmentPayload {
  userId: string
  roleName: SystemRole
  tourId?: string
  assignedBy?: string
  expiresAt?: string
}

// Permission validation result
export interface PermissionValidationResult {
  isValid: boolean
  reason?: string
  requiredPermissions?: Permission[]
  missingPermissions?: Permission[]
}

// Tour access levels
export const TOUR_ACCESS_LEVELS = {
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
  MANAGE: 'manage',
  ADMIN: 'admin'
} as const

export type TourAccessLevel = typeof TOUR_ACCESS_LEVELS[keyof typeof TOUR_ACCESS_LEVELS]

// User tour access information
export interface UserTourAccess {
  tourId: string
  userId: string
  accessLevel: TourAccessLevel
  permissions: Permission[]
  roles: SystemRole[]
  isActive: boolean
  expiresAt?: string
} 