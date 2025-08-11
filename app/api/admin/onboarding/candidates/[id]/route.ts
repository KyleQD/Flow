import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { progress, stage, status, notes } = body

    if (progress === undefined) {
      return NextResponse.json(
        { error: 'Progress is required' },
        { status: 400 }
      )
    }

    const updatedCandidate = await AdminOnboardingStaffService.updateOnboardingProgress(
      params.id,
      { progress, stage, status, notes }
    )

    return NextResponse.json({
      data: updatedCandidate,
      success: true,
      message: 'Onboarding progress updated successfully'
    })
  } catch (error) {
    console.error('❌ [Admin Onboarding Candidate API] Error updating candidate:', error)
    return NextResponse.json(
      { error: 'Failed to update onboarding candidate' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'complete') {
      const staffMember = await AdminOnboardingStaffService.completeOnboarding(params.id)
      return NextResponse.json({
        data: staffMember,
        success: true,
        message: 'Onboarding completed and staff member created successfully'
      })
    } else if (action === 'generate_token') {
      const token = await AdminOnboardingStaffService.generateInvitationToken(params.id)
      return NextResponse.json({
        data: { token },
        success: true,
        message: 'Invitation token generated successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ [Admin Onboarding Candidate API] Error processing candidate action:', error)
    return NextResponse.json(
      { error: 'Failed to process candidate action' },
      { status: 500 }
    )
  }
} 