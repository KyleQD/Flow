import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const createItemSchema = z.object({
  type: z.enum(['transportation', 'equipment', 'lodging', 'catering', 'communication', 'backline', 'rental']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'needs_attention']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  budget: z.number().optional(),
  actualCost: z.number().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  eventId: z.string().optional(),
  tourId: z.string().optional()
})

const updateItemSchema = createItemSchema.partial()

export async function GET(request: NextRequest) {
  try {
    console.log('[Logistics Items API] GET request started')
    
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('logistics_items')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (eventId) query = query.eq('event_id', eventId)
    if (tourId) query = query.eq('tour_id', tourId)
    if (type && type !== 'all') query = query.eq('type', type)
    if (status && status !== 'all') query = query.eq('status', status)
    if (priority && priority !== 'all') query = query.eq('priority', priority)
    if (assignedTo && assignedTo !== 'all') query = query.eq('assigned_to', assignedTo)

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: items, error, count } = await query

    if (error) {
      console.error('[Logistics Items API] Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch logistics items' }, { status: 500 })
    }

    console.log('[Logistics Items API] Items fetched successfully:', items?.length || 0)

    return NextResponse.json({
      success: true,
      items: items || [],
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('[Logistics Items API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Logistics Items API] POST request started')
    
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
    
    // Validate input
    const validationResult = createItemSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: validationResult.error.errors 
      }, { status: 400 })
    }

    const itemData = validationResult.data

    // Create new item
    const { data: newItem, error } = await supabase
      .from('logistics_items')
      .insert({
        ...itemData,
        created_by: user.id,
        updated_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[Logistics Items API] Database error:', error)
      return NextResponse.json({ error: 'Failed to create logistics item' }, { status: 500 })
    }

    console.log('[Logistics Items API] Item created successfully:', newItem.id)

    return NextResponse.json({
      success: true,
      item: newItem
    }, { status: 201 })

  } catch (error) {
    console.error('[Logistics Items API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Logistics Items API] PUT request started')
    
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
    
    // Validate input
    const validationResult = updateItemSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: validationResult.error.errors 
      }, { status: 400 })
    }

    const itemData = validationResult.data
    const itemId = body.id

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Update item
    const { data: updatedItem, error } = await supabase
      .from('logistics_items')
      .update({
        ...itemData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      console.error('[Logistics Items API] Database error:', error)
      return NextResponse.json({ error: 'Failed to update logistics item' }, { status: 500 })
    }

    console.log('[Logistics Items API] Item updated successfully:', itemId)

    return NextResponse.json({
      success: true,
      item: updatedItem
    })

  } catch (error) {
    console.error('[Logistics Items API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('[Logistics Items API] DELETE request started')
    
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
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Delete item
    const { error } = await supabase
      .from('logistics_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('[Logistics Items API] Database error:', error)
      return NextResponse.json({ error: 'Failed to delete logistics item' }, { status: 500 })
    }

    console.log('[Logistics Items API] Item deleted successfully:', itemId)

    return NextResponse.json({
      success: true,
      message: 'Logistics item deleted successfully'
    })

  } catch (error) {
    console.error('[Logistics Items API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 