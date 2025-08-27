import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Artists API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for artist_profiles table
    let query = supabase
      .from('artist_profiles')
      .select(`
        id,
        artist_name,
        bio,
        genres,
        social_links,
        verification_status,
        account_tier,
        settings,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('verification_status', status)
    }

    const { data: artists, error } = await query

    if (error) {
      console.error('[Admin Artists API] Database error:', error)
      return NextResponse.json({
        success: true,
        artists: [],
        pagination: {
          limit,
          offset,
          total: 0
        },
        timestamp: new Date().toISOString()
      })
    }

    // Transform data for frontend
    const transformedArtists = (artists ?? []).map((artist: any) => ({
      id: artist.id,
      name: artist.artist_name,
      bio: artist.bio,
      genres: artist.genres || [],
      socialLinks: artist.social_links || {},
      verificationStatus: artist.verification_status,
      accountTier: artist.account_tier,
      settings: artist.settings || {},
      createdAt: artist.created_at,
      updatedAt: artist.updated_at
    })) || []

    console.log('[Admin Artists API] Successfully fetched artists:', transformedArtists.length)

    return NextResponse.json({
      success: true,
      artists: transformedArtists,
      pagination: {
        limit,
        offset,
        total: transformedArtists.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Artists API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      artists: []
    }, { status: 500 })
  }
} 