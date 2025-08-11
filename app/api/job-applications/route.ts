import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { job_posting_id, form_responses } = body

    if (!job_posting_id) {
      return NextResponse.json(
        { success: false, error: 'Job posting ID is required' },
        { status: 400 }
      )
    }

    // Get job posting to extract venue_id and applicant info
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_posting_templates')
      .select('venue_id, title, department, position, applications_count')
      .eq('id', job_posting_id)
      .eq('status', 'published')
      .single()

    if (jobError || !jobPosting) {
      return NextResponse.json(
        { success: false, error: 'Job posting not found or not published' },
        { status: 404 }
      )
    }

    // Extract applicant info from form responses
    const applicantName = form_responses.full_name || form_responses.name || 'Unknown'
    const applicantEmail = form_responses.email || user.email || ''
    const applicantPhone = form_responses.phone || ''

    // Create the application
    const { data: application, error: applicationError } = await supabase
      .from('job_applications')
      .insert({
        venue_id: jobPosting.venue_id,
        job_posting_id,
        applicant_id: user.id,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        status: 'pending',
        form_responses,
        applied_at: new Date().toISOString()
      })
      .select()
      .single()

    if (applicationError) {
      console.error('Error creating application:', applicationError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Increment application count on job posting using RPC-safe approach
    await supabase.rpc('increment_applications_count', { p_job_id: job_posting_id })

    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error('Error in job application API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 