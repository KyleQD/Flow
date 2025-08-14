"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TestArtistApiPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testApiCall = async (identifier: string, apiType: 'profile' | 'artist' = 'profile') => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const endpoint = apiType === 'artist' 
        ? `/api/artist/${encodeURIComponent(identifier)}`
        : `/api/profile/${encodeURIComponent(identifier)}`

      console.log(`Testing API call: ${endpoint}`)
      const response = await fetch(endpoint)
      
      console.log(`Response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        setResult(data)
      } else {
        const errorText = await response.text()
        setError(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (err) {
      console.error('API test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test Artist API</h1>
          <p className="text-slate-400">Test the profile API to see what's being returned</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={() => testApiCall('Kyle', 'profile')}
                disabled={loading}
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test /api/profile/Kyle
              </Button>
              
              <Button 
                onClick={() => testApiCall('felix', 'artist')}
                disabled={loading}
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test /api/artist/felix
              </Button>
              
              <Button 
                onClick={() => testApiCall('Felix', 'artist')}
                disabled={loading}
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test /api/artist/Felix
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-red-300 text-sm overflow-auto">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-400">API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Account Type:</h3>
                  <p className="text-slate-300">{result.profile?.account_type}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Username:</h3>
                  <p className="text-slate-300">{result.profile?.username}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Profile Data:</h3>
                  <pre className="text-slate-300 text-sm bg-slate-800 p-4 rounded overflow-auto">
                    {JSON.stringify(result.profile?.profile_data, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Full Response:</h3>
                  <pre className="text-slate-300 text-sm bg-slate-800 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
