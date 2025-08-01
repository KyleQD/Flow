"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// =============================================================================
// TYPES
// =============================================================================

interface Message {
  id: string
  channel_id: string
  sender_id: string
  content: string
  message_type: string
  priority: string
  thread_id?: string
  attachments?: any[]
  mentions?: string[]
  reactions?: Record<string, any>
  is_edited: boolean
  is_deleted: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  sender?: {
    id: string
    display_name: string
    role: string
  }
}

interface Announcement {
  id: string
  title: string
  content: string
  announcement_type: string
  priority: string
  target_audience: string[]
  tour_id?: string
  event_id?: string
  venue_id?: string
  expires_at?: string
  is_published: boolean
  created_by: string
  created_at: string
  created_by_profile?: {
    id: string
    display_name: string
    role: string
  }
}

interface Channel {
  id: string
  name: string
  description?: string
  channel_type: string
  is_public: boolean
  is_archived: boolean
  created_at: string
}

interface CommunicationState {
  messages: Message[]
  announcements: Announcement[]
  channels: Channel[]
  onlineUsers: string[]
  isConnected: boolean
  lastUpdate?: Date
}

interface UseRealTimeCommunicationsOptions {
  channelIds?: string[]
  tourId?: string
  eventId?: string
  venueId?: string
  enablePresence?: boolean
  autoReconnect?: boolean
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useRealTimeCommunications(options: UseRealTimeCommunicationsOptions = {}) {
  const {
    channelIds = [],
    tourId,
    eventId,
    venueId,
    enablePresence = true,
    autoReconnect = true
  } = options

  // State
  const [state, setState] = useState<CommunicationState>({
    messages: [],
    announcements: [],
    channels: [],
    onlineUsers: [],
    isConnected: false
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refs for managing subscriptions
  const subscriptionsRef = useRef<RealtimeChannel[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize Supabase client
  const supabase = createClient()

  // =============================================================================
  // SUBSCRIPTION MANAGEMENT
  // =============================================================================

  const setupSubscriptions = useCallback(async () => {
    try {
      // Clear existing subscriptions
      subscriptionsRef.current.forEach(channel => {
        supabase.removeChannel(channel)
      })
      subscriptionsRef.current = []

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Subscribe to messages in specified channels
      if (channelIds.length > 0) {
        const messagesChannel = supabase
          .channel('messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `channel_id=in.(${channelIds.join(',')})`
            },
            (payload) => {
              const newMessage = payload.new as Message
              setState(prev => ({
                ...prev,
                messages: [newMessage, ...prev.messages.slice(0, 99)], // Keep last 100 messages
                lastUpdate: new Date()
              }))
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'messages',
              filter: `channel_id=in.(${channelIds.join(',')})`
            },
            (payload) => {
              const updatedMessage = payload.new as Message
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === updatedMessage.id ? updatedMessage : msg
                ),
                lastUpdate: new Date()
              }))
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'messages',
              filter: `channel_id=in.(${channelIds.join(',')})`
            },
            (payload) => {
              const deletedMessage = payload.old as Message
              setState(prev => ({
                ...prev,
                messages: prev.messages.filter(msg => msg.id !== deletedMessage.id),
                lastUpdate: new Date()
              }))
            }
          )

        subscriptionsRef.current.push(messagesChannel)
      }

      // Subscribe to announcements
      let announcementFilter = 'is_published=eq.true'
      if (tourId) announcementFilter += `,tour_id=eq.${tourId}`
      if (eventId) announcementFilter += `,event_id=eq.${eventId}`
      if (venueId) announcementFilter += `,venue_id=eq.${venueId}`

      const announcementsChannel = supabase
        .channel('announcements')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'announcements',
            filter: announcementFilter
          },
          (payload) => {
            const newAnnouncement = payload.new as Announcement
            setState(prev => ({
              ...prev,
              announcements: [newAnnouncement, ...prev.announcements],
              lastUpdate: new Date()
            }))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'announcements',
            filter: announcementFilter
          },
          (payload) => {
            const updatedAnnouncement = payload.new as Announcement
            setState(prev => ({
              ...prev,
              announcements: prev.announcements.map(ann => 
                ann.id === updatedAnnouncement.id ? updatedAnnouncement : ann
              ),
              lastUpdate: new Date()
            }))
          }
        )

      subscriptionsRef.current.push(announcementsChannel)

