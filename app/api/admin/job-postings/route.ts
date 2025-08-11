import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json(
        { success: false, error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    const jobPostings = await AdminOnboardingStaffService.getJobPostings(venueId)

    return NextResponse.json({
      success: true,
      data: jobPostings
    })
  } catch (error) {
    console.error('❌ [Job Postings API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch job postings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { venue_id, ...jobData } = body

    if (!venue_id) {
      return NextResponse.json(
        { success: false, error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    const jobPosting = await AdminOnboardingStaffService.createJobPosting(venue_id, jobData)

    return NextResponse.json({
      success: true,
      data: jobPosting
    })
  } catch (error) {
    console.error('❌ [Job Postings API] Error creating job posting:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create job posting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 