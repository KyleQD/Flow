"use client"

import type React from "react"

import { useState, useCallback } from "react"

type ToastVariant = "default" | "destructive" | "success"

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  action?: React.ReactNode
}

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = "default", duration = 5000, action }: ToastOptions) => {
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
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}
