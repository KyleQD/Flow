import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Notifications API] GET request started')
    
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
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        content,
        is_read,
        priority,
        created_at,
        updated_at,
        user_id,
        related_user_id,
        metadata
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('[Admin Notifications API] Database error:', error)
      // Return empty data instead of error for missing tables
      return NextResponse.json({
        success: true,
        notifications: [],
        pagination: {
          limit,
          offset,
          total: 0
        },
        timestamp: new Date().toISOString()
      })
    }

    // Transform data for frontend
    const transformedNotifications = notifications?.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      isRead: notification.is_read,
      priority: notification.priority,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at,
      userId: notification.user_id,
      relatedUserId: notification.related_user_id,
      metadata: notification.metadata || {}
    })) || []

    console.log('[Admin Notifications API] Successfully fetched notifications:', transformedNotifications.length)

    return NextResponse.json({
      success: true,
      notifications: transformedNotifications,
      pagination: {
        limit,
        offset,
        total: transformedNotifications.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Admin Notifications API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      notifications: []
    }, { status: 500 })
  }
} 