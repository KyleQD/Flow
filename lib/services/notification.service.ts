import { supabase } from '@/lib/supabase'
import { z } from 'zod'

export const NOTIFICATION_TYPES = {
  ONBOARDING_INVITATION: 'onboarding_invitation',
  ONBOARDING_REMINDER: 'onboarding_reminder',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  REVIEW_REQUESTED: 'review_requested',
  APPROVAL_NOTIFICATION: 'approval_notification',
  REJECTION_NOTIFICATION: 'rejection_notification',
  WORKFLOW_UPDATE: 'workflow_update',
  TASK_ASSIGNED: 'task_assigned'
} as const

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
} as const

// Validation schemas
const NotificationSchema = z.object({
  id: z.string(),
  venue_id: z.string(),
  user_id: z.string().optional(),
  type: z.enum(Object.values(NOTIFICATION_TYPES) as [string, ...string[]]),
  title: z.string(),
  message: z.string(),
  priority: z.enum(Object.values(NOTIFICATION_PRIORITIES) as [string, ...string[]]),
  channels: z.array(z.enum(Object.values(NOTIFICATION_CHANNELS) as [string, ...string[]])),
  metadata: z.record(z.any()).optional(),
  read_at: z.string().optional(),
  sent_at: z.string().optional(),
  scheduled_for: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export type Notification = z.infer<typeof NotificationSchema>

export interface NotificationTemplate {
  type: string
  title: string
  message: string
  priority: string
  channels: string[]
  variables: string[]
}

export class NotificationService {
  private supabase = supabase

  // Predefined notification templates
  private templates: Record<string, NotificationTemplate> = {
    [NOTIFICATION_TYPES.ONBOARDING_INVITATION]: {
      type: NOTIFICATION_TYPES.ONBOARDING_INVITATION,
      title: 'Welcome to {venue_name}! Complete Your Onboarding',
      message: 'Hi {candidate_name}, welcome to {venue_name}! Please complete your onboarding process by clicking the link below. This should take about 15-20 minutes to complete.',
      priority: NOTIFICATION_PRIORITIES.HIGH,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
      variables: ['venue_name', 'candidate_name', 'onboarding_link']
    },
    [NOTIFICATION_TYPES.ONBOARDING_REMINDER]: {
      type: NOTIFICATION_TYPES.ONBOARDING_REMINDER,
      title: 'Reminder: Complete Your Onboarding',
      message: 'Hi {candidate_name}, this is a friendly reminder to complete your onboarding for {venue_name}. Please complete this within the next 24 hours.',
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
      variables: ['candidate_name', 'venue_name', 'onboarding_link']
    },
    [NOTIFICATION_TYPES.ONBOARDING_COMPLETED]: {
      type: NOTIFICATION_TYPES.ONBOARDING_COMPLETED,
      title: 'Onboarding Completed - Review Required',
      message: 'The onboarding for {candidate_name} has been completed and is ready for your review.',
      priority: NOTIFICATION_PRIORITIES.HIGH,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP],
      variables: ['candidate_name', 'review_link']
    },
    [NOTIFICATION_TYPES.REVIEW_REQUESTED]: {
      type: NOTIFICATION_TYPES.REVIEW_REQUESTED,
      title: 'Onboarding Review Requested',
      message: 'Please review the completed onboarding for {candidate_name} at your earliest convenience.',
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP],
      variables: ['candidate_name', 'review_link']
    },
    [NOTIFICATION_TYPES.APPROVAL_NOTIFICATION]: {
      type: NOTIFICATION_TYPES.APPROVAL_NOTIFICATION,
      title: 'Congratulations! Your Onboarding is Approved',
      message: 'Hi {candidate_name}, congratulations! Your onboarding has been approved. Welcome to the {venue_name} team!',
      priority: NOTIFICATION_PRIORITIES.HIGH,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
      variables: ['candidate_name', 'venue_name']
    },
    [NOTIFICATION_TYPES.REJECTION_NOTIFICATION]: {
      type: NOTIFICATION_TYPES.REJECTION_NOTIFICATION,
      title: 'Onboarding Review - Additional Information Needed',
      message: 'Hi {candidate_name}, we need some additional information to complete your onboarding. Please review the feedback and resubmit.',
      priority: NOTIFICATION_PRIORITIES.HIGH,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SMS],
      variables: ['candidate_name', 'feedback', 'resubmit_link']
    },
    [NOTIFICATION_TYPES.WORKFLOW_UPDATE]: {
      type: NOTIFICATION_TYPES.WORKFLOW_UPDATE,
      title: 'Workflow Update: {stage_name}',
      message: 'The onboarding process for {candidate_name} has moved to {stage_name}.',
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      channels: [NOTIFICATION_CHANNELS.IN_APP],
      variables: ['candidate_name', 'stage_name']
    },
    [NOTIFICATION_TYPES.TASK_ASSIGNED]: {
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      title: 'New Task Assigned: {task_name}',
      message: 'You have been assigned a new task: {task_name} for {candidate_name}.',
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP],
      variables: ['task_name', 'candidate_name', 'task_link']
    }
  }

  /**
   * Send a notification
   */
  async sendNotification(data: {
    venue_id: string
    user_id?: string
    type: string
    title: string
    message: string
    priority?: string
    channels?: string[]
    metadata?: Record<string, any>
    scheduled_for?: string
  }): Promise<Notification> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const notification = {
      venue_id: data.venue_id,
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      channels: data.channels || [NOTIFICATION_CHANNELS.IN_APP],
      metadata: data.metadata,
      scheduled_for: data.scheduled_for,
      created_by: user.id
    }

    const { data: newNotification, error } = await this.supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw new Error(`Failed to create notification: ${error.message}`)

    // Send through all channels
    await this.sendThroughChannels(newNotification)

    return newNotification
  }

  /**
   * Send notification using template
   */
  async sendTemplateNotification(data: {
    venue_id: string
    user_id?: string
    type: string
    variables: Record<string, string>
    priority?: string
    channels?: string[]
    scheduled_for?: string
  }): Promise<Notification> {
    const template = this.templates[data.type]
    if (!template) {
      throw new Error(`Template not found for type: ${data.type}`)
    }

    // Replace variables in template
    let title = template.title
    let message = template.message

    for (const [key, value] of Object.entries(data.variables)) {
      const placeholder = `{${key}}`
      title = title.replace(new RegExp(placeholder, 'g'), value)
      message = message.replace(new RegExp(placeholder, 'g'), value)
    }

    return this.sendNotification({
      venue_id: data.venue_id,
      user_id: data.user_id,
      type: data.type,
      title,
      message,
      priority: data.priority || template.priority,
      channels: data.channels || template.channels,
      scheduled_for: data.scheduled_for
    })
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(data: {
    venue_id: string
    user_id?: string
    type: string
    title: string
    message: string
    scheduled_for: string
    priority?: string
    channels?: string[]
    metadata?: Record<string, any>
  }): Promise<Notification> {
    return this.sendNotification({
      ...data,
      scheduled_for: data.scheduled_for
    })
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, filters?: {
    read?: boolean
    type?: string
    limit?: number
    offset?: number
  }): Promise<{ notifications: Notification[], total: number }> {
    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.read !== undefined) {
      if (filters.read) {
        query = query.not('read_at', 'is', null)
      } else {
        query = query.is('read_at', null)
      }
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data: notifications, error, count } = await query

    if (error) throw new Error(`Failed to get notifications: ${error.message}`)

    return {
      notifications: notifications || [],
      total: count || 0
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`)
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) throw new Error(`Failed to mark notifications as read: ${error.message}`)
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw new Error(`Failed to delete notification: ${error.message}`)
  }

  /**
   * Get notification statistics for a venue
   */
  async getNotificationStats(venueId: string): Promise<{
    total: number
    unread: number
    sent_today: number
    by_type: Record<string, number>
    by_priority: Record<string, number>
  }> {
    const { data: notifications, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('venue_id', venueId)

    if (error) throw new Error(`Failed to get notification stats: ${error.message}`)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const stats = {
      total: notifications?.length || 0,
      unread: notifications?.filter(n => !n.read_at).length || 0,
      sent_today: notifications?.filter(n => new Date(n.created_at) >= today).length || 0,
      by_type: {} as Record<string, number>,
      by_priority: {} as Record<string, number>
    }

    // Count by type
    notifications?.forEach(n => {
      stats.by_type[n.type] = (stats.by_type[n.type] || 0) + 1
      stats.by_priority[n.priority] = (stats.by_priority[n.priority] || 0) + 1
    })

    return stats
  }

  /**
   * Send notification through all specified channels
   */
  private async sendThroughChannels(notification: Notification): Promise<void> {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case NOTIFICATION_CHANNELS.EMAIL:
            await this.sendEmail(notification)
            break
          case NOTIFICATION_CHANNELS.SMS:
            await this.sendSMS(notification)
            break
          case NOTIFICATION_CHANNELS.PUSH:
            await this.sendPushNotification(notification)
            break
          case NOTIFICATION_CHANNELS.IN_APP:
            // In-app notifications are already stored in the database
            break
        }
      } catch (error) {
        console.error(`Failed to send notification through ${channel}:`, error)
      }
    }

    // Mark as sent
    await this.supabase
      .from('notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', notification.id)
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<void> {
    // Implementation would integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email notification:', {
      to: notification.user_id,
      subject: notification.title,
      body: notification.message
    })
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification): Promise<void> {
    // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log('Sending SMS notification:', {
      to: notification.user_id,
      message: notification.message
    })
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with push notification service (Firebase, OneSignal, etc.)
    console.log('Sending push notification:', {
      to: notification.user_id,
      title: notification.title,
      body: notification.message
    })
  }
} 