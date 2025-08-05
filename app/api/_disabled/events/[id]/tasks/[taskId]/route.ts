import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const updateTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  category: z.enum(['logistics', 'marketing', 'technical', 'financial', 'staffing', 'vendor']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params
    console.log('[Tasks API] GET request for task:', taskId, 'in event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tasks API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tasks API] User lacks admin permissions for viewing task')
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
      console.error('[Tasks API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Tasks API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch the specific task
    const { data: task, error: taskError } = await supabase
      .from('event_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('event_id', id)
      .single()

    if (taskError) {
      console.error('[Tasks API] Error fetching task:', taskError)
      if (taskError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
    }

    console.log('[Tasks API] Successfully fetched task:', task.id)

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task fetched successfully' 
    })

  } catch (error) {
    console.error('[Tasks API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params
    console.log('[Tasks API] PATCH request for task:', taskId, 'in event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tasks API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tasks API] User lacks admin permissions for updating task')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the update data
    const validatedData = updateTaskSchema.parse(body)

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
      console.error('[Tasks API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Tasks API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from('event_tasks')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('event_id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('[Tasks API] Error updating task:', updateError)
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    console.log('[Tasks API] Successfully updated task:', taskId)

    return NextResponse.json({ 
      success: true, 
      task: updatedTask,
      message: 'Task updated successfully' 
    })

  } catch (error) {
    console.error('[Tasks API] Error:', error)
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
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params
    console.log('[Tasks API] DELETE request for task:', taskId, 'in event:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tasks API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tasks API] User lacks admin permissions for deleting task')
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
      console.error('[Tasks API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Tasks API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the task
    const { error: deleteError } = await supabase
      .from('event_tasks')
      .delete()
      .eq('id', taskId)
      .eq('event_id', id)

    if (deleteError) {
      console.error('[Tasks API] Error deleting task:', deleteError)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    console.log('[Tasks API] Successfully deleted task:', taskId)

    return NextResponse.json({ 
      success: true,
      message: 'Task deleted successfully' 
    })

  } catch (error) {
    console.error('[Tasks API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 