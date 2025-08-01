'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { Check, Users, Heart, MessageCircle, UserPlus, RefreshCw, AlertCircle } from 'lucide-react'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'loading' | 'pending'
  message?: string
  data?: any
  timing?: number
}

export default function SocialTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const updateResult = (name: string, result: Partial<TestResult>) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name)
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, ...result } : r)
      } else {
        return [...prev, { name, status: 'pending', ...result }]
      }
    })
  }

  const testEndpoint = async (name: string, url: string, options: RequestInit = {}) => {
    const startTime = Date.now()
    updateResult(name, { status: 'loading' })

    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      })

      const timing = Date.now() - startTime
      
      if (!response.ok) {
        const errorText = await response.text()
        updateResult(name, {
          status: 'error',
          message: `${response.status}: ${errorText}`,
          timing
        })
        return null
      }

      const data = await response.json()
      updateResult(name, {
        status: 'success',
        message: 'Success',
        data,
        timing
      })
      return data
    } catch (error) {
      const timing = Date.now() - startTime
      updateResult(name, {
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        timing
      })
      return null
    }
  }

  const runAllTests = async () => {
    if (!user) {
      alert('Please log in first to run tests')
      return
    }

    setLoading(true)
    setResults([])

    try {
      // Test 1: Get suggested users
      await testEndpoint('Suggested Users API', '/api/social/suggested?limit=3')

      // Test 2: Get current user profile
      await testEndpoint('Current Profile API', '/api/profile/current')

      // Test 3: Test follow functionality (if there are other users)
      const suggestedUsers = await testEndpoint('Get Users for Follow Test', '/api/debug/profiles')
      
      if (suggestedUsers?.profiles?.length > 0) {
        const testUser = suggestedUsers.profiles.find((p: any) => p.id !== user.id)
        if (testUser) {
          // Test follow
          await testEndpoint('Follow User', '/api/social/follow', {
            method: 'POST',
            body: JSON.stringify({
              followingId: testUser.id,
              action: 'follow'
            })
          })

          // Test unfollow
          await testEndpoint('Unfollow User', '/api/social/follow', {
            method: 'POST',
            body: JSON.stringify({
              followingId: testUser.id,
              action: 'unfollow'
            })
          })
        }
      }

      // Test 4: Test posts API
      await testEndpoint('Feed Posts API', '/api/feed/posts?type=all&limit=5')

    } catch (error) {
      console.error('Test suite failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'loading': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <Check className="h-4 w-4 text-green-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'loading': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Social Media Functionality Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Authentication Status */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Badge variant="default">✅ Authenticated</Badge>
                  <span className="text-sm">{user.email}</span>
                </>
              ) : (
                <Badge variant="destructive">❌ Not authenticated</Badge>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex gap-4">
            <Button 
              onClick={runAllTests}
              disabled={loading || !user}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Run All Social Media Tests
                </>
              )}
            </Button>
            <Button 
              onClick={clearResults}
              disabled={loading}
              variant="ghost"
            >
              Clear
            </Button>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results</h3>
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.timing && (
                        <span className="text-xs">{result.timing}ms</span>
                      )}
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {result.message && (
                    <p className="text-sm mb-2">{result.message}</p>
                  )}
                  
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Show response data
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded border overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Test Summary */}
          {results.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">Summary</h3>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  ✅ Passed: {results.filter(r => r.status === 'success').length}
                </span>
                <span className="text-red-600">
                  ❌ Failed: {results.filter(r => r.status === 'error').length}
                </span>
                <span className="text-blue-600">
                  ⏳ Running: {results.filter(r => r.status === 'loading').length}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 