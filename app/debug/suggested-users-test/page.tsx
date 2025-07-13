'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { Check, UserPlus, RefreshCw, AlertCircle, Users } from 'lucide-react'
import Link from 'next/link'

interface SuggestedUser {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  is_verified: boolean
  followers_count: number
  following_count: number
}

interface TestResult {
  endpoint: string
  status: 'success' | 'error' | 'loading'
  data?: any
  error?: string
  timing?: number
}

export default function SuggestedUsersTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const { user } = useAuth()

  const getProfileUrl = (username: string) => {
    if (!username) return '/profile/user'
    return `/profile/${username}`
  }

  const testEndpoint = async (endpoint: string, options: RequestInit = {}) => {
    const startTime = Date.now()
    const testResult: TestResult = {
      endpoint,
      status: 'loading'
    }

    setResults(prev => [...prev.filter(r => r.endpoint !== endpoint), testResult])

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      })

      const timing = Date.now() - startTime
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${response.status}: ${errorText}`)
      }

      const data = await response.json()
      
      setResults(prev => [...prev.filter(r => r.endpoint !== endpoint), {
        endpoint,
        status: 'success',
        data,
        timing
      }])

      return data
    } catch (error) {
      const timing = Date.now() - startTime
      setResults(prev => [...prev.filter(r => r.endpoint !== endpoint), {
        endpoint,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timing
      }])
      throw error
    }
  }

  const testSuggestedUsers = async () => {
    setLoading(true)
    try {
      const data = await testEndpoint('/api/social/suggested?limit=5')
      setSuggestedUsers(data.users || [])
    } catch (error) {
      console.error('Suggested users test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAllEndpoints = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // Test multiple endpoints
      await Promise.all([
        testEndpoint('/api/social/suggested?limit=5'),
        testEndpoint('/api/debug/profiles'),
        testEndpoint('/api/profile/current')
      ])
    } catch (error) {
      console.error('Batch test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setSuggestedUsers([])
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Suggested Users Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
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

            {/* Test Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={testSuggestedUsers}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Test Suggested Users
                  </>
                )}
              </Button>
              <Button 
                onClick={testAllEndpoints}
                disabled={loading}
                variant="outline"
              >
                Test All APIs
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
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results</h3>
                {results.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    result.status === 'success' ? 'bg-green-50 border-green-200' :
                    result.status === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono">{result.endpoint}</code>
                      <div className="flex items-center gap-2">
                        {result.timing && (
                          <span className="text-xs text-gray-500">{result.timing}ms</span>
                        )}
                        {result.status === 'success' && <Badge variant="default">✅ Success</Badge>}
                        {result.status === 'error' && <Badge variant="destructive">❌ Error</Badge>}
                        {result.status === 'loading' && <Badge variant="outline">⏳ Loading</Badge>}
                      </div>
                    </div>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer">Show data</summary>
                        <pre className="text-xs mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Users Display */}
        <Card>
          <CardHeader>
            <CardTitle>Suggested Users Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {suggestedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No suggested users found</p>
                <p className="text-sm">Run the test to fetch suggested users</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestedUsers.map((suggestedUser) => (
                  <div key={suggestedUser.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Link href={getProfileUrl(suggestedUser.username)} className="flex-shrink-0">
                      <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all duration-200">
                        <AvatarImage src={suggestedUser.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {suggestedUser.full_name?.[0] || suggestedUser.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={getProfileUrl(suggestedUser.username)} className="hover:underline">
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {suggestedUser.full_name || suggestedUser.username}
                          </span>
                        </Link>
                        {suggestedUser.is_verified && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>@{suggestedUser.username}</span>
                        <span>{suggestedUser.followers_count} followers</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 