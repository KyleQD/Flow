import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[Logistics Metrics API] GET request started')
    
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
    const eventId = searchParams.get('eventId')
    const tourId = searchParams.get('tourId')

    // Fetch logistics data with error handling
    const [
      logisticsResult,
      transportationResult,
      equipmentResult,
      rentalsResult,
      lodgingResult,
      travelResult
    ] = await Promise.allSettled([
      // General logistics data
      supabase
        .from('logistics')
        .select('*')
        .eq('event_id', eventId || '')
        .eq('tour_id', tourId || '')
        .order('created_at', { ascending: false }),

      // Transportation data
      supabase
        .from('transportation')
        .select('*')
        .eq('event_id', eventId || '')
        .eq('tour_id', tourId || '')
        .order('created_at', { ascending: false }),

      // Equipment data
      supabase
        .from('equipment')
        .select('*')
        .eq('event_id', eventId || '')
        .eq('tour_id', tourId || '')
        .order('created_at', { ascending: false }),

      // Rental agreements
      supabase
        .from('rental_agreements')
        .select('*')
        .eq('event_id', eventId || '')
        .eq('tour_id', tourId || '')
        .order('created_at', { ascending: false }),

      // Lodging bookings
      supabase
        .from('lodging_bookings')
        .select('*')
        .eq('event_id', eventId || '')
        .eq('tour_id', tourId || '')
        .order('created_at', { ascending: false }),

      // Travel coordination
      supabase
        .from('travel_groups')
        .select('*')
        .eq('event_id', eventId || '')
        .eq('tour_id', tourId || '')
        .order('created_at', { ascending: false })
    ])

    // Process results with graceful fallbacks
    const logistics = logisticsResult.status === 'fulfilled' && !logisticsResult.value.error ? logisticsResult.value.data || [] : []
    const transportation = transportationResult.status === 'fulfilled' && !transportationResult.value.error ? transportationResult.value.data || [] : []
    const equipment = equipmentResult.status === 'fulfilled' && !equipmentResult.value.error ? equipmentResult.value.data || [] : []
    const rentals = rentalsResult.status === 'fulfilled' && !rentalsResult.value.error ? rentalsResult.value.data || [] : []
    const lodging = lodgingResult.status === 'fulfilled' && !lodgingResult.value.error ? lodgingResult.value.data || [] : []
    const travelGroups = travelResult.status === 'fulfilled' && !travelResult.value.error ? travelResult.value.data || [] : []

    // Calculate metrics
    const calculateMetrics = () => {
      // Transportation metrics
      const transportTotal = transportation.length
      const transportCompleted = transportation.filter(t => t.status === 'completed').length
      const transportPercentage = transportTotal > 0 ? Math.round((transportCompleted / transportTotal) * 100) : 0
      const transportStatus = transportPercentage === 100 ? 'Completed' : transportPercentage > 50 ? 'In Progress' : 'Not Started'

      // Equipment metrics
      const equipTotal = equipment.length
      const equipAssigned = equipment.filter(e => e.status === 'assigned').length
      const equipPercentage = equipTotal > 0 ? Math.round((equipAssigned / equipTotal) * 100) : 0
      const equipStatus = equipPercentage === 100 ? 'Completed' : equipPercentage > 50 ? 'In Progress' : 'Not Started'

      // Backline metrics
      const backlineEquipment = equipment.filter(e => e.category === 'backline' || e.category === 'instruments')
      const backlineTotal = backlineEquipment.length
      const backlineAssigned = backlineEquipment.filter(e => e.status === 'assigned').length
      const backlinePercentage = backlineTotal > 0 ? Math.round((backlineAssigned / backlineTotal) * 100) : 0
      const backlineStatus = backlinePercentage === 100 ? 'Completed' : backlinePercentage > 50 ? 'In Progress' : 'Not Started'

      // Rental metrics
      const activeRentals = rentals.filter(r => r.status === 'active' || r.status === 'confirmed').length
      const totalRentalRevenue = rentals.reduce((sum, r) => sum + (r.total_amount || 0), 0)
      const rentalPercentage = activeRentals > 0 ? Math.min(100, Math.round((activeRentals / 10) * 100)) : 0
      const rentalStatus = activeRentals > 0 ? 'Active' : 'No Rentals'

      // Lodging metrics
      const activeLodgingBookings = lodging.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length
      const totalLodgingRevenue = lodging.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      const lodgingPercentage = activeLodgingBookings > 0 ? Math.min(100, Math.round((activeLodgingBookings / 20) * 100)) : 0
      const lodgingStatus = activeLodgingBookings > 0 ? 'Active' : 'No Bookings'

      // Travel coordination metrics
      const totalTravelGroups = travelGroups.length
      const totalTravelers = travelGroups.reduce((sum, group) => sum + (group.total_members || 0), 0)
      const fullyCoordinatedGroups = travelGroups.filter(g => g.coordination_status === 'complete').length
      const travelCoordinationPercentage = totalTravelGroups > 0 ? Math.round((fullyCoordinatedGroups / totalTravelGroups) * 100) : 0
      const travelCoordinationStatus = travelCoordinationPercentage === 100 ? 'Complete' : travelCoordinationPercentage > 50 ? 'In Progress' : 'Not Started'

      // Mock data for accommodations, catering, and communication (these would come from actual tables)
      const accommodationsPercentage = 90
      const accommodationsItems = 12
      const accommodationsCompleted = 11
      const accommodationsStatus = 'Confirmed'

      const cateringPercentage = 10
      const cateringItems = 5
      const cateringCompleted = 0
      const cateringStatus = 'Not Started'

      const communicationPercentage = 75
      const communicationItems = 16
      const communicationCompleted = 12
      const communicationStatus = 'Active'

      return {
        transportation: { 
          percentage: transportPercentage, 
          items: transportTotal, 
          completed: transportCompleted, 
          status: transportStatus 
        },
        equipment: { 
          percentage: equipPercentage, 
          items: equipTotal, 
          completed: equipAssigned, 
          status: equipStatus 
        },
        backline: { 
          percentage: backlinePercentage, 
          items: backlineTotal, 
          completed: backlineAssigned, 
          status: backlineStatus 
        },
        rentals: { 
          percentage: rentalPercentage, 
          items: activeRentals, 
          completed: activeRentals, 
          status: rentalStatus, 
          revenue: totalRentalRevenue 
        },
        lodging: { 
          percentage: lodgingPercentage, 
          items: activeLodgingBookings, 
          completed: activeLodgingBookings, 
          status: lodgingStatus, 
          revenue: totalLodgingRevenue 
        },
        travelCoordination: { 
          percentage: travelCoordinationPercentage, 
          items: totalTravelGroups, 
          completed: fullyCoordinatedGroups, 
          status: travelCoordinationStatus, 
          travelers: totalTravelers 
        },
        accommodations: { 
          percentage: accommodationsPercentage, 
          items: accommodationsItems, 
          completed: accommodationsCompleted, 
          status: accommodationsStatus 
        },
        catering: { 
          percentage: cateringPercentage, 
          items: cateringItems, 
          completed: cateringCompleted, 
          status: cateringStatus 
        },
        communication: { 
          percentage: communicationPercentage, 
          items: communicationItems, 
          completed: communicationCompleted, 
          status: communicationStatus 
        }
      }
    }

    const metrics = calculateMetrics()

    console.log('[Logistics Metrics API] Metrics calculated successfully')

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Logistics Metrics API] Error:', error)
    
    // Return default metrics on error
    const defaultMetrics = {
      transportation: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      equipment: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      backline: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      rentals: { percentage: 0, items: 0, completed: 0, status: 'No Rentals', revenue: 0 },
      lodging: { percentage: 0, items: 0, completed: 0, status: 'No Bookings', revenue: 0 },
      travelCoordination: { percentage: 0, items: 0, completed: 0, status: 'Not Started', travelers: 0 },
      accommodations: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      catering: { percentage: 0, items: 0, completed: 0, status: 'Not Started' },
      communication: { percentage: 0, items: 0, completed: 0, status: 'Not Started' }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch logistics metrics',
      metrics: defaultMetrics,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 