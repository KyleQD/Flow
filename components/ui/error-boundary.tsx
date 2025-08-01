"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// =============================================================================
// ERROR BOUNDARY TYPES
// =============================================================================

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

// =============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// =============================================================================

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent" />
          </div>
          
          <Card className="relative z-10 w-full max-w-lg bg-slate-800/50 border-red-700/50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">Something went wrong</CardTitle>
              <CardDescription className="text-slate-400">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Details (if enabled) */}
              {this.props.showDetails && this.state.error && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bug className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Error Details</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    <p className="font-semibold text-red-400 mb-1">{this.state.error.name}</p>
                    <p className="break-all">{this.state.error.message}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack.slice(0, 500)}
                        {this.state.errorInfo.componentStack.length > 500 && '...'}
                      </pre>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              {/* Report Issue */}
              <div className="text-center text-sm text-slate-400">
                <p>
                  If this problem persists, please{' '}
                  <button 
                    onClick={() => window.open('mailto:support@tourify.com?subject=Error Report')}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    contact support
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// =============================================================================
// FUNCTIONAL ERROR BOUNDARY WRAPPER
// =============================================================================

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />
}

// =============================================================================
// SPECIALIZED ERROR COMPONENTS
// =============================================================================

// Simple error message component
export function ErrorMessage({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  className = ""
}: {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {message && (
        <p className="text-slate-400 mb-4 max-w-md">{message}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}

// Network error component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  )
}

// Not found error component
export function NotFoundError({ 
  resource = "page",
  onGoBack 
}: { 
  resource?: string
  onGoBack?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-400">404</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found
      </h3>
      <p className="text-slate-400 mb-4 max-w-md">
        The {resource} you're looking for doesn't exist or has been moved.
      </p>
      {onGoBack && (
        <Button onClick={onGoBack} variant="outline" size="sm">
          <Home className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      )}
    </div>
  )
}

// Unauthorized error component
export function UnauthorizedError({ onSignIn }: { onSignIn?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
      <p className="text-slate-400 mb-4 max-w-md">
        You don't have permission to access this resource. Please sign in or contact an administrator.
      </p>
      {onSignIn && (
        <Button onClick={onSignIn} size="sm">
          Sign In
        </Button>
      )}
    </div>
  )
}

// Generic error handler hook
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error)
    
    // You can integrate with error reporting services here
    // e.g., Sentry, LogRocket, etc.
  }

  return { handleError }
}

// Export the class component as well for direct use
export { ErrorBoundaryClass }