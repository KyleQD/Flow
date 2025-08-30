"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
}

export function AuthDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      diagnostics.push({
        name: 'Supabase URL',
        status: 'error',
        message: 'Missing NEXT_PUBLIC_SUPABASE_URL',
        details: 'This environment variable is required for authentication.'
      })
    } else if (!supabaseUrl.startsWith('https://')) {
      diagnostics.push({
        name: 'Supabase URL',
        status: 'warning',
        message: 'Invalid Supabase URL format',
        details: 'URL should start with https://'
      })
    } else {
      diagnostics.push({
        name: 'Supabase URL',
        status: 'success',
        message: 'Supabase URL is configured',
        details: supabaseUrl
      })
    }

    if (!supabaseAnonKey) {
      diagnostics.push({
        name: 'Supabase Anon Key',
        status: 'error',
        message: 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY',
        details: 'This environment variable is required for authentication.'
      })
    } else if (supabaseAnonKey.includes('your_anon_key') || supabaseAnonKey.includes('your_supabase_anon_key')) {
      diagnostics.push({
        name: 'Supabase Anon Key',
        status: 'error',
        message: 'Using placeholder anon key',
        details: 'Replace with your actual Supabase anon key from the dashboard.'
      })
    } else if (supabaseAnonKey.length < 50) {
      diagnostics.push({
        name: 'Supabase Anon Key',
        status: 'warning',
        message: 'Anon key appears to be invalid',
        details: 'Supabase anon keys are typically longer than 50 characters.'
      })
    } else {
      diagnostics.push({
        name: 'Supabase Anon Key',
        status: 'success',
        message: 'Supabase anon key is configured',
        details: `${supabaseAnonKey.substring(0, 20)}...`
      })
    }

    // Check if we can connect to Supabase
    if (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('your_anon_key')) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        })
        
        if (response.ok) {
          diagnostics.push({
            name: 'Supabase Connection',
            status: 'success',
            message: 'Successfully connected to Supabase',
            details: 'The API is responding correctly.'
          })
        } else {
          diagnostics.push({
            name: 'Supabase Connection',
            status: 'error',
            message: 'Failed to connect to Supabase',
            details: `HTTP ${response.status}: ${response.statusText}`
          })
        }
      } catch (error) {
        diagnostics.push({
          name: 'Supabase Connection',
          status: 'error',
          message: 'Network error connecting to Supabase',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Check browser environment
    if (typeof window !== 'undefined') {
      diagnostics.push({
        name: 'Browser Environment',
        status: 'success',
        message: 'Running in browser environment',
        details: 'Client-side authentication is available.'
      })
    } else {
      diagnostics.push({
        name: 'Browser Environment',
        status: 'info',
        message: 'Running in server environment',
        details: 'Some features may be limited.'
      })
    }

    setResults(diagnostics)
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950'
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-950'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'info':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
    }
  }

  const hasErrors = results.some(r => r.status === 'error')
  const hasWarnings = results.some(r => r.status === 'warning')

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Authentication Diagnostic
        </CardTitle>
        <CardDescription>
          Check your authentication configuration and identify issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </div>

        {hasErrors && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Critical issues found. Please fix these before attempting to sign up.
            </AlertDescription>
          </Alert>
        )}

        {hasWarnings && !hasErrors && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some warnings detected. Authentication may not work properly.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h4 className="font-medium">{result.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasErrors && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium mb-2">How to Fix:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Create a <code>.env.local</code> file in your project root</li>
              <li>Add your Supabase URL and anon key from the dashboard</li>
              <li>Restart your development server</li>
              <li>Run diagnostics again to verify</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
