import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

const createEventJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
  category_id: z.string().min(1, 'Category is required'),
  job_type: z.enum(['one_time', 'recurring', 'tour', 'residency', 'collaboration']),
  payment_type: z.enum(['paid', 'unpaid', 'revenue_share', 'exposure']),
  payment_amount: z.number().optional(),
  payment_currency: z.string().default('USD'),
  payment_description: z.string().optional(),
  location: z.string().optional(),
  location_type: z.enum(['in_person', 'remote', 'hybrid']).default('in_person'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  duration_hours: z.number().optional(),
  deadline: z.string().optional(),
  required_skills: z.array(z.string()).default([]),
  required_equipment: z.array(z.string()).default([]),
  required_experience: z.enum(['beginner', 'intermediate', 'professional']).default('intermediate'),
  required_genres: z.array(z.string()).default([]),
  age_requirement: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  special_requirements: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  external_link: z.string().url().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'open']).default('open')
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Event Jobs API] GET request for event jobs:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Event Jobs API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Event Jobs API] User lacks admin permissions for viewing event jobs')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the user has access to this event (through tour ownership)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        tours (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('[Event Jobs API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Event Jobs API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch jobs related to this event
    // For now, we'll use the existing artist-jobs API structure
    // In a real implementation, you might want to add an event_id field to jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('artist_jobs')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.error('[Event Jobs API] Error fetching jobs:', jobsError)
      // Return empty array if table doesn't exist or no jobs found
      return NextResponse.json({ 
        success: true, 
        jobs: [],
        message: 'No jobs found for this event' 
      })
    }

    console.log('[Event Jobs API] Successfully fetched jobs:', jobs?.length || 0)

    return NextResponse.json({ 
      success: true, 
      jobs: jobs || [],
      message: 'Event jobs fetched successfully' 
    })

  } catch (error) {
    console.error('[Event Jobs API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[Event Jobs API] POST request for event job:', id)
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      console.log('[Event Jobs API] Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check if user has admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      console.log('[Event Jobs API] User lacks admin permissions for creating event jobs')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createEventJobSchema.parse(body)

    // Verify the user has access to this event (through tour ownership)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        venue_name,
        event_date,
        tours (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('[Event Jobs API] Error fetching event:', eventError)
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }

    if (event.tours && event.tours.user_id !== user.id) {
      console.log('[Event Jobs API] User does not have access to this event')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the job with event context
    const jobData = {
      ...validatedData,
      event_id: id,
      event_name: event.name,
      event_venue: event.venue_name,
      event_date: event.event_date,
      posted_by: user.id,
      posted_by_type: 'artist',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'open',
      applications_count: 0,
      views_count: 0
    }

    // For now, we'll use the existing artist-jobs table structure
    // In a production system, you might want to create a separate event_jobs table
    const { data: job, error: jobError } = await supabase
      .from('artist_jobs')
      .insert(jobData)
      .select('*')
      .single()

    if (jobError) {
      console.error('[Event Jobs API] Error creating job:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    console.log('[Event Jobs API] Successfully created job:', job.id)

    // Also post to the main job board for visibility
    try {
      const mainJobResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/artist-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validatedData,
          title: `[${event.name}] ${validatedData.title}`,
          description: `Event: ${event.name}\nVenue: ${event.venue_name}\nDate: ${event.event_date}\n\n${validatedData.description}`,
          event_id: id,
          event_name: event.name
        })
      })

      if (mainJobResponse.ok) {
        console.log('[Event Jobs API] Job also posted to main job board')
      }
    } catch (error) {
      console.warn('[Event Jobs API] Failed to post to main job board:', error)
      // Don't fail the request if this fails
    }

    return NextResponse.json({ 
      success: true, 
      job,
      message: 'Job posted successfully for event' 
    })

  } catch (error) {
    console.error('[Event Jobs API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 