import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  type: z.string().min(1, 'Vendor type is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional(),
  status: z.enum(['confirmed', 'pending', 'declined']).default('pending'),
  arrival_time: z.string().optional(),
  departure_time: z.string().optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),
  event_id: z.string().uuid('Invalid event ID')
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Vendors API] GET request for event vendors:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Vendors API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Vendors API] User lacks admin permissions for viewing vendors')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the user has access to this event (through tour ownership)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        tours (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('[Vendors API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Vendors API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch vendors for this event
    const { data: vendors, error: vendorsError } = await supabase
      .from('event_vendors')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (vendorsError) {
      console.error('[Vendors API] Error fetching vendors:', vendorsError)
      // Return empty array if table doesn't exist
      if (vendorsError.code === '42P01') {
        console.log('[Vendors API] Event vendors table does not exist, returning empty array')
        return NextResponse.json({ 
          success: true, 
          vendors: [],
          message: 'No vendors found' 
        })
      }
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
    }

    console.log('[Vendors API] Successfully fetched vendors:', vendors?.length || 0)

    return NextResponse.json({ 
      success: true, 
      vendors: vendors || [],
      message: 'Vendors fetched successfully' 
    })

  } catch (error) {
    console.error('[Vendors API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Vendors API] POST request for event vendors:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Vendors API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Vendors API] User lacks admin permissions for creating vendors')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createVendorSchema.parse(body)

    // Verify the user has access to this event (through tour ownership)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        tours (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('[Vendors API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Vendors API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the vendor
    const vendorData = {
      ...validatedData,
      event_id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: vendor, error: vendorError } = await supabase
      .from('event_vendors')
      .insert(vendorData)
      .select('*')
      .single()

    if (vendorError) {
      console.error('[Vendors API] Error creating vendor:', vendorError)
      return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
    }

    console.log('[Vendors API] Successfully created vendor:', vendor.id)

    return NextResponse.json({ 
      success: true, 
      vendor,
      message: 'Vendor created successfully' 
    })

  } catch (error) {
    console.error('[Vendors API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 