'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Dashboard Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-white">Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-400 text-center">
            We apologize for the inconvenience. Please try again.
          </p>
          {error.message && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-300 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={reset}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/dashboard'}
              className="w-full"
            >
              Go to Admin Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 