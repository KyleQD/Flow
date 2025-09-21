import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SiteMapImport } from '@/types/site-map'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { importData, eventId, tourId }: { importData: SiteMapImport; eventId?: string; tourId?: string } = body

    if (!importData || !importData.siteMap) {
      return NextResponse.json({ error: 'Invalid import data' }, { status: 400 })
    }

    // Check permissions for event/tour
    if (eventId) {
      const hasPermission = await supabase.rpc('has_entity_permission', {
        user_id: user.id,
        entity_type: 'Event',
        entity_id: eventId,
        permission: 'EDIT_EVENT_LOGISTICS'
      })
      if (!hasPermission) {
        return NextResponse.json({ error: 'Insufficient permissions for event' }, { status: 403 })
      }
    }

    if (tourId) {
      const hasPermission = await supabase.rpc('has_entity_permission', {
        user_id: user.id,
        entity_type: 'Tour',
        entity_id: tourId,
        permission: 'EDIT_TOUR_LOGISTICS'
      })
      if (!hasPermission) {
        return NextResponse.json({ error: 'Insufficient permissions for tour' }, { status: 403 })
      }
    }

    // Create the site map
    const siteMapPayload = {
      event_id: eventId || null,
      tour_id: tourId || null,
      name: importData.siteMap.name || 'Imported Site Map',
      description: importData.siteMap.description || null,
      width: importData.siteMap.width || 1000,
      height: importData.siteMap.height || 1000,
      scale: importData.siteMap.scale || 1.0,
      background_image_url: importData.siteMap.backgroundImageUrl || null,
      background_color: importData.siteMap.backgroundColor || '#f8f9fa',
      grid_enabled: importData.siteMap.gridEnabled ?? true,
      grid_size: importData.siteMap.gridSize || 20,
      is_public: false, // Always import as private
      created_by: user.id
    }

    const { data: newSiteMap, error: siteMapError } = await supabase
      .from('site_maps')
      .insert(siteMapPayload)
      .select('id')
      .single()

    if (siteMapError) throw siteMapError

    const siteMapId = newSiteMap.id

    // Import zones
    if (importData.zones && importData.zones.length > 0) {
      const zonesPayload = importData.zones.map(zone => ({
        site_map_id: siteMapId,
        name: zone.name || 'Imported Zone',
        zone_type: zone.zoneType || 'other',
        x: zone.x || 0,
        y: zone.y || 0,
        width: zone.width || 100,
        height: zone.height || 100,
        rotation: zone.rotation || 0,
        color: zone.color || '#3b82f6',
        border_color: zone.borderColor || '#1e40af',
        border_width: zone.borderWidth || 2,
        opacity: zone.opacity || 1.0,
        capacity: zone.capacity || null,
        current_occupancy: zone.currentOccupancy || 0,
        power_available: zone.powerAvailable || false,
        water_available: zone.waterAvailable || false,
        internet_available: zone.internetAvailable || false,
        description: zone.description || null,
        notes: zone.notes || null,
        tags: zone.tags || [],
        status: zone.status || 'available'
      }))

      const { error: zonesError } = await supabase
        .from('site_map_zones')
        .insert(zonesPayload)

      if (zonesError) {
        console.error('Error importing zones:', zonesError)
        // Continue with import even if zones fail
      }
    }

    // Import tents
    if (importData.tents && importData.tents.length > 0) {
      const tentsPayload = importData.tents.map(tent => ({
        site_map_id: siteMapId,
        zone_id: tent.zoneId || null,
        tent_number: tent.tentNumber || 'T-' + Date.now(),
        tent_type: tent.tentType || 'bell_tent',
        capacity: tent.capacity || 4,
        size_category: tent.sizeCategory || '4T',
        x: tent.x || 0,
        y: tent.y || 0,
        width: tent.width || 100,
        height: tent.height || 100,
        rotation: tent.rotation || 0,
        status: tent.status || 'available',
        guest_name: tent.guestName || null,
        guest_phone: tent.guestPhone || null,
        guest_email: tent.guestEmail || null,
        check_in_date: tent.checkInDate || null,
        check_out_date: tent.checkOutDate || null,
        has_power: tent.hasPower || false,
        has_heating: tent.hasHeating || false,
        has_cooling: tent.hasCooling || false,
        has_private_bathroom: tent.hasPrivateBathroom || false,
        has_wifi: tent.hasWifi || false,
        base_price: tent.basePrice || null,
        current_price: tent.currentPrice || null,
        maintenance_notes: tent.maintenanceNotes || null,
        special_requirements: tent.specialRequirements || null
      }))

      const { error: tentsError } = await supabase
        .from('glamping_tents')
        .insert(tentsPayload)

      if (tentsError) {
        console.error('Error importing tents:', tentsError)
        // Continue with import even if tents fail
      }
    }

    // Import elements
    if (importData.elements && importData.elements.length > 0) {
      const elementsPayload = importData.elements.map(element => ({
        site_map_id: siteMapId,
        name: element.name || null,
        element_type: element.elementType || 'custom',
        x: element.x || 0,
        y: element.y || 0,
        width: element.width || 0,
        height: element.height || 0,
        rotation: element.rotation || 0,
        color: element.color || '#000000',
        stroke_color: element.strokeColor || null,
        stroke_width: element.strokeWidth || 1,
        opacity: element.opacity || 1.0,
        path_data: element.pathData || null,
        shape_data: element.shapeData || null,
        properties: element.properties || {}
      }))

      const { error: elementsError } = await supabase
        .from('site_map_elements')
        .insert(elementsPayload)

      if (elementsError) {
        console.error('Error importing elements:', elementsError)
        // Continue with import even if elements fail
      }
    }

    // Log import activity
    await supabase
      .from('site_map_activity_log')
      .insert({
        site_map_id: siteMapId,
        user_id: user.id,
        action: 'IMPORT',
        entity_type: 'site_map',
        entity_id: siteMapId,
        new_values: { 
          importedAt: new Date().toISOString(),
          zonesCount: importData.zones?.length || 0,
          tentsCount: importData.tents?.length || 0,
          elementsCount: importData.elements?.length || 0
        }
      })

    // Fetch the complete imported site map
    const { data: completeSiteMap, error: fetchError } = await supabase.rpc('get_site_map_with_data', {
      site_map_uuid: siteMapId
    })

    if (fetchError) {
      console.error('Error fetching imported site map:', fetchError)
    }

    return NextResponse.json({ 
      success: true, 
      data: completeSiteMap || { site_map: newSiteMap },
      message: 'Site map imported successfully'
    })
  } catch (error) {
    console.error('[Site Map Import API] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to import site map' 
    }, { status: 500 })
  }
}
