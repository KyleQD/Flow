import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasEntityPermission } from '@/lib/services/rbac'
import type { CreateMapLayerRequest } from '@/types/site-map'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteMapId = searchParams.get('siteMapId')

    if (!siteMapId) {
      return NextResponse.json({ error: 'Site map ID is required' }, { status: 400 })
    }

    // Check permissions
    const hasPermission = await hasEntityPermission({
      userId: user.id,
      entityType: 'site_map',
      entityId: siteMapId,
      permission: 'read'
    })
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: layers, error } = await supabase
      .from('map_layers')
      .select('*')
      .eq('site_map_id', siteMapId)
      .order('z_index', { ascending: true })

    if (error) {
      console.error('Error fetching layers:', error)
      return NextResponse.json({ error: 'Failed to fetch layers' }, { status: 500 })
    }

    return NextResponse.json(layers)
  } catch (error) {
    console.error('Error in layers GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateMapLayerRequest = await request.json()
    const { siteMapId, name, description, layerType, color, opacity, zIndex } = body

    if (!siteMapId || !name || !layerType) {
      return NextResponse.json({ 
        error: 'Site map ID, name, and layer type are required' 
      }, { status: 400 })
    }

    // Check permissions
    const hasPermission = await hasEntityPermission({
      userId: user.id,
      entityType: 'site_map',
      entityId: siteMapId,
      permission: 'write'
    })
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: layer, error } = await supabase
      .from('map_layers')
      .insert({
        site_map_id: siteMapId,
        name,
        description,
        layer_type: layerType,
        color: color || '#3b82f6',
        opacity: opacity || 1.0,
        z_index: zIndex || 0,
        is_visible: true,
        is_locked: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating layer:', error)
      return NextResponse.json({ error: 'Failed to create layer' }, { status: 500 })
    }

    return NextResponse.json(layer, { status: 201 })
  } catch (error) {
    console.error('Error in layers POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
