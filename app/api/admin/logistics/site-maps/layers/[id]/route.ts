import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasEntityPermission } from '@/lib/services/rbac'
import type { UpdateMapLayerRequest } from '@/types/site-map'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: layer, error } = await supabase
      .from('map_layers')
      .select(`
        *,
        site_maps!inner(id, created_by)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching layer:', error)
      return NextResponse.json({ error: 'Layer not found' }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await hasEntityPermission({
      userId: user.id,
      entityType: 'site_map',
      entityId: layer.site_maps.id,
      permission: 'read'
    })
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(layer)
  } catch (error) {
    console.error('Error in layer GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body: UpdateMapLayerRequest = await request.json()
    const { name, description, color, opacity, isVisible, isLocked, zIndex } = body

    // First get the layer to check permissions
    const { data: existingLayer, error: fetchError } = await supabase
      .from('map_layers')
      .select(`
        *,
        site_maps!inner(id, created_by)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existingLayer) {
      return NextResponse.json({ error: 'Layer not found' }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await hasEntityPermission({
      userId: user.id,
      entityType: 'site_map',
      entityId: existingLayer.site_maps.id,
      permission: 'write'
    })
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build update object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (color !== undefined) updates.color = color
    if (opacity !== undefined) updates.opacity = opacity
    if (isVisible !== undefined) updates.is_visible = isVisible
    if (isLocked !== undefined) updates.is_locked = isLocked
    if (zIndex !== undefined) updates.z_index = zIndex

    const { data: layer, error } = await supabase
      .from('map_layers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating layer:', error)
      return NextResponse.json({ error: 'Failed to update layer' }, { status: 500 })
    }

    return NextResponse.json(layer)
  } catch (error) {
    console.error('Error in layer PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // First get the layer to check permissions
    const { data: existingLayer, error: fetchError } = await supabase
      .from('map_layers')
      .select(`
        *,
        site_maps!inner(id, created_by)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existingLayer) {
      return NextResponse.json({ error: 'Layer not found' }, { status: 404 })
    }

    // Check permissions
    const hasPermission = await hasEntityPermission({
      userId: user.id,
      entityType: 'site_map',
      entityId: existingLayer.site_maps.id,
      permission: 'write'
    })
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('map_layers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting layer:', error)
      return NextResponse.json({ error: 'Failed to delete layer' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in layer DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
