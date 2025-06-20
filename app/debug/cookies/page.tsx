"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function CookieDebugPage() {
  const [cookies, setCookies] = useState<string[]>([])
  const [clientSession, setClientSession] = useState<any>(null)
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
        
        setClientSession({
          exists: !!data.session,
          userId: data.session?.user?.id || null,
          email: data.session?.user?.email || null,
          expires: data.session?.expires_at 
            ? new Date(data.session.expires_at * 1000).toISOString()
            : null
        })
        
        // Parse document cookies
        const rawCookies = document.cookie.split(';')
        const parsedCookies = rawCookies.map(cookie => cookie.trim())
        setCookies(parsedCookies)
      } catch (err) {
        console.error("Error loading data:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error("Error refreshing session:", err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  
  const clearAllCookies = () => {
    try {
      const cookies = document.cookie.split(";")
      
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
      
      alert("All cookies cleared. Refreshing page...")
      window.location.reload()
    } catch (err) {
      console.error("Error clearing cookies:", err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Cookie & Session Debug</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Client-Side Session</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(clientSession, null, 2)}
            </pre>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Cookies</h2>
            {cookies.length === 0 ? (
              <div className="bg-yellow-100 p-4 rounded text-yellow-800">
                No cookies found in this browser for this domain.
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded overflow-auto">
                <ul className="list-disc pl-5 space-y-2">
                  {cookies.map((cookie, index) => (
                    <li key={index}>{cookie}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button onClick={refreshSession}>
                Refresh Session
              </Button>
              <Button variant="destructive" onClick={clearAllCookies}>
                Clear All Cookies
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/debug/session"}>
                View Session Debug
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
            </div>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Info</h2>
            <div className="space-y-2">
              <p>
                <strong>URL:</strong> {window.location.href}
              </p>
              <p>
                <strong>Hostname:</strong> {window.location.hostname}
              </p>
              <p>
                <strong>User Agent:</strong> {navigator.userAgent}
              </p>
              <p>
                <strong>Time:</strong> {new Date().toISOString()}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  )
} 