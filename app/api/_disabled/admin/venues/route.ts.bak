import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Venues API] GET request started')
    
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

    // Build query for venue_profiles table
    let query = supabase
      .from('venue_profiles')
      .select(`
        id,
        venue_name,
        description,
        address,
        city,
        state,
        country,
        capacity,
        venue_types,
        contact_info,
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

    const { data: venues, error } = await query

    if (error) {
      console.error('[Admin Venues API] Database error:', error)
      return NextResponse.json({
        success: true,
        venues: [],
        pagination: {
          limit,
          offset,
          total: 0
        },
        timestamp: new Date().toISOString()
      })
    }

    // Transform data for frontend
    const transformedVenues = (venues || []).map((venue: any) => ({
      id: venue.id,
      name: venue.venue_name,
      description: venue.description,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      country: venue.country,
      capacity: venue.capacity,
      venueTypes: venue.venue_types || [],
      contactInfo: venue.contact_info || {},
      socialLinks: venue.social_links || {},
      verificationStatus: venue.verification_status,
      accountTier: venue.account_tier,
      settings: venue.settings || {},
      createdAt: venue.created_at,
      updatedAt: venue.updated_at
    })) || []

    console.log('[Admin Venues API] Successfully fetched venues:', transformedVenues.length)

    return NextResponse.json({
      success: true,
      venues: transformedVenues,
      pagination: {
        limit,
        offset,
        total: transformedVenues.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Venues API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      venues: []
    }, { status: 500 })
  }
} 