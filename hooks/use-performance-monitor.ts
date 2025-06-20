"use client"

import { useState, useEffect } from "react"

interface PerformanceMetrics {
  fps: number
  memory: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null
  loadTime: number
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: null,
    loadTime: 0,
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    // Calculate FPS
    const measureFPS = () => {
      const currentTime = performance.now()
      const delta = currentTime - lastTime

      if (delta >= 1000) {
        setMetrics((prev) => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / delta),
        }))
        frameCount = 0
        lastTime = currentTime
      }

      frameCount++
      animationFrameId = requestAnimationFrame(measureFPS)
    }

    // Get memory usage if available
    const getMemoryUsage = () => {
      if (performance && (performance as any).memory) {
        const memory = (performance as any).memory
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        }
      }
      return null
    }

    // Calculate page load time
    const loadTime = performance.timing
      ? performance.timing.loadEventEnd - performance.timing.navigationStart
      : 0

    setMetrics((prev) => ({
      ...prev,
      memory: getMemoryUsage(),
      loadTime,
    }))

    measureFPS()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return metrics
} 