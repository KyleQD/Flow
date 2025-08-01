"use client"

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, createContext, useContext } from 'react'

// =============================================================================
// ROLE AND PERMISSION TYPES
// =============================================================================

export type UserRole = 
  | 'admin'
  | 'manager' 
  | 'tour_manager'
  | 'event_coordinator'
  | 'artist'
  | 'crew_member'
  | 'vendor'
  | 'venue_owner'
  | 'viewer'

export type Permission = 
  | 'tours.view'
  | 'tours.create'
  | 'tours.edit'
  | 'tours.delete'
  | 'events.view'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  | 'staff.view'
  | 'staff.manage'
  | 'communications.view'
  | 'communications.send'
  | 'communications.moderate'
  | 'communications.broadcast'
  | 'analytics.view'
  | 'settings.view'
  | 'settings.manage'
  | 'admin.all'

export interface UserProfile {
  id: string
  display_name: string | null
  role: UserRole
  email?: string
  avatar_url?: string
  department?: string
  permissions?: Permission[]
}

export interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  permissions: Permission[]
}

// =============================================================================
// ROLE PERMISSION MAPPING
// =============================================================================

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'admin.all',
    'tours.view', 'tours.create', 'tours.edit', 'tours.delete',
    'events.view', 'events.create', 'events.edit', 'events.delete',
    'staff.view', 'staff.manage',
    'communications.view', 'communications.send', 'communications.moderate', 'communications.broadcast',
    'analytics.view',
    'settings.view', 'settings.manage'
  ],
  
  manager: [
    'tours.view', 'tours.create', 'tours.edit',
    'events.view', 'events.create', 'events.edit',
    'staff.view', 'staff.manage',
    'communications.view', 'communications.send', 'communications.moderate',
    'analytics.view',
    'settings.view'
  ],
  
  tour_manager: [
    'tours.view', 'tours.edit',
    'events.view', 'events.create', 'events.edit',
    'staff.view', 'staff.manage',
    'communications.view', 'communications.send', 'communications.broadcast',
    'analytics.view'
  ],
  
  event_coordinator: [
    'tours.view',
    'events.view', 'events.create', 'events.edit',
    'staff.view',
    'communications.view', 'communications.send',
    'analytics.view'
  ],
  
  artist: [
    'tours.view',
    'events.view',
    'communications.view', 'communications.send'
  ],
  
  crew_member: [
    'tours.view',
    'events.view',
    'communications.view', 'communications.send'
  ],
  
  vendor: [
    'tours.view',
    'events.view',
    'communications.view', 'communications.send'
  ],
  
  venue_owner: [
    'events.view',
    'staff.view', 'staff.manage',
    'communications.view', 'communications.send',
    'analytics.view',
    'settings.view'
  ],
  
  viewer: [
    'tours.view',
    'events.view',
    'communications.view'
  ]
}

// =============================================================================
// AUTH CONTEXT
// =============================================================================

const AuthContext = createContext<AuthState & {
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasRole: (role: UserRole) => boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  permissions: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasRole: () => false,
  signOut: async () => {},
  refreshUser: async () => {}
})

// =============================================================================
// AUTH PROVIDER COMPONENT
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    permissions: []
  })

  const supabase = createClient()

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getUserPermissions = (role: UserRole): Permission[] => {
    return ROLE_PERMISSIONS[role] || []
  }

  const hasPermission = (permission: Permission): boolean => {
    if (authState.user?.role === 'admin') return true
    return authState.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (authState.user?.role === 'admin') return true
    return permissions.some(permission => authState.permissions.includes(permission))
  }

  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role
  }

  const refreshUser = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          permissions: []
        })
        return
      }

      // Get user profile with role information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, role, avatar_url')
        .eq('id', authUser.id)
        .single()

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          permissions: []
        })
        return
      }

      const userProfile: UserProfile = {
        id: profile.id,
        display_name: profile.display_name,
        role: profile.role as UserRole,
        email: authUser.email,
        avatar_url: profile.avatar_url
      }

      const permissions = getUserPermissions(userProfile.role)

      setAuthState({
        user: userProfile,
        isLoading: false,
        isAuthenticated: true,
        permissions
      })

    } catch (error) {
      console.error('Error refreshing user:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        permissions: []
      })
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        permissions: []
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    // Initial auth state check
    refreshUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser()
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            permissions: []
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue = {
    ...authState,
    hasPermission,
    hasAnyPermission,
    hasRole,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function usePermissions() {
  const { permissions, hasPermission, hasAnyPermission } = useAuth()
  return { permissions, hasPermission, hasAnyPermission }
}

export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, isLoading, redirectTo])

  return { isAuthenticated, isLoading }
}

