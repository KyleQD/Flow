import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { useMultiAccount } from '@/hooks/use-multi-account'

export interface AdminUser {
  id: string
  email: string
  isAdmin: boolean
  adminLevel?: 'super' | 'moderator' | 'support'
  role?: string
  profileType?: string
}

/**
 * Check if current account context is admin (for multi-account users)
 */
export function useAdminAccess() {
  const { currentAccount } = useMultiAccount()
  
  // If user is in admin account context, they have admin access
  if (currentAccount?.account_type === 'admin') {
    return {
      isAdmin: true,
      adminUser: {
        id: currentAccount.profile_id,
        email: currentAccount.profile_data?.email || '',
        isAdmin: true,
        adminLevel: 'super' as const,
        role: 'admin',
        profileType: 'admin'
      },
      loading: false,
      error: null
    }
  }

  return {
    isAdmin: false,
    adminUser: null,
    loading: false,
    error: null
  }
}

/**
 * Check if the current user has admin access through multi-account system or organizer data
 * This is the main function that determines admin access
 */
export async function checkIsAdmin(): Promise<AdminUser | null> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.log('[Admin Auth] No valid session found')
      return null
    }

    const user = session.user

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_admin, admin_level, role, profile_type, account_settings, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('[Admin Auth] No profile found or error:', profileError)
      return null
    }

    console.log('[Admin Auth] Checking admin access for user:', user.id)
    console.log('[Admin Auth] Profile role:', profile.role)
    console.log('[Admin Auth] Has organizer data:', !!profile.account_settings?.organizer_data)

    // Method 1: Check if user has organizer data (new organizer account system)
    const organizerData = profile.account_settings?.organizer_data
    if (organizerData && organizerData.organization_name) {
      console.log('[Admin Auth] ✅ Found organizer account data - granting admin access')
      return {
        id: user.id,
        email: user.email || '',
        isAdmin: true,
        adminLevel: 'super',
        role: 'admin',
        profileType: 'organizer'
      }
    }

    // Method 2: Check if user has admin role directly
    if (profile.role === 'admin') {
      console.log('[Admin Auth] ✅ Found admin role - granting admin access')
      return {
        id: user.id,
        email: user.email || '',
        isAdmin: true,
        adminLevel: profile.admin_level || 'super',
        role: profile.role,
        profileType: profile.profile_type || 'admin'
      }
    }

    // Method 3: Check if user has admin account relationship
    try {
      const { data: adminRelationship, error: relError } = await supabase
        .from('account_relationships')
        .select('*')
        .eq('owner_user_id', user.id)
        .eq('account_type', 'admin')
        .single()

      if (adminRelationship && !relError) {
        console.log('[Admin Auth] ✅ Found admin account relationship - granting admin access')
        return {
          id: user.id,
          email: user.email || '',
          isAdmin: true,
          adminLevel: 'super',
          role: 'admin',
          profileType: 'admin'
        }
      }
    } catch (relError) {
      console.log('[Admin Auth] Account relationships check failed (table may not exist)')
    }

    // Method 4: Fallback to direct profile check for backwards compatibility
    if (profile.is_admin) {
      console.log('[Admin Auth] ✅ Found is_admin flag - granting admin access')
      return {
        id: user.id,
        email: user.email || '',
        isAdmin: true,
        adminLevel: profile.admin_level || 'super',
        role: profile.role || 'admin',
        profileType: profile.profile_type || 'admin'
      }
    }

    console.log('[Admin Auth] ❌ User does not have admin access')
    return null
  } catch (error) {
    console.error('[Admin Auth] Error checking admin status:', error)
    return null
  }
}

/**
 * Check if user has specific admin level or higher
 */
export function hasAdminLevel(user: AdminUser, requiredLevel: 'support' | 'moderator' | 'super'): boolean {
  if (!user.isAdmin) return false

  const levels = ['support', 'moderator', 'super']
  const userLevelIndex = levels.indexOf(user.adminLevel || 'support')
  const requiredLevelIndex = levels.indexOf(requiredLevel)

  return userLevelIndex >= requiredLevelIndex
}

/**
 * Server-side admin check using service role
 */
