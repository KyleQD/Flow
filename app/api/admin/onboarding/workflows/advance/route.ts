import { NextRequest, NextResponse } from 'next/server'
import { OnboardingWorkflowService, WORKFLOW_STAGES } from '@/lib/services/onboarding-workflow.service'
import { getAuthUser } from '@/lib/auth'

const workflowService = new OnboardingWorkflowService()

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { workflow_id, new_stage, metadata } = body

    if (!workflow_id || !new_stage) {
      return NextResponse.json(
        { error: 'Workflow ID and new stage are required' },
        { status: 400 }
      )
    }

    // Validate stage
    if (!Object.values(WORKFLOW_STAGES).includes(new_stage)) {
      return NextResponse.json(
        { error: 'Invalid stage' },
        { status: 400 }
      )
    }

    const workflow = await workflowService.advanceWorkflow(workflow_id, new_stage, metadata)

    return NextResponse.json({
      success: true,
      data: workflow
    })
  } catch (error) {
    console.error('Error advancing workflow:', error)
    return NextResponse.json(
      { error: 'Failed to advance workflow' },
      { status: 500 }
    )
  }
} 