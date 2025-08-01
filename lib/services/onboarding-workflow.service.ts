import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Workflow status definitions
export const WORKFLOW_STAGES = {
  JOB_POSTED: 'job_posted',
  APPLICATION_RECEIVED: 'application_received',
  SCREENING: 'screening',
  INVITATION_SENT: 'invitation_sent',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  REVIEW_PENDING: 'review_pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  TEAM_ASSIGNED: 'team_assigned'
} as const

export const WORKFLOW_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

// Validation schemas
const WorkflowStepSchema = z.object({
  id: z.string(),
  stage: z.enum(Object.values(WORKFLOW_STAGES) as [string, ...string[]]),
  status: z.enum(Object.values(WORKFLOW_STATUSES) as [string, ...string[]]),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

const WorkflowSchema = z.object({
  id: z.string(),
  venue_id: z.string(),
  candidate_id: z.string(),
  job_posting_id: z.string().optional(),
  current_stage: z.enum(Object.values(WORKFLOW_STAGES) as [string, ...string[]]),
  status: z.enum(Object.values(WORKFLOW_STATUSES) as [string, ...string[]]),
  steps: z.array(WorkflowStepSchema),
  created_at: z.string(),
  updated_at: z.string(),
  estimated_completion: z.string().optional(),
  actual_completion: z.string().optional()
})

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>
export type Workflow = z.infer<typeof WorkflowSchema>

export interface WorkflowTrigger {
  type: 'job_posted' | 'application_received' | 'invitation_sent' | 'onboarding_completed' | 'review_completed'
  data: Record<string, any>
  venue_id: string
  candidate_id?: string
  job_posting_id?: string
}

export interface WorkflowAction {
  type: 'send_notification' | 'update_status' | 'assign_task' | 'schedule_interview' | 'send_reminder'
  data: Record<string, any>
  target_user_id?: string
  delay_minutes?: number
}

export class OnboardingWorkflowService {
  private supabase = createClient()

  /**
   * Initialize a new workflow for a candidate
   */
  async initializeWorkflow(trigger: WorkflowTrigger): Promise<Workflow> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const workflowSteps = this.generateWorkflowSteps(trigger.type)
    
    const { data: workflow, error } = await this.supabase
      .from('onboarding_workflows')
      .insert({
        venue_id: trigger.venue_id,
        candidate_id: trigger.candidate_id,
        job_posting_id: trigger.job_posting_id,
        current_stage: WORKFLOW_STAGES.JOB_POSTED,
        status: WORKFLOW_STATUSES.ACTIVE,
        steps: workflowSteps,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create workflow: ${error.message}`)
    
    // Trigger initial actions
    await this.executeWorkflowActions(workflow.id, trigger.type, trigger.data)
    
    return workflow
  }

  /**
   * Advance workflow to next stage
   */
  async advanceWorkflow(workflowId: string, newStage: string, metadata?: Record<string, any>): Promise<Workflow> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get current workflow
    const { data: workflow } = await this.supabase
      .from('onboarding_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (!workflow) throw new Error('Workflow not found')

    // Update current step
    const updatedSteps = workflow.steps.map((step: WorkflowStep) => {
      if (step.stage === workflow.current_stage) {
        return { ...step, completed_at: new Date().toISOString() }
      }
      if (step.stage === newStage) {
        return { 
          ...step, 
          started_at: new Date().toISOString(),
          assigned_to: metadata?.assigned_to || step.assigned_to,
          notes: metadata?.notes || step.notes
        }
      }
      return step
    })

    // Update workflow
    const { data: updatedWorkflow, error } = await this.supabase
      .from('onboarding_workflows')
      .update({
        current_stage: newStage,
        steps: updatedSteps,
        updated_at: new Date().toISOString(),
        ...(metadata && { metadata })
      })
      .eq('id', workflowId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update workflow: ${error.message}`)

    // Execute stage-specific actions
    await this.executeWorkflowActions(workflowId, newStage, metadata || {})

    return updatedWorkflow
  }

  /**
   * Get workflow for a candidate
   */
  async getWorkflow(candidateId: string): Promise<Workflow | null> {
    const { data: workflow, error } = await this.supabase
      .from('onboarding_workflows')
      .select('*')
      .eq('candidate_id', candidateId)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get workflow: ${error.message}`)
    return workflow
  }

  /**
   * Get all workflows for a venue
   */
  async getVenueWorkflows(venueId: string, filters?: {
    status?: string
    stage?: string
    limit?: number
    offset?: number
  }): Promise<{ workflows: Workflow[], total: number }> {
    let query = this.supabase
      .from('onboarding_workflows')
      .select('*, candidates:staff_onboarding_candidates(*)', { count: 'exact' })
      .eq('venue_id', venueId)

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.stage) query = query.eq('current_stage', filters.stage)
    if (filters?.limit) query = query.limit(filters.limit)
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)

    const { data: workflows, error, count } = await query

    if (error) throw new Error(`Failed to get workflows: ${error.message}`)
    
    return { 
      workflows: workflows || [], 
      total: count || 0 
    }
  }

  /**
   * Get workflow analytics for a venue
   */
  async getWorkflowAnalytics(venueId: string): Promise<{
    total_workflows: number
    active_workflows: number
    completed_workflows: number
    average_duration_days: number
    stage_distribution: Record<string, number>
    bottlenecks: string[]
  }> {
    const { data: workflows, error } = await this.supabase
      .from('onboarding_workflows')
      .select('*')
      .eq('venue_id', venueId)

    if (error) throw new Error(`Failed to get workflow analytics: ${error.message}`)

    const stageDistribution = Object.values(WORKFLOW_STAGES).reduce((acc, stage) => {
      acc[stage] = workflows?.filter(w => w.current_stage === stage).length || 0
      return acc
    }, {} as Record<string, number>)

    const completedWorkflows = workflows?.filter(w => w.status === WORKFLOW_STATUSES.COMPLETED) || []
    const activeWorkflows = workflows?.filter(w => w.status === WORKFLOW_STATUSES.ACTIVE) || []

    // Calculate average duration
    const totalDuration = completedWorkflows.reduce((sum, w) => {
      if (w.actual_completion && w.created_at) {
        const duration = new Date(w.actual_completion).getTime() - new Date(w.created_at).getTime()
        return sum + duration
      }
      return sum
    }, 0)

    const averageDurationDays = completedWorkflows.length > 0 
      ? Math.round(totalDuration / (completedWorkflows.length * 24 * 60 * 60 * 1000))
      : 0

    // Identify bottlenecks (stages with most candidates)
    const bottlenecks = Object.entries(stageDistribution)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([stage]) => stage)

    return {
      total_workflows: workflows?.length || 0,
      active_workflows: activeWorkflows.length,
      completed_workflows: completedWorkflows.length,
      average_duration_days: averageDurationDays,
      stage_distribution: stageDistribution,
      bottlenecks
    }
  }

  /**
   * Generate workflow steps based on trigger type
   */
  private generateWorkflowSteps(triggerType: string): WorkflowStep[] {
    const baseSteps = [
      {
        id: 'job_posted',
        stage: WORKFLOW_STAGES.JOB_POSTED,
        status: WORKFLOW_STATUSES.COMPLETED,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }
    ]

    switch (triggerType) {
      case 'job_posted':
        return [
          ...baseSteps,
          {
            id: 'application_received',
            stage: WORKFLOW_STAGES.APPLICATION_RECEIVED,
            status: WORKFLOW_STATUSES.ACTIVE,
            started_at: new Date().toISOString()
          },
          {
            id: 'screening',
            stage: WORKFLOW_STAGES.SCREENING,
            status: WORKFLOW_STATUSES.PAUSED
          },
          {
            id: 'invitation_sent',
            stage: WORKFLOW_STAGES.INVITATION_SENT,
            status: WORKFLOW_STATUSES.PAUSED
          },
          {
            id: 'onboarding_started',
            stage: WORKFLOW_STAGES.ONBOARDING_STARTED,
            status: WORKFLOW_STATUSES.PAUSED
          },
          {
            id: 'onboarding_completed',
            stage: WORKFLOW_STAGES.ONBOARDING_COMPLETED,
            status: WORKFLOW_STATUSES.PAUSED
          },
          {
            id: 'review_pending',
            stage: WORKFLOW_STAGES.REVIEW_PENDING,
            status: WORKFLOW_STATUSES.PAUSED
          },
          {
            id: 'approved',
            stage: WORKFLOW_STAGES.APPROVED,
            status: WORKFLOW_STATUSES.PAUSED
          },
          {
            id: 'team_assigned',
            stage: WORKFLOW_STAGES.TEAM_ASSIGNED,
            status: WORKFLOW_STATUSES.PAUSED
          }
        ]

      case 'application_received':
        return [
          ...baseSteps,
          {
            id: 'application_received',
            stage: WORKFLOW_STAGES.APPLICATION_RECEIVED,
            status: WORKFLOW_STATUSES.COMPLETED,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          },
          {
            id: 'screening',
            stage: WORKFLOW_STAGES.SCREENING,
            status: WORKFLOW_STATUSES.ACTIVE,
            started_at: new Date().toISOString()
          }
        ]

      default:
        return baseSteps
    }
  }

  /**
   * Execute workflow actions based on stage
   */
  private async executeWorkflowActions(workflowId: string, stage: string, metadata: Record<string, any>) {
    const actions: WorkflowAction[] = []

    switch (stage) {
      case WORKFLOW_STAGES.APPLICATION_RECEIVED:
        actions.push({
          type: 'send_notification',
          data: {
            title: 'New Application Received',
            message: 'A new application has been received and is ready for screening',
            priority: 'high'
          },
          target_user_id: metadata.assigned_to
        })
        break

      case WORKFLOW_STAGES.INVITATION_SENT:
        actions.push({
          type: 'send_reminder',
          data: {
            title: 'Onboarding Invitation Sent',
            message: 'Please complete your onboarding within 7 days',
            priority: 'medium'
          },
          delay_minutes: 10080 // 7 days
        })
        break

      case WORKFLOW_STAGES.ONBOARDING_COMPLETED:
        actions.push({
          type: 'send_notification',
          data: {
            title: 'Onboarding Completed',
            message: 'Candidate has completed onboarding and is ready for review',
            priority: 'high'
          },
          target_user_id: metadata.assigned_to
        })
        break

      case WORKFLOW_STAGES.APPROVED:
        actions.push({
          type: 'update_status',
          data: {
            status: 'approved',
            notes: 'Workflow completed successfully'
          }
        })
        break
    }

    // Execute actions
    for (const action of actions) {
      await this.executeAction(workflowId, action)
    }
  }

  /**
   * Execute a single workflow action
   */
  private async executeAction(workflowId: string, action: WorkflowAction) {
    try {
      switch (action.type) {
        case 'send_notification':
          await this.sendNotification(action.data, action.target_user_id)
          break

        case 'send_reminder':
          await this.scheduleReminder(workflowId, action.data, action.delay_minutes)
          break

        case 'update_status':
          await this.updateCandidateStatus(workflowId, action.data)
          break

        case 'assign_task':
          await this.assignTask(workflowId, action.data)
          break
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.type}:`, error)
    }
  }

  /**
   * Send notification to user
   */
  private async sendNotification(data: Record<string, any>, targetUserId?: string) {
    // Implementation would integrate with notification service
    console.log('Sending notification:', data, 'to:', targetUserId)
  }

  /**
   * Schedule reminder
   */
  private async scheduleReminder(workflowId: string, data: Record<string, any>, delayMinutes?: number) {
    // Implementation would integrate with scheduling service
    console.log('Scheduling reminder for workflow:', workflowId, 'in', delayMinutes, 'minutes')
  }

  /**
   * Update candidate status
   */
  private async updateCandidateStatus(workflowId: string, data: Record<string, any>) {
    const { data: workflow } = await this.supabase
      .from('onboarding_workflows')
      .select('candidate_id')
      .eq('id', workflowId)
      .single()

    if (workflow?.candidate_id) {
      await this.supabase
        .from('staff_onboarding_candidates')
        .update({
          status: data.status,
          notes: data.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.candidate_id)
    }
  }

  /**
   * Assign task to user
   */
  private async assignTask(workflowId: string, data: Record<string, any>) {
    // Implementation would integrate with task management service
    console.log('Assigning task for workflow:', workflowId, 'data:', data)
  }
} 