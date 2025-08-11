import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'

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

    const applications = await AdminOnboardingStaffService.getJobApplications(venueId)

    return NextResponse.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error('❌ [Applications API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, application_id: applicationId } = body || {}
    if (!action || !applicationId) {
      return NextResponse.json({ success: false, error: 'action and application_id required' }, { status: 400 })
    }

    if (action === 'approve') {
      // Mark application approved then create/link candidate
      await AdminOnboardingStaffService.updateApplicationStatus(applicationId, { status: 'approved' })
      const candidate = await AdminOnboardingStaffService.createOrLinkCandidateFromApplication(applicationId)
      return NextResponse.json({ success: true, data: candidate, message: 'Application approved and candidate created' })
    }

    if (action === 'reject') {
      const updated = await AdminOnboardingStaffService.updateApplicationStatus(applicationId, { status: 'rejected' })
      return NextResponse.json({ success: true, data: updated, message: 'Application rejected' })
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('❌ [Applications API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 })
  }
}