import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const bulkActionSchema = z.object({
  itemIds: z.array(z.string()).min(1, 'At least one item ID is required'),
  action: z.enum([
    'mark_complete',
    'mark_in_progress',
    'mark_pending',
    'mark_cancelled',
    'update_priority',
    'assign_to',
    'add_tags',
    'remove_tags',
    'archive',
    'delete'
  ]),
  value: z.any().optional(), // For actions that need additional data
  notes: z.string().optional()
})

export async function PUT(request: NextRequest) {
  try {
    console.log('[Logistics Bulk Actions API] PUT request started')
    
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
    const validationResult = bulkActionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: validationResult.error.errors 
      }, { status: 400 })
    }

    const { itemIds, action, value, notes } = validationResult.data

    // Build update data based on action
    let updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    switch (action) {
      case 'mark_complete':
        updateData.status = 'completed'
        break
      case 'mark_in_progress':
        updateData.status = 'in_progress'
        break
      case 'mark_pending':
        updateData.status = 'pending'
        break
      case 'mark_cancelled':
        updateData.status = 'cancelled'
        break
      case 'update_priority':
        if (!value || !['low', 'medium', 'high', 'urgent'].includes(value)) {
          return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 })
        }
        updateData.priority = value
        break
      case 'assign_to':
        updateData.assigned_to = value
        break
      case 'add_tags':
        // Get current tags and add new ones
        const { data: currentItems } = await supabase
          .from('logistics_items')
          .select('id, tags')
          .in('id', itemIds)
        
        if (currentItems) {
          updateData.tags = currentItems.map(item => {
            const currentTags = item.tags || []
            const newTags = Array.isArray(value) ? value : [value]
            return [...new Set([...currentTags, ...newTags])]
          })
        }
        break
      case 'remove_tags':
        // Get current tags and remove specified ones
        const { data: itemsWithTags } = await supabase
          .from('logistics_items')
          .select('id, tags')
          .in('id', itemIds)
        
        if (itemsWithTags) {
          updateData.tags = itemsWithTags.map(item => {
            const currentTags = item.tags || []
            const tagsToRemove = Array.isArray(value) ? value : [value]
            return currentTags.filter(tag => !tagsToRemove.includes(tag))
          })
        }
        break
      case 'archive':
        updateData.archived = true
        updateData.archived_at = new Date().toISOString()
        break
      case 'delete':
        // Handle delete separately
        const { error: deleteError } = await supabase
          .from('logistics_items')
          .delete()
          .in('id', itemIds)

        if (deleteError) {
          console.error('[Logistics Bulk Actions API] Delete error:', deleteError)
          return NextResponse.json({ error: 'Failed to delete items' }, { status: 500 })
        }

        console.log('[Logistics Bulk Actions API] Items deleted successfully:', itemIds.length)

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${itemIds.length} items`,
          deletedCount: itemIds.length
        })
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes
    }

    // Update items
    const { error: updateError, count } = await supabase
      .from('logistics_items')
      .update(updateData)
      .in('id', itemIds)

    if (updateError) {
      console.error('[Logistics Bulk Actions API] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update items' }, { status: 500 })
    }

    console.log('[Logistics Bulk Actions API] Items updated successfully:', itemIds.length)

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${itemIds.length} items`,
      updatedCount: itemIds.length,
      action: action
    })

  } catch (error) {
    console.error('[Logistics Bulk Actions API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Logistics Bulk Actions API] POST request started')
    
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
    
    // Validate input for bulk create
    const bulkCreateSchema = z.object({
      items: z.array(z.object({
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
      })).min(1, 'At least one item is required').max(100, 'Maximum 100 items per bulk create')
    })

    const validationResult = bulkCreateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: validationResult.error.errors 
      }, { status: 400 })
    }

    const { items } = validationResult.data

    // Prepare items for insertion
    const itemsToInsert = items.map(item => ({
      ...item,
      created_by: user.id,
      updated_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert items
    const { data: newItems, error } = await supabase
      .from('logistics_items')
      .insert(itemsToInsert)
      .select()

    if (error) {
      console.error('[Logistics Bulk Actions API] Insert error:', error)
      return NextResponse.json({ error: 'Failed to create items' }, { status: 500 })
    }

    console.log('[Logistics Bulk Actions API] Items created successfully:', newItems?.length || 0)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${newItems?.length || 0} items`,
      items: newItems || [],
      createdCount: newItems?.length || 0
    }, { status: 201 })

  } catch (error) {
    console.error('[Logistics Bulk Actions API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 