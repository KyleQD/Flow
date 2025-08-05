import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Tours API] GET request started')
    
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

    // Build query with correct column names
    let query = supabase
      .from('tours')
      .select(`
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        total_shows,
        completed_shows,
        budget,
        expenses,
        revenue,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: tours, error } = await query

    if (error) {
      console.error('[Admin Tours API] Database error:', error)
      // Return empty data instead of error for missing tables
      return NextResponse.json({
        success: true,
        tours: [],
        pagination: {
          limit,
          offset,
          total: 0
        },
        timestamp: new Date().toISOString()
      })
    }

    // Transform data for frontend
    const transformedTours = tours?.map(tour => ({
      id: tour.id,
      name: tour.name,
      description: tour.description,
      status: tour.status,
      startDate: tour.start_date,
      endDate: tour.end_date,
      totalShows: tour.total_shows,
      completedShows: tour.completed_shows,
      budget: tour.budget,
      expenses: tour.expenses,
      revenue: tour.revenue,
      createdAt: tour.created_at,
      updatedAt: tour.updated_at,
      venues: [],
      artists: []
    })) || []

    console.log('[Admin Tours API] Successfully fetched tours:', transformedTours.length)

    return NextResponse.json({
      success: true,
      tours: transformedTours,
      pagination: {
        limit,
        offset,
        total: transformedTours.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Tours API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      tours: []
    }, { status: 500 })
  }
} 