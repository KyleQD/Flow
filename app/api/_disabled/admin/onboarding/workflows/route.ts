import { NextRequest, NextResponse } from 'next/server'
import { OnboardingWorkflowService, WORKFLOW_STAGES } from '@/lib/services/onboarding-workflow.service'
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
    const status = searchParams.get('status')
    const stage = searchParams.get('stage')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    const result = await workflowService.getVenueWorkflows(venueId, {
      status: status || undefined,
      stage: stage || undefined,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      data: result.workflows,
      total: result.total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.total
      }
    })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data, venue_id, candidate_id, job_posting_id } = body

    if (!type || !venue_id) {
      return NextResponse.json(
        { error: 'Type and venue_id are required' },
        { status: 400 }
      )
    }

    const workflow = await workflowService.initializeWorkflow({
      type,
      data,
      venue_id,
      candidate_id,
      job_posting_id
    })

    return NextResponse.json({
      success: true,
      data: workflow
    })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
} 