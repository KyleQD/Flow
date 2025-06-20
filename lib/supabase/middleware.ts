import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '../database.types'

// Helper function to manually parse the auth session from cookies
function parseAuthFromCookies(request: NextRequest) {
  try {
    const cookies = request.cookies.getAll()
    
    console.log('[Middleware] All cookies:', cookies.map(c => `${c.name}: ${c.value.length} chars`))
    
    // Look for the new cookie name that matches our client configuration
    const authCookie = cookies.find(cookie => 
      cookie.name === 'sb-tourify-auth-token'
    )
    
    if (!authCookie) {
      console.log('[Middleware] No sb-tourify-auth-token cookie found')
      
      // Fallback to old patterns for existing users
      const fallbackCookie = cookies.find(cookie => 
        (cookie.name.includes('sb-') && 
         cookie.name.includes('auth-token') && 
         !cookie.name.includes('code-verifier') &&
         !cookie.name.includes('refresh') &&
         cookie.value.length > 100) ||
        (cookie.name.startsWith('sb-') && 
         cookie.name.includes('auqddrodjezjlypkzfpi') &&
         !cookie.name.includes('code-verifier') &&
         cookie.value.length > 100)
      )
      
      if (fallbackCookie) {
        console.log('[Middleware] Found fallback auth cookie:', fallbackCookie.name)
        return tryParseCookieValue(fallbackCookie.value)
      }
      
      return null
    }
    
    console.log('[Middleware] Found main auth cookie:', authCookie.name, 'length:', authCookie.value.length)
    
    return tryParseCookieValue(authCookie.value)
  } catch (error) {
    console.log('[Middleware] Error parsing auth from cookies:', error)
    return null
  }
}

function tryParseCookieValue(cookieValue: string) {
  try {
    // Try to parse the session data
    const sessionData = JSON.parse(decodeURIComponent(cookieValue))
    
    if (sessionData && sessionData.access_token && sessionData.user) {
      console.log('[Middleware] Successfully parsed session from cookie')
      console.log('[Middleware] User from cookie:', sessionData.user.id)
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000)
      if (sessionData.expires_at && sessionData.expires_at > now) {
        return sessionData.user
      } else {
        console.log('[Middleware] Token expired')
        return null
      }
    } else {
      console.log('[Middleware] Cookie data missing required fields')
      return null
    }
  } catch (parseError) {
    console.log('[Middleware] Failed to parse session data:', parseError)
    
    // Try parsing without URL decoding
    try {
      const sessionData2 = JSON.parse(cookieValue)
      if (sessionData2 && sessionData2.access_token && sessionData2.user) {
        console.log('[Middleware] Successfully parsed session without URL decoding')
        return sessionData2.user
      }
    } catch (parseError2) {
      console.log('[Middleware] Failed to parse even without URL decoding')
    }
    
    return null
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value)
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          request.cookies.set(name, '')
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set(name, '', options)
        },
      },
    }
  )

  try {
    // Debug: Log the path being accessed
    console.log(`[Middleware] Checking auth for path: ${request.nextUrl.pathname}`)
    
    // Log cookies for debugging
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') ||
      cookie.name.includes('tourify-auth')
    )
    console.log(`[Middleware] Found ${authCookies.length} auth-related cookies:`, authCookies.map(c => c.name))
    
    // First try the standard Supabase method
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log(`[Middleware] Supabase auth error:`, userError.message)
    }

    console.log(`[Middleware] Supabase method - User exists: ${!!user}`)
    
    // If Supabase method fails, try manual cookie parsing
    let finalUser = user
    if (!user) {
      console.log(`[Middleware] Supabase method failed, trying manual cookie parsing...`)
      finalUser = parseAuthFromCookies(request)
    }
    
    console.log(`[Middleware] Final result - User exists: ${!!finalUser}`)
    console.log(`[Middleware] User ID: ${finalUser?.id || 'none'}`)

    return { supabaseResponse, user: finalUser }
  } catch (error) {
    console.error('[Middleware] Error in updateSession:', error)
    
    // Fallback to manual cookie parsing
    console.log('[Middleware] Exception occurred, trying manual fallback...')
    const fallbackUser = parseAuthFromCookies(request)
    return { supabaseResponse, user: fallbackUser }
  }
} 