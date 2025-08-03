import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface AuthSession {
  access_token: string
  user: {
    id: string
    email: string
    [key: string]: any
  }
  expires_at: number
  [key: string]: any
}

// Helper function to manually parse the auth session from request cookies (same logic as middleware)
function parseAuthFromRequestCookies(request: NextRequest): any | null {
  try {
    const cookies = request.headers.get('cookie') || ''
    const cookieArray = cookies.split(';').map(c => c.trim())
    
    console.log('[API Auth] All cookies:', cookieArray.map(c => {
      const [name] = c.split('=')
      return `${name}: ${c.split('=')[1]?.length || 0} chars`
    }))
    
    // Look for the auth cookie that matches our client configuration
    const authCookie = cookieArray.find(cookie => 
      cookie.startsWith('sb-tourify-auth-token=')
    )
    
    if (!authCookie) {
      console.log('[API Auth] No sb-tourify-auth-token cookie found')
      
      // Fallback to old patterns for existing users
      const fallbackCookie = cookieArray.find(cookie => 
        (cookie.includes('sb-') && 
         cookie.includes('auth-token') && 
         !cookie.includes('code-verifier') &&
         !cookie.includes('refresh') &&
         cookie.split('=')[1]?.length > 100) ||
        (cookie.startsWith('sb-') && 
         cookie.includes('auqddrodjezjlypkzfpi') &&
         !cookie.includes('code-verifier') &&
         cookie.split('=')[1]?.length > 100)
      )
      
      if (fallbackCookie) {
        const cookieValue = fallbackCookie.split('=')[1]
        console.log('[API Auth] Found fallback auth cookie, length:', cookieValue?.length)
        return tryParseCookieValue(cookieValue)
      }
      
      return null
    }
    
    const cookieValue = authCookie.split('=')[1]
    console.log('[API Auth] Found main auth cookie: sb-tourify-auth-token length:', cookieValue?.length)
    
    return tryParseCookieValue(cookieValue)
  } catch (error) {
    console.log('[API Auth] Error parsing auth from request cookies:', error)
    return null
  }
}

function tryParseCookieValue(cookieValue: string): any | null {
  if (!cookieValue) {
    console.log('[API Auth] No cookie value to parse')
    return null
  }
  
  try {
    // Try to parse the session data
    const sessionData: AuthSession = JSON.parse(decodeURIComponent(cookieValue))
    
    if (sessionData && sessionData.access_token && sessionData.user) {
      console.log('[API Auth] Successfully parsed session from cookie')
      console.log('[API Auth] User from cookie:', sessionData.user.id)
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000)
      if (sessionData.expires_at && sessionData.expires_at > now) {
        return sessionData.user
      } else {
        console.log('[API Auth] Token expired')
        return null
      }
    } else {
      console.log('[API Auth] Cookie data missing required fields')
      return null
    }
  } catch (parseError) {
    console.log('[API Auth] Failed to parse session data:', parseError)
    
    // Try parsing without URL decoding
    try {
      const sessionData2: AuthSession = JSON.parse(cookieValue)
      if (sessionData2 && sessionData2.access_token && sessionData2.user) {
        console.log('[API Auth] Successfully parsed session without URL decoding')
        return sessionData2.user
      }
    } catch (parseError2) {
      console.log('[API Auth] Failed to parse even without URL decoding')
    }
    
    return null
  }
}

/**
 * Create a service role Supabase client for API operations
 */
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Authenticate API request and return user + Supabase client
 * This matches the middleware authentication logic exactly
 */
export async function authenticateApiRequest(request?: NextRequest): Promise<{ user: any; supabase: any } | null> {
  try {
    console.log('[API Auth] Starting authentication process')
    
    if (!request) {
      console.log('[API Auth] No request object provided')
      return null
    }
    
    // Use the same manual cookie parsing that works in middleware
    const user = parseAuthFromRequestCookies(request)
    
    if (!user) {
      console.log('[API Auth] No authenticated user found')
      return null
    }
    
    console.log('[API Auth] ✅ User authenticated:', {
      id: user.id,
      email: user.email
    })
    
    // Create service role client for database operations
    const supabase = createServiceClient()
    
    return { user, supabase }
  } catch (error) {
    console.error('[API Auth] 💥 Authentication error:', error)
    return null
  }
}

/**
 * Check if user has organizer permissions based on email across all profiles
 * In this context, "admin" means organizer accounts that can manage events and tours
 * TEMPORARILY DISABLED - allowing all authenticated users access
 */
export async function checkAdminPermissions(user: any): Promise<boolean> {
  if (!user?.email) {
    console.log('[API Auth] No user email for permission check')
    return false
  }
  
  try {
    const supabase = createServiceClient()
    
    // For now, just return true for any authenticated user
    // We'll keep the account type identification but without restrictions
    console.log('[API Auth] Allowing access for authenticated user:', user.email)
    
    // Optional: Still try to fetch profile info for identification (but don't block on failure)
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('id, role, display_name')
        .eq('id', user.id)
        .single()
      
      if (userProfile) {
        console.log('[API Auth] User profile found:', {
          id: userProfile.id,
          role: userProfile.role || 'user',
          display_name: userProfile.display_name
        })
      } else {
        console.log('[API Auth] No profile found, but allowing access anyway')
      }
    } catch (profileError) {
      console.log('[API Auth] Profile lookup failed, but allowing access anyway:', profileError)
    }
    
    // Always return true for authenticated users (no restrictions for now)
    return true
  } catch (error) {
    console.error('[API Auth] Error in checkAdminPermissions (allowing access anyway):', error)
    // Even if there's an error, allow access for authenticated users
    return true
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 * Usage: export const POST = withAuth(async (request, { user, supabase }) => { ... })
 */
export function withAuth(
  handler: (
    request: NextRequest, 
    auth: { user: any; supabase: any }
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    const authResult = await authenticateApiRequest(request)
    
    // If authentication failed, return error response
    if (!authResult) {
      console.log('[API Auth] Authentication failed, returning 401')
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'Authentication required'
      }, { status: 401 })
    }
    
    // Call the handler with authenticated user and supabase client
    return handler(request, authResult)
  }
}

/**
 * Check if request has valid authentication without throwing errors
 */
export async function checkAuth(request: NextRequest): Promise<{ user: any; supabase: any } | null> {
  try {
    return await authenticateApiRequest(request)
  } catch (error) {
    console.error('[API Auth] Auth check failed:', error)
    return null
  }
}

// Alias for backward compatibility
export { authenticateApiRequest as parseAuthFromCookies } 