export async function checkIsAdminServer(userId: string): Promise<AdminUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get user profile to check for organizer data first
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, is_admin, admin_level, role, profile_type, account_settings')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.log('[Admin Auth Server] No profile found or error:', profileError)
      return null
    }

    // Check for organizer data first
    const organizerData = profile.account_settings?.organizer_data
    if (organizerData && organizerData.organization_name) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      return {
        id: userId,
        email: userData.user?.email || '',
        isAdmin: true,
        adminLevel: 'super',
        role: 'admin',
        profileType: 'organizer'
      }
    }

    // Check if user has admin role or is_admin flag
    if (profile.is_admin || profile.role === 'admin') {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      return {
        id: userId,
        email: userData.user?.email || '',
        isAdmin: true,
        adminLevel: profile.admin_level || 'super',
        role: profile.role || 'admin',
        profileType: profile.profile_type || 'admin'
      }
    }

    // Check for admin account relationship
    try {
      const { data: adminRel, error: relError } = await supabaseAdmin
        .from('account_relationships')
        .select('*')
        .eq('owner_user_id', userId)
        .eq('account_type', 'admin')
        .single()

      if (adminRel && !relError) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
        return {
          id: userId,
          email: userData.user?.email || '',
          isAdmin: true,
          adminLevel: 'super',
          role: 'admin',
          profileType: 'admin'
        }
      }
    } catch (relError) {
      // Continue to final check
    }

    return null
  } catch (error) {
    console.error('[Admin Auth Server] Error checking admin status:', error)
    return null
  }
}

/**
 * Hook for admin authentication in React components
 * TEMPORARILY DISABLED - Allowing all authenticated users access
 * Now works with multi-account system and organizer accounts
 */
export function useAdminAuth() {
  const [adminUser, setAdminUser] = React.useState<AdminUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Check if we're in a multi-account context
  const multiAccountAccess = useAdminAccess()

  React.useEffect(() => {
    async function checkAdmin() {
      try {
        setLoading(true)
        setError(null)

        console.log('[Admin Auth Hook] Checking admin access...')

        // Get current session to see if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          console.log('[Admin Auth Hook] ❌ No authenticated user found')
          setAdminUser(null)
          return
        }

        // TEMPORARILY ALLOW ALL AUTHENTICATED USERS
        console.log('[Admin Auth Hook] ✅ Authenticated user found - granting access (restrictions disabled)')
        
        // Create a default admin user for any authenticated user
        const defaultAdminUser: AdminUser = {
          id: session.user.id,
          email: session.user.email || '',
          isAdmin: true, // Always true for authenticated users now
          adminLevel: 'super',
          role: 'organizer', // Default to organizer since that's what admin means in this context
          profileType: 'organizer'
        }

        // First check multi-account context
        if (multiAccountAccess.isAdmin && multiAccountAccess.adminUser) {
          console.log('[Admin Auth Hook] ✅ Multi-account admin access granted')
          setAdminUser(multiAccountAccess.adminUser)
          return
        }

        // Try to get actual admin info, but don't block if it fails
        try {
          const admin = await checkIsAdmin()
          if (admin) {
            console.log('[Admin Auth Hook] ✅ Admin access granted:', admin.profileType)
            setAdminUser(admin)
          } else {
            console.log('[Admin Auth Hook] ✅ No admin profile found, but granting default access anyway')
            setAdminUser(defaultAdminUser)
          }
        } catch (adminCheckError) {
          console.log('[Admin Auth Hook] ✅ Admin check failed, but granting default access anyway:', adminCheckError)
          setAdminUser(defaultAdminUser)
        }
      } catch (err) {
        console.error('[Admin Auth Hook] Error:', err)
        // Even if there's an error, try to allow access for authenticated users
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            console.log('[Admin Auth Hook] ✅ Fallback: granting access despite error')
            setAdminUser({
              id: session.user.id,
              email: session.user.email || '',
              isAdmin: true,
              adminLevel: 'super',
              role: 'organizer',
              profileType: 'organizer'
            })
          } else {
            setError(err instanceof Error ? err.message : 'Failed to check admin status')
          }
        } catch (fallbackError) {
          setError(err instanceof Error ? err.message : 'Failed to check admin status')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Admin Auth Hook] Auth state changed:', event)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdmin()
      } else if (event === 'SIGNED_OUT') {
        setAdminUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [multiAccountAccess.isAdmin, multiAccountAccess.adminUser])

  const finalAdminUser = multiAccountAccess.adminUser || adminUser
  const finalIsAdmin = multiAccountAccess.isAdmin || !!adminUser

  console.log('[Admin Auth Hook] Final result - Is Admin:', finalIsAdmin, 'User type:', finalAdminUser?.profileType)

  return { 
    adminUser: finalAdminUser, 
    loading: multiAccountAccess.loading || loading, 
    error: multiAccountAccess.error || error, 
    isAdmin: finalIsAdmin
  }
}

// Note: We need to import React for the hook
import React from 'react' 