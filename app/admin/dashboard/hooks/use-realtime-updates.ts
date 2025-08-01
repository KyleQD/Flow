"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface RealtimeEvent {
  type: string
  data: any
  timestamp: number
  id: string
}

interface RealtimeOptions {
  url?: string
  enabled?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onMessage?: (event: RealtimeEvent) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

interface RealtimeState {
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  lastMessage: RealtimeEvent | null
  error: string | null
}

// Main real-time updates hook - DISABLED to prevent infinite loops
export function useRealtimeUpdates(options: RealtimeOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws',
    enabled = false, // Always disabled to prevent connection issues
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options

  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    lastMessage: null,
    error: null
  })

  // Mock functions that don't actually connect
  const connect = useCallback(() => {
    console.log('[Realtime] Connection disabled for stability')
  }, [])

  const disconnect = useCallback(() => {
    console.log('[Realtime] Disconnection disabled for stability')
  }, [])

  const sendMessage = useCallback((message: any) => {
    console.log('[Realtime] Message sending disabled:', message)
  }, [])

  const subscribe = useCallback((channel: string, callback?: (data: any) => void) => {
    console.log('[Realtime] Subscription disabled for channel:', channel)
    // Return a no-op unsubscribe function
    return () => {
      console.log('[Realtime] Unsubscription disabled for channel:', channel)
    }
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    subscribe
  }
}

// Simplified specialized hooks that don't use real-time updates
export function useDashboardRealtime() {
  const [dashboardUpdates, setDashboardUpdates] = useState<any[]>([])

  // Mock real-time connection - always returns false
  const isConnected = false

  return {
    isConnected,
    dashboardUpdates
  }
}

export function useEventsRealtime() {
  const [eventUpdates, setEventUpdates] = useState<any[]>([])

  // Mock real-time connection - always returns false
  const isConnected = false

  return {
    isConnected,
    eventUpdates
  }
}

export function useNotificationsRealtime() {
  const [notifications, setNotifications] = useState<any[]>([])

  // Mock real-time connection - always returns false
  const isConnected = false

  return {
    isConnected,
    notifications
  }
}

export function useLiveEventsRealtime() {
  const [liveEvents, setLiveEvents] = useState<any[]>([])

  // Mock real-time connection - always returns false
  const isConnected = false

  return {
    isConnected,
    liveEvents
  }
} 