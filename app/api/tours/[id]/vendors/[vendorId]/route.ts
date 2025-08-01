import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const updateVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').optional(),
  type: z.string().min(1, 'Vendor type is required').optional(),
  contact_name: z.string().min(1, 'Contact name is required').optional(),
  contact_email: z.string().email('Invalid email address').optional(),
  contact_phone: z.string().optional(),
  status: z.enum(['confirmed', 'pending', 'declined']).optional(),
  services: z.array(z.string()).optional(),
  contract_amount: z.number().min(0).optional(),
  payment_status: z.enum(['paid', 'partial', 'pending']).optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  try {
    const { id, vendorId } = await params
    console.log('[Tour Vendor API] GET request for vendor:', vendorId)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour Vendor API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tour Vendor API] User lacks admin permissions for viewing vendor')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the user owns this tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tourError) {
      console.error('[Tour Vendor API] Error fetching tour for ownership check:', tourError)
      if (tourError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) {
      console.log('[Tour Vendor API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch the specific vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('tour_vendors')
      .select('*')
      .eq('id', vendorId)
      .eq('tour_id', id)
      .single()

    if (vendorError) {
      console.error('[Tour Vendor API] Error fetching vendor:', vendorError)
      if (vendorError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 })
    }

    console.log('[Tour Vendor API] Successfully fetched vendor:', vendorId)

    return NextResponse.json({ 
      success: true, 
      vendor,
      message: 'Vendor fetched successfully' 
    })

  } catch (error) {
    console.error('[Tour Vendor API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  try {
    const { id, vendorId } = await params
    console.log('[Tour Vendor API] PATCH request for vendor:', vendorId)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour Vendor API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tour Vendor API] User lacks admin permissions for updating vendor')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateVendorSchema.parse(body)

    // Verify the user owns this tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tourError) {
      console.error('[Tour Vendor API] Error fetching tour for ownership check:', tourError)
      if (tourError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) {
      console.log('[Tour Vendor API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the vendor
    const { data: updatedVendor, error: updateError } = await supabase
      .from('tour_vendors')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .eq('tour_id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[Tour Vendor API] Error updating vendor:', updateError)
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
    }

    console.log('[Tour Vendor API] Successfully updated vendor:', vendorId)

    return NextResponse.json({ 
      success: true, 
      vendor: updatedVendor,
      message: 'Vendor updated successfully' 
    })

  } catch (error) {
    console.error('[Tour Vendor API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  try {
    const { id, vendorId } = await params
    console.log('[Tour Vendor API] DELETE request for vendor:', vendorId)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tour Vendor API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tour Vendor API] User lacks admin permissions for deleting vendor')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the user owns this tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('user_id')
      .eq('id', id)
      .single()

    if (tourError) {
      console.error('[Tour Vendor API] Error fetching tour for ownership check:', tourError)
      if (tourError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 })
    }

    if (tour.user_id !== user.id) {
      console.log('[Tour Vendor API] User does not have access to this tour')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the vendor
    const { error: deleteError } = await supabase
      .from('tour_vendors')
      .delete()
      .eq('id', vendorId)
      .eq('tour_id', id)

    if (deleteError) {
      console.error('[Tour Vendor API] Error deleting vendor:', deleteError)
      return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
    }

    console.log('[Tour Vendor API] Successfully deleted vendor:', vendorId)

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor removed successfully' 
    })

  } catch (error) {
    console.error('[Tour Vendor API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 