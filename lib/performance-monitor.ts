/**
 * Performance Monitoring & Analytics for Production
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  userId?: string
  sessionId: string
  metadata?: Record<string, any>
}

interface ErrorReport {
  error: Error | string
  context: string
  userId?: string
  sessionId: string
  timestamp: number
  stack?: string
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private errors: ErrorReport[] = []
  private sessionId: string
  private batchSize = 50
  private flushInterval = 30000 // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupPerformanceObserver()
    this.setupErrorHandling()
    this.startBatchFlush()
  }

  private generateSessionId(): string {
    return crypto.randomUUID?.() || `session_${Date.now()}_${Math.random()}`
  }

  private setupPerformanceObserver() {
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals - simplified for type safety
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const anyEntry = entry as any
        const value = anyEntry.value || anyEntry.duration || 0
        
        this.recordMetric({
          name: entry.name,
          value,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          metadata: {
            entryType: entry.entryType,
            startTime: entry.startTime
          }
        })
      }
    })

    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] })
    } catch (e) {
      console.warn('Performance Observer not supported:', e)
    }
  }

  private setupErrorHandling() {
    if (typeof window === 'undefined') return

    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordError({
        error: event.error || event.message,
        context: 'Global Error',
        sessionId: this.sessionId,
        timestamp: Date.now(),
        stack: event.error?.stack,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        error: event.reason,
        context: 'Unhandled Promise Rejection',
        sessionId: this.sessionId,
        timestamp: Date.now(),
        metadata: {
          type: 'unhandledrejection'
        }
      })
    })
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics()
    }
  }

  recordError(error: ErrorReport) {
    this.errors.push(error)
    console.error('[Performance Monitor] Error recorded:', error)
    
    if (this.errors.length >= 10) {
      this.flushErrors()
    }
  }

  // Custom performance tracking
  startTiming(name: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric({
        name: `custom_${name}`,
        value: duration,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        metadata: { type: 'custom_timing' }
      })
    }
  }

  // Track user interactions
  trackInteraction(action: string, metadata?: Record<string, any>) {
    this.recordMetric({
      name: `interaction_${action}`,
      value: 1,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata: { type: 'user_interaction', ...metadata }
    })
  }

  // Track API calls
  trackApiCall(endpoint: string, duration: number, status: number, metadata?: Record<string, any>) {
    this.recordMetric({
      name: `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`,
      value: duration,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata: {
        type: 'api_call',
        endpoint,
        status,
        ...metadata
      }
    })
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return

    const batch = [...this.metrics]
    this.metrics = []

    try {
      await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: batch })
      })
    } catch (error) {
      console.error('Failed to flush metrics:', error)
      // Re-add failed metrics for retry
      this.metrics.unshift(...batch.slice(-10)) // Keep last 10 for retry
    }
  }

  private async flushErrors() {
    if (this.errors.length === 0) return

    const batch = [...this.errors]
    this.errors = []

    try {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: batch })
      })
    } catch (error) {
      console.error('Failed to flush errors:', error)
    }
  }

  private startBatchFlush() {
    setInterval(() => {
      this.flushMetrics()
      this.flushErrors()
    }, this.flushInterval)
  }

  // Public method to force flush (useful for page unload)
  flush() {
    this.flushMetrics()
    this.flushErrors()
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Hook for React components
export function usePerformanceTracking() {
  const trackTiming = (name: string) => performanceMonitor.startTiming(name)
  const trackInteraction = (action: string, metadata?: Record<string, any>) => 
    performanceMonitor.trackInteraction(action, metadata)
  
  return { trackTiming, trackInteraction }
} 