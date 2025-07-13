'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export default function SuggestedUsersDebugPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const testSuggestedUsers = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Testing suggested users API...')
      
      // Test the suggested users endpoint
      const response = await fetch('/api/social/suggested?limit=5', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        throw new Error(`API request failed: ${response.status} - ${errorData}`)
      }
      
      const data = await response.json()
      console.log('✅ Success response:', data)
      setResult(data)
      
    } catch (err) {
      console.error('❌ Test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testDebugProfiles = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Testing debug profiles API...')
      
      const response = await fetch('/api/debug/profiles', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        throw new Error(`API request failed: ${response.status} - ${errorData}`)
      }
      
      const data = await response.json()
      console.log('✅ Success response:', data)
      setResult(data)
      
    } catch (err) {
      console.error('❌ Test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Suggested Users Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Authentication Status */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <p>User: {user ? `✅ ${user.email} (${user.id})` : '❌ Not authenticated'}</p>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={testSuggestedUsers}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Suggested Users API'}
            </Button>
            <Button 
              onClick={testDebugProfiles}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Debug Profiles API'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
} 