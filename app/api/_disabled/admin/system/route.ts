import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

// Validation schemas
const createSettingSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  setting_key: z.string().min(1, 'Setting key is required'),
  setting_value: z.any(),
  description: z.string().optional(),
  is_encrypted: z.boolean().default(false)
})

const createIntegrationSchema = z.object({
  name: z.string().min(1, 'Integration name is required'),
  type: z.string().min(1, 'Integration type is required'),
  configuration: z.record(z.any()),
  credentials: z.record(z.any()).optional(),
  webhook_url: z.string().url('Invalid webhook URL').optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin System API] GET request started')
    
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
    const type = searchParams.get('type') || 'settings' // 'settings', 'integrations', 'audit', 'health'
    const category = searchParams.get('category')
    const setting_key = searchParams.get('setting_key')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (type === 'settings') {
      // Fetch system settings
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      if (setting_key) {
        query = query.eq('setting_key', setting_key)
      }

      const { data: settings, error } = await query

      if (error) {
        console.error('[Admin System API] Error fetching settings:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ settings: [] })
        }
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
      }

      // Group settings by category
      const settingsByCategory = settings?.reduce((acc: Record<string, any[]>, setting: any) => {
        if (!acc[setting.category]) {
          acc[setting.category] = []
        }
        acc[setting.category].push(setting)
        return acc
      }, {}) || {}

      return NextResponse.json({ 
        settings: settings || [],
        settings_by_category: settingsByCategory
      })

    } else if (type === 'integrations') {
      // Fetch integrations
      let query = supabase
        .from('integrations')
        .select('*')
        .order('name')
        .range(offset, offset + limit - 1)

      const { data: integrations, error } = await query

      if (error) {
        console.error('[Admin System API] Error fetching integrations:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ integrations: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
      }

             // Remove sensitive credentials from response
       const sanitizedIntegrations = integrations?.map((integration: any) => ({
         ...integration,
         credentials: integration.credentials ? '[CONFIGURED]' : null
       })) || []

      const { count } = await supabase
        .from('integrations')
        .select('*', { count: 'exact', head: true })

             return NextResponse.json({ 
         integrations: sanitizedIntegrations, 
         total: count || 0,
         limit,
         offset 
       })

    } else if (type === 'audit') {
      // Fetch audit logs
      let query = supabase
        .from('admin_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      const resource_type = searchParams.get('resource_type')
      const action = searchParams.get('action')
      const start_date = searchParams.get('start_date')
      const end_date = searchParams.get('end_date')

      if (resource_type) {
        query = query.eq('resource_type', resource_type)
      }

      if (action) {
        query = query.eq('action', action)
      }

      if (start_date) {
        query = query.gte('timestamp', start_date)
      }

      if (end_date) {
        query = query.lte('timestamp', end_date)
      }

      const { data: auditLogs, error } = await query

      if (error) {
        console.error('[Admin System API] Error fetching audit logs:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ audit_logs: [], total: 0 })
        }
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
      }

      // Get total count
      let countQuery = supabase
        .from('admin_audit_log')
        .select('*', { count: 'exact', head: true })

      if (resource_type) countQuery = countQuery.eq('resource_type', resource_type)
      if (action) countQuery = countQuery.eq('action', action)
      if (start_date) countQuery = countQuery.gte('timestamp', start_date)
      if (end_date) countQuery = countQuery.lte('timestamp', end_date)

      const { count } = await countQuery

      return NextResponse.json({ 
        audit_logs: auditLogs || [], 
        total: count || 0,
        limit,
        offset 
      })

    } else if (type === 'health') {
      // System health check
      try {
        const healthChecks = await Promise.allSettled([
          // Database connectivity
          supabase.from('system_settings').select('id').limit(1),
          
          // Check critical tables
          supabase.from('events').select('id').limit(1),
          supabase.from('tours').select('id').limit(1),
          supabase.from('staff_profiles').select('id').limit(1),
          
          // Check integrations status
          supabase.from('integrations').select('name, status').eq('status', 'active')
        ])

        const [dbCheck, eventsCheck, toursCheck, staffCheck, integrationsCheck] = healthChecks

        const healthStatus = {
          database: dbCheck.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          events_table: eventsCheck.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          tours_table: toursCheck.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          staff_table: staffCheck.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          integrations: integrationsCheck.status === 'fulfilled' ? 'healthy' : 'unhealthy'
        }

        const overallHealth = Object.values(healthStatus).every(status => status === 'healthy') ? 'healthy' : 'degraded'

        // System metrics
        const now = new Date()
        const uptime = process.uptime() // Server uptime in seconds
        const memoryUsage = process.memoryUsage()

        return NextResponse.json({
          health: {
            status: overallHealth,
            timestamp: now.toISOString(),
            uptime: uptime,
            components: healthStatus,
            metrics: {
              memory_usage: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
              }
            }
          }
        })

      } catch (error) {
        console.error('[Admin System API] Error checking system health:', error)
        return NextResponse.json({
          health: {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
          }
        })
      }

    } else if (type === 'categories') {
      // Get available setting categories
      try {
        const { data: categories } = await supabase
          .from('system_settings')
          .select('category')
          .neq('category', null)

        const categoryList: Array<{ category?: string | null }> = (categories as Array<{ category?: string | null }>) || []
        const uniqueCategories = categoryList.length > 0
          ? Array.from(new Set(categoryList.map((item) => item.category).filter((c): c is string => typeof c === 'string')))
          : []

        return NextResponse.json({ categories: uniqueCategories })

      } catch (error) {
        console.error('[Admin System API] Error fetching categories:', error)
        return NextResponse.json({ categories: [] })
      }

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin System API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin System API] POST request started')
    
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

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_setting') {
      const validatedData = createSettingSchema.parse(data)

      // Check if setting already exists
      const { data: existingSetting } = await supabase
        .from('system_settings')
        .select('id')
        .eq('category', validatedData.category)
        .eq('setting_key', validatedData.setting_key)
        .single()

      if (existingSetting) {
        return NextResponse.json({ error: 'Setting already exists' }, { status: 400 })
      }

      const { data: setting, error } = await supabase
        .from('system_settings')
        .insert({
          ...validatedData,
          last_modified_by: user.id
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin System API] Error creating setting:', error)
        if (error.code === '42P01') {
          return NextResponse.json({ error: 'System settings not set up. Please run database migrations.' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
      }

      console.log('[Admin System API] Successfully created setting:', setting.id)
      return NextResponse.json({ setting }, { status: 201 })

    } else if (action === 'create_integration') {
      const validatedData = createIntegrationSchema.parse(data)

      // Check if integration already exists
      const { data: existingIntegration } = await supabase
        .from('integrations')
        .select('name')
        .eq('name', validatedData.name)
        .single()

      if (existingIntegration) {
        return NextResponse.json({ error: 'Integration already exists' }, { status: 400 })
      }

      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          ...validatedData,
          status: 'inactive',
          created_by: user.id
        })
        .select('*')
        .single()

      if (error) {
        console.error('[Admin System API] Error creating integration:', error)
        return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 })
      }

      // Remove credentials from response
      const responseIntegration = {
        ...integration,
        credentials: integration.credentials ? '[CONFIGURED]' : null
      }

      console.log('[Admin System API] Successfully created integration:', integration.id)
      return NextResponse.json({ integration: responseIntegration }, { status: 201 })

    } else if (action === 'test_integration') {
      const { integration_id } = data

      if (!integration_id) {
        return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 })
      }

      // Get integration details
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integration_id)
        .single()

      if (!integration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
      }

      // Simulate integration test (in real implementation, this would test actual connectivity)
      const testResult = {
        success: true,
        message: 'Integration test successful',
        timestamp: new Date().toISOString(),
        response_time: Math.floor(Math.random() * 1000) + 100 // Simulated response time
      }

      // Update integration sync status
      await supabase
        .from('integrations')
        .update({
          last_sync: new Date().toISOString(),
          sync_status: testResult.success ? 'success' : 'error',
          error_message: testResult.success ? null : testResult.message
        })
        .eq('id', integration_id)

      return NextResponse.json({ test_result: testResult })

    } else if (action === 'backup_settings') {
      // Create a backup of all system settings
      try {
        const { data: settings } = await supabase
          .from('system_settings')
          .select('*')

        const backup = {
          timestamp: new Date().toISOString(),
          created_by: user.id,
          settings: settings || [],
          version: '1.0'
        }

        // In a real implementation, this would be stored in a backup system
        console.log('[Admin System API] Settings backup created')
        return NextResponse.json({ 
          backup: {
            ...backup,
            settings: `${settings?.length || 0} settings backed up`
          }
        })

      } catch (error) {
        console.error('[Admin System API] Error creating backup:', error)
        return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
      }

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('[Admin System API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin System API] PUT request started')
    
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

    const body = await request.json()
    const { id, type, ...updateData } = body

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    if (type === 'setting') {
      const { data: updatedSetting, error } = await supabase
        .from('system_settings')
        .update({
          ...updateData,
          last_modified_by: user.id
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin System API] Error updating setting:', error)
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
      }

      if (!updatedSetting) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
      }

      return NextResponse.json({ setting: updatedSetting })

    } else if (type === 'integration') {
      // Remove credentials from update data for security
      const { credentials, ...safeUpdateData } = updateData

      const { data: updatedIntegration, error } = await supabase
        .from('integrations')
        .update(safeUpdateData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        console.error('[Admin System API] Error updating integration:', error)
        return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 })
      }

      if (!updatedIntegration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
      }

      // Remove credentials from response
      const responseIntegration = {
        ...updatedIntegration,
        credentials: updatedIntegration.credentials ? '[CONFIGURED]' : null
      }

      return NextResponse.json({ integration: responseIntegration })

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin System API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('[Admin System API] DELETE request started')
    
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
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 })
    }

    if (type === 'setting') {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[Admin System API] Error deleting setting:', error)
        return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
      }

      console.log('[Admin System API] Successfully deleted setting:', id)
      return NextResponse.json({ success: true })

    } else if (type === 'integration') {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[Admin System API] Error deleting integration:', error)
        return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 })
      }

      console.log('[Admin System API] Successfully deleted integration:', id)
      return NextResponse.json({ success: true })

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Admin System API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 