"use client"

import type React from "react"
import { Suspense, lazy, type ComponentType } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface LazyComponentProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>
  props?: Record<string, any>
  fallback?: React.ReactNode
}

export function LazyComponent({
  importFunc,
  props = {},
  fallback = (
    <div className="p-4 flex justify-center">
      <LoadingSpinner />
    </div>
  ),
}: LazyComponentProps) {
  const LazyComponent = lazy(importFunc)

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}
