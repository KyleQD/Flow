import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateZoneRequest, UpdateZoneRequest } from '@/types/site-map'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { id: siteMapId } = await params

    const { data, error } = await supabase
      .from('site_map_zones')
      .select(`
        *,
        tents:glamping_tents(*)
      `)
      .eq('site_map_id', siteMapId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('[Site Map Zones API] GET Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch zones' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { id: siteMapId } = await params
    const body: CreateZoneRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.zoneType) {
      return NextResponse.json({ error: 'Name and zone type are required' }, { status: 400 })
    }

    // Check if user can edit this site map
    const canEdit = await supabase.rpc('can_edit_site_map', { 
      site_map_uuid: siteMapId, 
      user_uuid: user.id 
    })

    if (!canEdit.data) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const payload = {
      site_map_id: siteMapId,
      name: body.name,
      zone_type: body.zoneType,
      x: body.x,
      y: body.y,
      width: body.width,
      height: body.height,
      rotation: body.rotation || 0,
      color: body.color || '#3b82f6',
      border_color: body.borderColor || '#1e40af',
      border_width: body.borderWidth || 2,
      opacity: body.opacity || 1.0,
      capacity: body.capacity || null,
      power_available: body.powerAvailable || false,
      water_available: body.waterAvailable || false,
      internet_available: body.internetAvailable || false,
      description: body.description || null,
      notes: body.notes || null,
      tags: body.tags || []
    }

    const { data, error } = await supabase
      .from('site_map_zones')
      .insert(payload)
      .select(`
        *,
        tents:glamping_tents(*)
      `)
      .single()

    if (error) throw error

    // Log activity
    await supabase
      .from('site_map_activity_log')
      .insert({
        site_map_id: siteMapId,
        user_id: user.id,
        action: 'CREATE',
        entity_type: 'zone',
        entity_id: data.id,
        new_values: { name: data.name, zone_type: data.zone_type }
      })

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Zone created successfully'
    })
  } catch (error) {
    console.error('[Site Map Zones API] POST Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create zone' 
    }, { status: 500 })
  }
}
