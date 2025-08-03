import { NextRequest, NextResponse } from 'next/server'
import { ArtistJobsService } from '@/lib/services/artist-jobs.service'
import { createClient } from '@/lib/supabase/server'
import { CreateApplicationFormData } from '@/types/artist-jobs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const applications = await ArtistJobsService.getJobApplications(params.id, user.id)

    return NextResponse.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error('Error in GET /api/artist-jobs/[id]/applications:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const applicationData: CreateApplicationFormData = await request.json()
    
    // Ensure job_id matches the route parameter
    applicationData.job_id = resolvedParams.id

    // Validate required fields
    if (!applicationData.contact_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact email is required'
        },
        { status: 400 }
      )
    }

    const application = await ArtistJobsService.applyToJob(applicationData, user.id)

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/artist-jobs/[id]/applications:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit application'
      },
      { status: 500 }
    )
  }
} 