      // Subscribe to channels
      const channelsChannel = supabase
        .channel('channels')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'communication_channels'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newChannel = payload.new as Channel
              setState(prev => ({
                ...prev,
                channels: [...prev.channels, newChannel],
                lastUpdate: new Date()
              }))
            } else if (payload.eventType === 'UPDATE') {
              const updatedChannel = payload.new as Channel
              setState(prev => ({
                ...prev,
                channels: prev.channels.map(ch => 
                  ch.id === updatedChannel.id ? updatedChannel : ch
                ),
                lastUpdate: new Date()
              }))
            } else if (payload.eventType === 'DELETE') {
              const deletedChannel = payload.old as Channel
              setState(prev => ({
                ...prev,
                channels: prev.channels.filter(ch => ch.id !== deletedChannel.id),
                lastUpdate: new Date()
              }))
            }
          }
        )

      subscriptionsRef.current.push(channelsChannel)

      // Set up presence tracking if enabled
      if (enablePresence) {
        const presenceChannel = supabase
          .channel('presence', {
            config: {
              presence: {
                key: user.id
              }
            }
          })
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState()
            const onlineUsers = Object.keys(state)
            setState(prev => ({
              ...prev,
              onlineUsers,
              lastUpdate: new Date()
            }))
          })
          .on('presence', { event: 'join' }, ({ key }) => {
            setState(prev => ({
              ...prev,
              onlineUsers: [...new Set([...prev.onlineUsers, key])],
              lastUpdate: new Date()
            }))
          })
          .on('presence', { event: 'leave' }, ({ key }) => {
            setState(prev => ({
              ...prev,
              onlineUsers: prev.onlineUsers.filter(id => id !== key),
              lastUpdate: new Date()
            }))
          })

        // Track user presence
        presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString()
        })

        subscriptionsRef.current.push(presenceChannel)
      }

      // Subscribe to all channels
      await Promise.all(subscriptionsRef.current.map(channel => channel.subscribe()))

      setState(prev => ({ ...prev, isConnected: true }))
      setError(null)

    } catch (err) {
      console.error('Error setting up real-time subscriptions:', err)
      setError(err instanceof Error ? err.message : 'Connection error')
      setState(prev => ({ ...prev, isConnected: false }))

      // Auto-reconnect if enabled
      if (autoReconnect && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = undefined
          setupSubscriptions()
        }, 5000)
      }
    }
  }, [channelIds, tourId, eventId, venueId, enablePresence, autoReconnect, supabase])

  // =============================================================================
  // EFFECT HOOKS
  // =============================================================================

  useEffect(() => {
    setIsLoading(true)
    setupSubscriptions().finally(() => setIsLoading(false))

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(channel => {
        supabase.removeChannel(channel)
      })
      
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [setupSubscriptions])

  // =============================================================================
  // ACTION METHODS
  // =============================================================================

  const sendMessage = useCallback(async (channelId: string, content: string, options: {
    messageType?: string
    priority?: string
    threadId?: string
    mentions?: string[]
    attachments?: any[]
  } = {}) => {
    try {
      const response = await fetch('/api/admin/communications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          content,
          message_type: options.messageType || 'text',
          priority: options.priority || 'general',
          thread_id: options.threadId,
          mentions: options.mentions,
          attachments: options.attachments
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      console.error('Error sending message:', err)
      throw err
    }
  }, [])

  const createAnnouncement = useCallback(async (announcement: {
    title: string
    content: string
    announcementType?: string
    priority?: string
    targetAudience?: string[]
    tourId?: string
    eventId?: string
    venueId?: string
  }) => {
    try {
      const response = await fetch('/api/admin/communications/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcement.title,
          content: announcement.content,
          announcement_type: announcement.announcementType || 'general',
          priority: announcement.priority || 'important',
          target_audience: announcement.targetAudience || [],
          tour_id: announcement.tourId,
          event_id: announcement.eventId,
          venue_id: announcement.venueId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create announcement')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      console.error('Error creating announcement:', err)
      throw err
    }
  }, [])

  const acknowledgeAnnouncement = useCallback(async (announcementId: string, note?: string) => {
    try {
      const response = await fetch(`/api/admin/communications/announcements/${announcementId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      })

      if (!response.ok) {
        throw new Error('Failed to acknowledge announcement')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      console.error('Error acknowledging announcement:', err)
      throw err
    }
  }, [])

  const reconnect = useCallback(() => {
    setState(prev => ({ ...prev, isConnected: false }))
    setupSubscriptions()
  }, [setupSubscriptions])

  // =============================================================================
  // RETURN HOOK INTERFACE
  // =============================================================================

  return {
    // State
    ...state,
    isLoading,
    error,

    // Actions
    sendMessage,
    createAnnouncement,
    acknowledgeAnnouncement,
    reconnect,

    // Utility methods
    getChannelMessages: (channelId: string) => 
      state.messages.filter(msg => msg.channel_id === channelId),
    
    getUnreadCount: (channelId: string) => 
      state.messages.filter(msg => 
        msg.channel_id === channelId && 
        new Date(msg.created_at) > new Date() // This would need proper last_read tracking
      ).length,

    getPriorityMessages: (priority: string) =>
      state.messages.filter(msg => msg.priority === priority),

    getActiveAnnouncements: () =>
      state.announcements.filter(ann => 
        ann.is_published && 
        (!ann.expires_at || new Date(ann.expires_at) > new Date())
      )
  }
}

// =============================================================================
// UTILITY HOOK FOR SIMPLE MESSAGE LISTENING
// =============================================================================

export function useChannelMessages(channelId: string) {
  const { messages, isConnected, sendMessage } = useRealTimeCommunications({
    channelIds: [channelId]
  })

  const channelMessages = messages.filter(msg => msg.channel_id === channelId)

  return {
    messages: channelMessages,
    isConnected,
    sendMessage: (content: string, options?: any) => sendMessage(channelId, content, options)
  }
}

// =============================================================================
// UTILITY HOOK FOR ANNOUNCEMENTS
// =============================================================================

export function useAnnouncements(options: {
  tourId?: string
  eventId?: string
  venueId?: string
} = {}) {
  const { announcements, isConnected, createAnnouncement, acknowledgeAnnouncement } = 
    useRealTimeCommunications(options)

  const activeAnnouncements = announcements.filter(ann => 
    ann.is_published && 
    (!ann.expires_at || new Date(ann.expires_at) > new Date())
  )

  const emergencyAnnouncements = activeAnnouncements.filter(ann => ann.priority === 'emergency')
  const urgentAnnouncements = activeAnnouncements.filter(ann => ann.priority === 'urgent')

  return {
    announcements: activeAnnouncements,
    emergencyAnnouncements,
    urgentAnnouncements,
    isConnected,
    createAnnouncement,
    acknowledgeAnnouncement
  }
}