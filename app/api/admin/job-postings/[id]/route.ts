import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    // Get specific job posting
    const jobPostings = await AdminOnboardingStaffService.getJobPostings(venueId)
    const jobPosting = jobPostings.find(job => job.id === params.id)

    if (!jobPosting) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: jobPosting,
      success: true
    })
  } catch (error) {
    console.error('❌ [Admin Job Posting API] Error fetching job posting:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job posting' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (status) {
      const updatedJobPosting = await AdminOnboardingStaffService.updateJobPostingStatus(
        params.id,
        status
      )

      return NextResponse.json({
        data: updatedJobPosting,
        success: true,
        message: 'Job posting status updated successfully'
      })
    }

    return NextResponse.json(
      { error: 'No valid updates provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ [Admin Job Posting API] Error updating job posting:', error)
    return NextResponse.json(
      { error: 'Failed to update job posting' },
      { status: 500 }
    )
  }
} 