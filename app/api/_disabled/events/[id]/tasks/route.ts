import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).default('not_started'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  category: z.enum(['logistics', 'marketing', 'technical', 'financial', 'staffing', 'vendor']).default('logistics'),
  event_id: z.string().uuid('Invalid event ID')
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Tasks API] GET request for event tasks:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tasks API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tasks API] User lacks admin permissions for viewing tasks')
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

    // Fetch tasks for this event
    const { data: tasks, error: tasksError } = await supabase
      .from('event_tasks')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (tasksError) {
      console.error('[Tasks API] Error fetching tasks:', tasksError)
      // Return empty array if table doesn't exist
      if (tasksError.code === '42P01') {
        console.log('[Tasks API] Event tasks table does not exist, returning empty array')
        return NextResponse.json({ 
          success: true, 
          tasks: [],
          message: 'No tasks found' 
        })
      }
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    console.log('[Tasks API] Successfully fetched tasks:', tasks?.length || 0)

    return NextResponse.json({ 
      success: true, 
      tasks: tasks || [],
      message: 'Tasks fetched successfully' 
    })

  } catch (error) {
    console.error('[Tasks API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Tasks API] POST request for event tasks:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Tasks API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Tasks API] User lacks admin permissions for creating tasks')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

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

    // Create the task
    const taskData = {
      ...validatedData,
      event_id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: task, error: taskError } = await supabase
      .from('event_tasks')
      .insert(taskData)
      .select('*')
      .single()

    if (taskError) {
      console.error('[Tasks API] Error creating task:', taskError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    console.log('[Tasks API] Successfully created task:', task.id)

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task created successfully' 
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