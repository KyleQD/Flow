import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, feedback, rating } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const updatedApplication = await AdminOnboardingStaffService.updateApplicationStatus(
      params.id,
      { status, feedback, rating }
    )

    return NextResponse.json({
      data: updatedApplication,
      success: true,
      message: 'Application status updated successfully'
    })
  } catch (error) {
    console.error('❌ [Admin Application API] Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
} 