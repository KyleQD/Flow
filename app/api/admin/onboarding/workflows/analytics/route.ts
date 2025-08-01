import { NextRequest, NextResponse } from 'next/server'
import { OnboardingWorkflowService } from '@/lib/services/onboarding-workflow.service'
import { getAuthUser } from '@/lib/auth'

const workflowService = new OnboardingWorkflowService()

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    const analytics = await workflowService.getWorkflowAnalytics(venueId)

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error fetching workflow analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow analytics' },
      { status: 500 }
    )
  }
} 