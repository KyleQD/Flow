"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
  action?: React.ReactNode
}

interface ToastContextType {
  toasts: Toast[]
  toast: (options: {
    title: string
    description?: string
    variant?: "default" | "destructive" | "success"
    duration?: number
    action?: React.ReactNode
  }) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 5000,
      action,
    }: {
      title: string
      description?: string
      variant?: "default" | "destructive" | "success"
      duration?: number
      action?: React.ReactNode
    }) => {
      const id = Math.random().toString(36).substring(2, 9)

      setToasts((prevToasts) => [
        ...prevToasts,
        {
          id,
          title,
          description,
          variant,
          action,
        },
      ])

      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
      }, duration)

      return id
    },
    [],
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    // Return a default implementation if used outside provider
    return {
      toasts: [],
      toast: () => "",
      dismiss: () => {},
    }
  }

  return context
}
