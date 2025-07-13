"use client"

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.resetError} 
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto">
        <Card className="bg-slate-900/50 border-red-500/50 max-w-2xl mx-auto mt-20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-red-500/20">
                <AlertTriangle className="h-12 w-12 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-sm font-mono text-slate-300 break-all">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-slate-400">
                We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={resetError}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6">
                <summary className="cursor-pointer text-slate-400 hover:text-white">
                  View Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-slate-800/50 rounded-lg text-xs text-slate-300 overflow-auto border border-slate-700/50">
                  {error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook for throwing errors in functional components
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
} 