export function useRequirePermission(permission: Permission, fallback?: React.ComponentType) {
  const { hasPermission, isLoading } = useAuth()
  
  if (isLoading) {
    return { hasAccess: false, isLoading: true }
  }
  
  return { hasAccess: hasPermission(permission), isLoading: false }
}

export function useRequireRole(role: UserRole) {
  const { hasRole, isLoading } = useAuth()
  
  if (isLoading) {
    return { hasAccess: false, isLoading: true }
  }
  
  return { hasAccess: hasRole(role), isLoading: false }
}

// =============================================================================
// HIGHER-ORDER COMPONENTS
// =============================================================================

interface WithAuthProps {
  fallback?: React.ComponentType
  redirectTo?: string
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    
    if (isLoading) {
      return options.fallback ? <options.fallback /> : <div>Loading...</div>
    }
    
    if (!isAuthenticated) {
      if (options.redirectTo) {
        window.location.href = options.redirectTo
        return null
      }
      return options.fallback ? <options.fallback /> : <div>Access denied</div>
    }
    
    return <Component {...props} />
  }
}

export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: React.ComponentType
) {
  return function PermissionGuardedComponent(props: P) {
    const { hasPermission, isLoading } = useAuth()
    
    if (isLoading) {
      return fallback ? <fallback /> : <div>Loading...</div>
    }
    
    if (!hasPermission(permission)) {
      return fallback ? <fallback /> : <div>Access denied</div>
    }
    
    return <Component {...props} />
  }
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  role: UserRole,
  fallback?: React.ComponentType
) {
  return function RoleGuardedComponent(props: P) {
    const { hasRole, isLoading } = useAuth()
    
    if (isLoading) {
      return fallback ? <fallback /> : <div>Loading...</div>
    }
    
    if (!hasRole(role)) {
      return fallback ? <fallback /> : <div>Access denied</div>
    }
    
    return <Component {...props} />
  }
}

// =============================================================================
// COMPONENT GUARDS
// =============================================================================

interface PermissionGuardProps {
  permission: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ permission, fallback, children }: PermissionGuardProps) {
  const { hasPermission, isLoading } = useAuth()
  
  if (isLoading) {
    return <>{fallback || <div>Loading...</div>}</>
  }
  
  if (!hasPermission(permission)) {
    return <>{fallback || <div>Access denied</div>}</>
  }
  
  return <>{children}</>
}

interface RoleGuardProps {
  role: UserRole | UserRole[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ role, fallback, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <>{fallback || <div>Loading...</div>}</>
  }
  
  const allowedRoles = Array.isArray(role) ? role : [role]
  const hasRequiredRole = user && allowedRoles.includes(user.role)
  
  if (!hasRequiredRole) {
    return <>{fallback || <div>Access denied</div>}</>
  }
  
  return <>{children}</>
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getUserDisplayName(user: UserProfile | null): string {
  if (!user) return 'Guest'
  return user.display_name || user.email || 'Unknown User'
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    tour_manager: 'Tour Manager',
    event_coordinator: 'Event Coordinator',
    artist: 'Artist',
    crew_member: 'Crew Member',
    vendor: 'Vendor',
    venue_owner: 'Venue Owner',
    viewer: 'Viewer'
  }
  
  return roleNames[role] || role
}

export function getPermissionDescription(permission: Permission): string {
  const descriptions: Record<Permission, string> = {
    'tours.view': 'View tours',
    'tours.create': 'Create new tours',
    'tours.edit': 'Edit existing tours',
    'tours.delete': 'Delete tours',
    'events.view': 'View events',
    'events.create': 'Create new events',
    'events.edit': 'Edit existing events',
    'events.delete': 'Delete events',
    'staff.view': 'View staff information',
    'staff.manage': 'Manage staff members',
    'communications.view': 'View messages and announcements',
    'communications.send': 'Send messages',
    'communications.moderate': 'Moderate communications',
    'communications.broadcast': 'Send broadcasts and announcements',
    'analytics.view': 'View analytics and reports',
    'settings.view': 'View settings',
    'settings.manage': 'Manage system settings',
    'admin.all': 'Full administrative access'
  }
  
  return descriptions[permission] || permission
}