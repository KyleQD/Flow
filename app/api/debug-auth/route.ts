import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Debug Auth API] Starting debug authentication test')
    
    const authResult = await authenticateApiRequest()
    
    if (!authResult) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        authenticated: false,
        user: null,
        hasAdminAccess: false
      }, { status: 401 })
    }

    const { user, supabase } = authResult
    console.log('[Debug Auth API] User authenticated:', user.id, user.email)

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    console.log('[Debug Auth API] Admin access check:', hasAdminAccess)

    // Check profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)

    if (profileError) {
      console.error('[Debug Auth API] Profile query error:', profileError)
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      hasAdminAccess,
      profiles: profiles || [],
      profileError: profileError?.message || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Debug Auth API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 