import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Show toast
    toast({
      title: notification.title,
      description: notification.description,
      duration: notification.duration,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    })

    // Auto remove after duration
    const duration = notification.duration || 5000
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const success = useCallback((title: string, description?: string, duration?: number) => {
    return addNotification({ type: 'success', title, description, duration })
  }, [addNotification])

  const error = useCallback((title: string, description?: string, duration?: number) => {
    return addNotification({ type: 'error', title, description, duration })
  }, [addNotification])

  const warning = useCallback((title: string, description?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, description, duration })
  }, [addNotification])

  const info = useCallback((title: string, description?: string, duration?: number) => {
    return addNotification({ type: 'info', title, description, duration })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  }
}

// API response handlers
export function useApiResponseHandler() {
  const { success, error } = useNotifications()

  const handleSuccess = useCallback((message: string, details?: string) => {
    success(message, details)
  }, [success])

  const handleError = useCallback((err: any, fallbackMessage = 'An error occurred') => {
    const message = err?.message || err?.error || fallbackMessage
    const details = err?.details ? 
      Array.isArray(err.details) ? 
        err.details.map((d: any) => d.message).join(', ') 
        : err.details 
      : undefined
    
    error(message, details)
  }, [error])

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await apiCall()
      if (successMessage) {
        handleSuccess(successMessage)
      }
      return result
    } catch (err) {
      handleError(err, errorMessage)
      return null
    }
  }, [handleSuccess, handleError])

  return {
    handleSuccess,
    handleError,
    handleApiCall,
  }
} 