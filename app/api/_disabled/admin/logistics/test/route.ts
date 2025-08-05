import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Logistics Test API] GET request started')
    
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
    const type = searchParams.get('type') || 'all'

    // Return sample data for testing
    const sampleData = {
      transportation: [
        {
          id: '1',
          tour_id: null,
          event_id: 'event-1',
          type: 'bus',
          provider: 'Elite Transport Services',
          vehicle_details: { description: 'Luxury Coach Bus' },
          departure_location: 'International Airport',
          arrival_location: 'Luxury Hotel',
          departure_time: '2024-08-14T09:00:00Z',
          arrival_time: '2024-08-14T10:30:00Z',
          capacity: 50,
          assigned_staff: [],
          cost: 2500,
          status: 'booked',
          driver_info: { name: 'John Driver', phone: '(555) 123-4567' },
          notes: 'Artist pickup from airport',
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '2',
          tour_id: null,
          event_id: 'event-1',
          type: 'van',
          provider: 'Elite Transport Services',
          vehicle_details: { description: 'VIP Van' },
          departure_location: 'Luxury Hotel',
          arrival_location: 'Riverside Amphitheater',
          departure_time: '2024-08-15T14:00:00Z',
          arrival_time: '2024-08-15T14:30:00Z',
          capacity: 12,
          assigned_staff: [],
          cost: 800,
          status: 'scheduled',
          driver_info: { name: 'Sarah Driver', phone: '(555) 234-5678' },
          notes: 'Artist transport to venue',
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        }
      ],
      equipment: [
        {
          id: '1',
          name: 'Main PA System',
          category: 'Sound',
          description: 'Professional sound system for main stage',
          serial_number: 'PA-001',
          purchase_date: '2023-01-15',
          purchase_price: 15000,
          current_value: 12000,
          condition: 'excellent',
          location: 'Warehouse A',
          assigned_to: null,
          maintenance_schedule: { frequency: 'monthly' },
          last_maintenance: '2024-01-15',
          next_maintenance: '2024-02-15',
          warranty_expiry: '2026-01-15',
          is_available: true,
          metadata: {},
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '2',
          name: 'Stage Lighting Kit',
          category: 'Lighting',
          description: 'Complete LED lighting setup',
          serial_number: 'LED-002',
          purchase_date: '2023-03-20',
          purchase_price: 8000,
          current_value: 6500,
          condition: 'good',
          location: 'Warehouse B',
          assigned_to: null,
          maintenance_schedule: { frequency: 'quarterly' },
          last_maintenance: '2024-01-01',
          next_maintenance: '2024-04-01',
          warranty_expiry: '2025-03-20',
          is_available: true,
          metadata: {},
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '3',
          name: 'Wireless Microphones',
          category: 'Sound',
          description: 'Set of 12 wireless microphones',
          serial_number: 'WM-003',
          purchase_date: '2023-06-10',
          purchase_price: 3000,
          current_value: 2500,
          condition: 'good',
          location: 'Warehouse A',
          assigned_to: null,
          maintenance_schedule: { frequency: 'monthly' },
          last_maintenance: '2024-01-20',
          next_maintenance: '2024-02-20',
          warranty_expiry: '2025-06-10',
          is_available: false,
          metadata: {},
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '4',
          name: 'Fender Stratocaster',
          category: 'backline',
          description: 'Electric guitar for stage performance',
          serial_number: 'FS-004',
          purchase_date: '2022-08-15',
          purchase_price: 1200,
          current_value: 1000,
          condition: 'excellent',
          location: 'Backline Storage',
          assigned_to: null,
          maintenance_schedule: { frequency: 'as_needed' },
          last_maintenance: '2024-01-10',
          next_maintenance: '2024-07-10',
          warranty_expiry: '2025-08-15',
          is_available: true,
          metadata: { rental_rate: 75 },
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '5',
          name: 'Roland TD-17KV Drum Kit',
          category: 'backline',
          description: 'Electronic drum kit with mesh heads',
          serial_number: 'RD-005',
          purchase_date: '2023-02-10',
          purchase_price: 2500,
          current_value: 2200,
          condition: 'good',
          location: 'Backline Storage',
          assigned_to: null,
          maintenance_schedule: { frequency: 'monthly' },
          last_maintenance: '2024-01-05',
          next_maintenance: '2024-02-05',
          warranty_expiry: '2026-02-10',
          is_available: true,
          metadata: { rental_rate: 120 },
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '6',
          name: 'Yamaha CP88 Stage Piano',
          category: 'backline',
          description: 'Professional stage piano with weighted keys',
          serial_number: 'YP-006',
          purchase_date: '2023-05-20',
          purchase_price: 3500,
          current_value: 3200,
          condition: 'excellent',
          location: 'Backline Storage',
          assigned_to: null,
          maintenance_schedule: { frequency: 'quarterly' },
          last_maintenance: '2024-01-15',
          next_maintenance: '2024-04-15',
          warranty_expiry: '2026-05-20',
          is_available: true,
          metadata: { rental_rate: 95 },
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        },
        {
          id: '7',
          name: 'Shure SM58 Microphone',
          category: 'backline',
          description: 'Professional vocal microphone',
          serial_number: 'SM-007',
          purchase_date: '2022-11-30',
          purchase_price: 150,
          current_value: 120,
          condition: 'good',
          location: 'Backline Storage',
          assigned_to: null,
          maintenance_schedule: { frequency: 'as_needed' },
          last_maintenance: '2024-01-01',
          next_maintenance: '2024-07-01',
          warranty_expiry: '2025-11-30',
          is_available: false,
          metadata: { rental_rate: 25 },
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        }
      ],
      assignments: [
        {
          id: '1',
          equipment_id: '3',
          event_id: 'event-1',
          tour_id: null,
          assigned_date: '2024-08-13T08:00:00Z',
          return_date: '2024-08-17T18:00:00Z',
          status: 'assigned',
          condition_out: 'good',
          condition_in: null,
          notes: 'Assigned for Summer Music Festival',
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z'
        }
      ],
      analytics: {
        transportCostsByType: {
          bus: 2500,
          van: 800
        },
        equipmentByCategory: {
          Sound: { total: 2, available: 1, value: 14500 },
          Lighting: { total: 1, available: 1, value: 6500 }
        },
        equipmentCondition: {
          excellent: 1,
          good: 2
        },
        totalTransportCost: 3300,
        totalEquipmentValue: 21000,
        recentAssignments: 1
      }
    }

    if (type === 'transportation') {
      return NextResponse.json({ 
        transportation: sampleData.transportation, 
        total: sampleData.transportation.length 
      })
    } else if (type === 'equipment') {
      return NextResponse.json({ 
        equipment: sampleData.equipment, 
        total: sampleData.equipment.length 
      })
    } else if (type === 'assignments') {
      return NextResponse.json({ 
        assignments: sampleData.assignments, 
        total: sampleData.assignments.length 
      })
    } else if (type === 'analytics') {
      return NextResponse.json({ 
        analytics: sampleData.analytics 
      })
    } else {
      return NextResponse.json(sampleData)
    }

  } catch (error) {
    console.error('[Admin Logistics Test API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 