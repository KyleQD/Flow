"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function NextJS15DebugPage() {
  const [clientSession, setClientSession] = useState<any>(null)
  const [browserCookies, setBrowserCookies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Get client-side session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw new Error(`Client error: ${error.message}`)
        }
        
        // Prepare session info
        setClientSession({
          exists: !!data.session,
          userId: data.session?.user?.id || null,
          email: data.session?.user?.email || null,
          expires: data.session?.expires_at 
            ? new Date(data.session.expires_at * 1000).toISOString()
            : null,
          accessToken: data.session?.access_token 
            ? `${data.session.access_token.substring(0, 10)}...` 
            : null,
        })
        
        // Get browser cookies
        const cookieString = document.cookie
        const cookies = cookieString ? cookieString.split(';').map(c => c.trim()) : []
        setBrowserCookies(cookies)
        
      } catch (err) {
        console.error("Error loading session data:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }
      
      // Manual refresh after token update
      window.location.reload()
    } catch (err) {
      console.error("Error refreshing session:", err)
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }
  
  const checkServerSession = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      alert(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("Error checking server session:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }
  
  const clearAllCookies = () => {
    try {
      setLoading(true)
      const cookies = document.cookie.split(";")
      
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
      
      window.location.reload()
    } catch (err) {
      console.error("Error clearing cookies:", err)
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Next.js 15 Session Debug</h1>
      <p className="text-gray-500 mb-6">Specialized session debugging for Next.js 15</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading session information...</div>
      ) : (
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Client-Side Session</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(clientSession, null, 2)}
            </pre>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Cookies</h2>
            {browserCookies.length === 0 ? (
              <div className="bg-yellow-100 p-3 rounded text-yellow-800">
                No cookies found for this domain.
              </div>
            ) : (
              <ul className="bg-gray-100 p-4 rounded overflow-auto list-disc pl-5 space-y-1">
                {browserCookies.map((cookie, i) => (
                  <li key={i} className="break-all">
                    {cookie}
                  </li>
                ))}
              </ul>
            )}
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={refreshSession}
                disabled={loading}
              >
                Refresh Session
              </Button>
              
              <Button 
                onClick={checkServerSession}
                disabled={loading}
                variant="outline"
              >
                Check Server Session
              </Button>
              
              <Button 
                onClick={clearAllCookies}
                disabled={loading}
                variant="destructive"
              >
                Clear All Cookies
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/login'} 
                variant="outline"
              >
                Go to Login
              </Button>
            </div>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Next.js Version Info</h2>
            <div className="space-y-2">
              <p><strong>Next.js:</strong> 15.x</p>
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>Hostname:</strong> {window.location.hostname}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  )
} 