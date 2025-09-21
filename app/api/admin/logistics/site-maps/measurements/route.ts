import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasEntityPermission } from '@/lib/services/rbac'
import type { CreateMeasurementRequest } from '@/types/site-map'

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

    const { data: measurements, error } = await supabase
      .from('map_measurements')
      .select('*')
      .eq('site_map_id', siteMapId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching measurements:', error)
      return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 })
    }

    return NextResponse.json(measurements)
  } catch (error) {
    console.error('Error in measurements GET:', error)
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

    const body: CreateMeasurementRequest = await request.json()
    const { 
      siteMapId, 
      measurementType, 
      startX, 
      startY, 
      endX, 
      endY, 
      width, 
      height, 
      value, 
      unit, 
      label, 
      color, 
      complianceNotes 
    } = body

    if (!siteMapId || !measurementType || startX === undefined || startY === undefined) {
      return NextResponse.json({ 
        error: 'Site map ID, measurement type, and start coordinates are required' 
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

    const { data: measurement, error } = await supabase
      .from('map_measurements')
      .insert({
        site_map_id: siteMapId,
        measurement_type: measurementType,
        start_x: startX,
        start_y: startY,
        end_x: endX,
        end_y: endY,
        width,
        height,
        value,
        unit: unit || 'meters',
        label,
        color: color || '#ff6b6b',
        compliance_notes: complianceNotes,
        is_compliant: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating measurement:', error)
      return NextResponse.json({ error: 'Failed to create measurement' }, { status: 500 })
    }

    return NextResponse.json(measurement, { status: 201 })
  } catch (error) {
    console.error('Error in measurements POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
