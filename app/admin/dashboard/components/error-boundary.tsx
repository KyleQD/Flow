"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft, 
  Bug, 
  Copy, 
  Download,
  Send,
  Eye,
  EyeOff,
  X,
  Info,
  CheckCircle,
  Clock
} from "lucide-react"
import { toast } from "sonner"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
  isReporting: boolean
  reported: boolean
  retryCount: number
  lastErrorTime: number | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  maxRetries?: number
  retryDelay?: number
  enableReporting?: boolean
  enableRecovery?: boolean
  className?: string
}

interface ErrorReport {
  error: string
  stack: string
  componentStack: string
  url: string
  userAgent: string
  timestamp: number
  userId?: string
  sessionId?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null
  private errorCount = 0
  private readonly maxErrors = 5
  private readonly errorWindow = 60000 // 1 minute

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isReporting: false,
      reported: false,
      retryCount: 0,
      lastErrorTime: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorCount++
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Check if we should prevent further errors
    if (this.errorCount > this.maxErrors) {
      this.setState({
        showDetails: true,
        hasError: true
      })
      return
    }

    // Auto-retry for certain types of errors
    if (this.shouldRetry(error)) {
      this.scheduleRetry()
    }

    // Report error if enabled
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo)
    }
  }

  private shouldRetry(error: Error): boolean {
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'ChunkLoadError',
      'Loading chunk failed'
    ]

    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError) || 
      error.name.includes(retryableError)
    )
  }

  private scheduleRetry() {
    const { maxRetries = 3, retryDelay = 2000 } = this.props
    const { retryCount } = this.state

    if (retryCount < maxRetries) {
      this.retryTimeout = setTimeout(() => {
        this.setState(prev => ({ retryCount: prev.retryCount + 1 }))
        this.resetError()
      }, retryDelay * (retryCount + 1)) // Exponential backoff
    }
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    if (this.state.isReporting || this.state.reported) return

    this.setState({ isReporting: true })

    try {
      const errorReport: ErrorReport = {
        error: error.message,
        stack: error.stack || '',
        componentStack: errorInfo.componentStack || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.getUserId(),
        sessionId: this.getSessionId()
      }

      // Send error report to server
      await fetch('/api/admin/error-reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      })

      this.setState({ reported: true })
      toast.success('Error reported successfully')
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
      toast.error('Failed to report error')
    } finally {
      this.setState({ isReporting: false })
    }
  }

  private getUserId(): string | undefined {
    // Get user ID from localStorage, context, or other sources
    return localStorage.getItem('userId') || undefined
  }

  private getSessionId(): string | undefined {
    // Get session ID from localStorage or generate one
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    })

    this.props.onReset?.()
  }

  private goHome = () => {
    window.location.href = '/admin/dashboard'
  }

  private goBack = () => {
    window.history.back()
  }

  private copyErrorDetails = () => {
    const { error, errorInfo } = this.state
    if (!error) return

    const errorText = `
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim()

    navigator.clipboard.writeText(errorText)
    toast.success('Error details copied to clipboard')
  }

  private downloadErrorReport = () => {
    const { error, errorInfo } = this.state
    if (!error) return

    const errorReport = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(errorReport, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Error report downloaded')
  }

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    const { 
      hasError, 
      error, 
      errorInfo, 
      showDetails, 
      isReporting, 
      reported, 
      retryCount 
    } = this.state

    const { 
      children, 
      fallback, 
      maxRetries = 3, 
      enableReporting = true,
      enableRecovery = true,
      className = ""
    } = this.props

    if (!hasError) {
      return children
    }

    if (fallback) {
      return fallback
    }

    const isRetryable = this.shouldRetry(error!)
    const canRetry = retryCount < maxRetries && isRetryable

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-red-900/20 border-red-700/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-red-400">Something went wrong</CardTitle>
                  <p className="text-red-300 text-sm">
                    {isRetryable ? 'Network or loading error detected' : 'An unexpected error occurred'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Message */}
              <div className="bg-red-950/50 rounded-lg p-4">
                <p className="text-red-200 font-medium">{error?.message}</p>
                {error?.name && (
                  <Badge variant="outline" className="mt-2 bg-red-500/20 text-red-300 border-red-500/30">
                    {error.name}
                  </Badge>
                )}
              </div>

              {/* Error Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-900/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-300">Error Details</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={this.copyErrorDetails}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={this.downloadErrorReport}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {error?.stack && (
                        <div>
                          <p className="text-xs font-medium text-slate-400 mb-1">Stack Trace:</p>
                          <pre className="text-xs text-slate-300 bg-slate-800/50 p-2 rounded overflow-auto max-h-32">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <div>
                          <p className="text-xs font-medium text-slate-400 mb-1">Component Stack:</p>
                          <pre className="text-xs text-slate-300 bg-slate-800/50 p-2 rounded overflow-auto max-h-32">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {enableRecovery && (
                  <>
                    <Button
                      onClick={this.resetError}
                      disabled={!canRetry}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {canRetry ? `Retry (${retryCount + 1}/${maxRetries})` : 'Retry Failed'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={this.goBack}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={this.goHome}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={this.toggleDetails}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  {showDetails ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Details
                    </>
                  )}
                </Button>

                {enableReporting && (
                  <Button
                    variant="outline"
                    onClick={() => this.reportError(error!, errorInfo!)}
                    disabled={isReporting || reported}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    {isReporting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Reporting...
                      </>
                    ) : reported ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reported
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Report Error
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Info className="h-3 w-3" />
                <span>
                  {isRetryable 
                    ? 'This appears to be a temporary network or loading issue. You can retry or navigate to a different page.'
                    : 'This is an unexpected error. Please try refreshing the page or contact support if the problem persists.'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    resetError,
    hasError: !!error
  }
} 