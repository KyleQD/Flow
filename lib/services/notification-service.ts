import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Types
export interface NotificationData {
  userId: string
  type: string
  title: string
  content: string
  summary?: string
  metadata?: Record<string, any>
  relatedUserId?: string
  relatedContentId?: string
  relatedContentType?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  expiresAt?: Date
}

export interface NotificationTemplate {
  type: string
  titleTemplate: string
  contentTemplate: string
  summaryTemplate?: string
  icon?: string
  color?: string
  category?: string
}

export interface NotificationPreferences {
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
  preferences: Record<string, {
    email: boolean
    push: boolean
    sms: boolean
  }>
  digestFrequency: 'never' | 'hourly' | 'daily' | 'weekly'
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

// Validation schemas
const notificationDataSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  summary: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  relatedUserId: z.string().uuid().optional(),
  relatedContentId: z.string().optional(),
  relatedContentType: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  expiresAt: z.date().optional()
})

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData) {
    try {
      // Validate input
      const validatedData = notificationDataSchema.parse(data)

      // Check if user has notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', validatedData.userId)
        .single()

      // If no preferences exist, create default ones
      if (!preferences) {
        await this.createDefaultPreferences(validatedData.userId)
      }

      // Create the notification
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: validatedData.userId,
          type: validatedData.type,
          title: validatedData.title,
          content: validatedData.content,
          summary: validatedData.summary,
          metadata: validatedData.metadata || {},
          related_user_id: validatedData.relatedUserId,
          related_content_id: validatedData.relatedContentId,
          related_content_type: validatedData.relatedContentType,
          priority: validatedData.priority || 'normal',
          expires_at: validatedData.expiresAt?.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Send notifications through different channels
      await this.sendNotificationChannels(notification)

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Create multiple notifications for multiple users
   */
  static async createBulkNotifications(notifications: NotificationData[]) {
    try {
      const results = await Promise.allSettled(
        notifications.map(notification => this.createNotification(notification))
      )

      const successful = results.filter(result => result.status === 'fulfilled')
      const failed = results.filter(result => result.status === 'rejected')

      return {
        successful: successful.length,
        failed: failed.length,
        results
      }
    } catch (error) {
      console.error('Error creating bulk notifications:', error)
      throw error
    }
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(userId: string, options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    type?: string
  } = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          related_user:profiles!notifications_related_user_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (options.type) {
        query = query.eq('type', options.type)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      throw error
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  /**
   * Get user's notification preferences
   */
  static async getNotificationPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      throw error
    }
  }

  /**
   * Update user's notification preferences
   */
  static async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: preferences.emailEnabled,
          push_enabled: preferences.pushEnabled,
          sms_enabled: preferences.smsEnabled,
          in_app_enabled: preferences.inAppEnabled,
          preferences: preferences.preferences,
          digest_frequency: preferences.digestFrequency,
          quiet_hours_enabled: preferences.quietHoursEnabled,
          quiet_hours_start: preferences.quietHoursStart,
          quiet_hours_end: preferences.quietHoursEnd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      throw error
    }
  }

  /**
   * Get notification templates
   */
  static async getNotificationTemplates() {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('type')

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching notification templates:', error)
      throw error
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      throw error
    }
  }

  /**
   * Create default notification preferences for a user
   */
  private static async createDefaultPreferences(userId: string) {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false,
          in_app_enabled: true,
          preferences: {
            like: { email: true, push: true, sms: false },
            comment: { email: true, push: true, sms: false },
            follow: { email: true, push: true, sms: false },
            message: { email: true, push: true, sms: true },
            event_invite: { email: true, push: true, sms: true },
            booking_request: { email: true, push: true, sms: true },
            system_alert: { email: true, push: false, sms: false }
          },
          digest_frequency: 'daily',
          quiet_hours_enabled: false
        })

      if (error) throw error
    } catch (error) {
      console.error('Error creating default preferences:', error)
      throw error
    }
  }

  /**
   * Send notifications through different channels (email, push, SMS)
   */
  private static async sendNotificationChannels(notification: any) {
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', notification.user_id)
        .single()

      if (!preferences) return

      // Check if we're in quiet hours
      if (preferences.quiet_hours_enabled && this.isInQuietHours(preferences)) {
        // Only send urgent notifications during quiet hours
        if (notification.priority !== 'urgent') {
          return
        }
      }

      // Send in-app notification (always enabled)
      if (preferences.in_app_enabled) {
        await this.logDelivery(notification.id, notification.user_id, 'in_app', 'sent')
      }

      // Check type-specific preferences
      const typePreferences = preferences.preferences[notification.type]
      if (typePreferences) {
        // Send email notification
        if (preferences.email_enabled && typePreferences.email) {
          await this.sendEmailNotification(notification, preferences)
        }

        // Send push notification
        if (preferences.push_enabled && typePreferences.push) {
          await this.sendPushNotification(notification, preferences)
        }

        // Send SMS notification
        if (preferences.sms_enabled && typePreferences.sms) {
          await this.sendSMSNotification(notification, preferences)
        }
      }
    } catch (error) {
      console.error('Error sending notification channels:', error)
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private static isInQuietHours(preferences: any): boolean {
    if (!preferences.quiet_hours_enabled) return false

    const now = new Date()
    const userTimezone = preferences.quiet_hours_timezone || 'UTC'
    
    // Convert to user's timezone
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }))
    const currentTime = userTime.getHours() * 60 + userTime.getMinutes()
    
    const startTime = this.timeToMinutes(preferences.quiet_hours_start)
    const endTime = this.timeToMinutes(preferences.quiet_hours_end)
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  /**
   * Convert time string (HH:MM:SS) to minutes
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(notification: any, preferences: any) {
    try {
      // Get user's email
      const { data: user } = await supabase.auth.admin.getUserById(notification.user_id)
      if (!user?.user?.email) return

      // TODO: Implement email sending logic
      // This would integrate with your email service (Resend, SendGrid, etc.)
      console.log('Sending email notification:', {
        to: user.user.email,
        subject: notification.title,
        content: notification.content
      })

      await this.logDelivery(notification.id, notification.user_id, 'email', 'sent')
    } catch (error) {
      console.error('Error sending email notification:', error)
      await this.logDelivery(notification.id, notification.user_id, 'email', 'failed', error.message)
    }
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(notification: any, preferences: any) {
    try {
      // TODO: Implement push notification logic
      // This would integrate with your push notification service
      console.log('Sending push notification:', {
        userId: notification.user_id,
        title: notification.title,
        body: notification.content
      })

      await this.logDelivery(notification.id, notification.user_id, 'push', 'sent')
    } catch (error) {
      console.error('Error sending push notification:', error)
      await this.logDelivery(notification.id, notification.user_id, 'push', 'failed', error.message)
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(notification: any, preferences: any) {
    try {
      // TODO: Implement SMS sending logic
      // This would integrate with your SMS service (Twilio, etc.)
      console.log('Sending SMS notification:', {
        userId: notification.user_id,
        message: notification.content
      })

      await this.logDelivery(notification.id, notification.user_id, 'sms', 'sent')
    } catch (error) {
      console.error('Error sending SMS notification:', error)
      await this.logDelivery(notification.id, notification.user_id, 'sms', 'failed', error.message)
    }
  }

  /**
   * Log delivery attempt
   */
  private static async logDelivery(
    notificationId: string,
    userId: string,
    channel: string,
    status: string,
    errorMessage?: string
  ) {
    try {
      await supabase
        .from('notification_delivery_log')
        .insert({
          notification_id: notificationId,
          user_id: userId,
          channel,
          status,
          error_message: errorMessage,
          sent_at: status === 'sent' ? new Date().toISOString() : null
        })
    } catch (error) {
      console.error('Error logging delivery:', error)
    }
  }

  /**
   * Convenience methods for common notification types
   */
  static async sendLikeNotification(userId: string, likedByUserId: string, contentId: string, contentType: string, contentTitle: string) {
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', likedByUserId)
      .single()

    return this.createNotification({
      userId,
      type: 'like',
      title: `${user?.full_name || user?.username} liked your ${contentType}`,
      content: `${user?.full_name || user?.username} liked your ${contentType} "${contentTitle}"`,
      summary: `${user?.full_name || user?.username} liked your ${contentType}`,
      relatedUserId: likedByUserId,
      relatedContentId: contentId,
      relatedContentType: contentType,
      metadata: {
        contentTitle,
        contentType
      }
    })
  }

  static async sendCommentNotification(userId: string, commentedByUserId: string, contentId: string, contentType: string, commentText: string) {
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', commentedByUserId)
      .single()

    return this.createNotification({
      userId,
      type: 'comment',
      title: `${user?.full_name || user?.username} commented on your ${contentType}`,
      content: `${user?.full_name || user?.username} commented: "${commentText}" on your ${contentType}`,
      summary: `${user?.full_name || user?.username} commented on your ${contentType}`,
      relatedUserId: commentedByUserId,
      relatedContentId: contentId,
      relatedContentType: contentType,
      metadata: {
        commentText,
        contentType
      }
    })
  }

  static async sendFollowNotification(userId: string, followedByUserId: string) {
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', followedByUserId)
      .single()

    return this.createNotification({
      userId,
      type: 'follow',
      title: `${user?.full_name || user?.username} started following you`,
      content: `${user?.full_name || user?.username} started following you.`,
      summary: `${user?.full_name || user?.username} started following you`,
      relatedUserId: followedByUserId
    })
  }

  static async sendMessageNotification(userId: string, senderId: string, messagePreview: string) {
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', senderId)
      .single()

    return this.createNotification({
      userId,
      type: 'message',
      title: `New message from ${user?.full_name || user?.username}`,
      content: `${user?.full_name || user?.username} sent you a message: "${messagePreview}"`,
      summary: `New message from ${user?.full_name || user?.username}`,
      relatedUserId: senderId,
      priority: 'high'
    })
  }

  static async sendBookingRequestNotification(userId: string, requesterId: string, eventName: string, eventDate: string) {
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', requesterId)
      .single()

    return this.createNotification({
      userId,
      type: 'booking_request',
      title: 'New booking request',
      content: `${user?.full_name || user?.username} wants to book you for ${eventName} on ${eventDate}`,
      summary: `New booking request from ${user?.full_name || user?.username}`,
      relatedUserId: requesterId,
      priority: 'high',
      metadata: {
        eventName,
        eventDate
      }
    })
  }
} 