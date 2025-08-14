import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest(request)
    if (!authResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { user, supabase } = authResult
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('query') || '').trim()
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Search profiles by email or display_name
    let dbQuery = supabase
      .from('profiles')
      .select('id, email, display_name')
      .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit)

    const { data, error } = await dbQuery
    if (error) {
      // Gracefully degrade if profiles doesn't exist
      if (error.code === '42P01') return NextResponse.json({ users: [] })
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    return NextResponse.json({ users: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/api-auth'

export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50)

    if (!query) return NextResponse.json({ users: [] })

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('full_name', { ascending: true })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ users: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to search users' }, { status: 500 })
  }
})


