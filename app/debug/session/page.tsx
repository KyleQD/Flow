"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function SessionDebugPage() {
  const [clientSession, setClientSession] = useState<any>(null)
  const [apiSession, setApiSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Get client-side session
        const { data: clientData, error: clientError } = await supabase.auth.getSession()
        
        if (clientError) {
          throw new Error(`Client error: ${clientError.message}`)
        }
        
        setClientSession({
          exists: !!clientData.session,
          userId: clientData.session?.user?.id || null,
          email: clientData.session?.user?.email || null,
          expires: clientData.session?.expires_at 
            ? new Date(clientData.session.expires_at * 1000).toISOString()
            : null
        })
        
        // Get server-side session
        const apiRes = await fetch('/api/auth/session')
        if (!apiRes.ok) {
          throw new Error(`API error: ${apiRes.status} ${apiRes.statusText}`)
        }
        
        const apiData = await apiRes.json()
        setApiSession(apiData)
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
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error("Error refreshing session:", err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  
  const logOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error("Error signing out:", err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading session information...</div>
      ) : (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Client-Side Session</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(clientSession, null, 2)}
            </pre>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Server-Side Session</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(apiSession, null, 2)}
            </pre>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Management</h2>
            <div className="flex space-x-4">
              <Button onClick={refreshSession}>Refresh Session</Button>
              <Button variant="destructive" onClick={logOut}>Log Out</Button>
            </div>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
            <p>
              <strong>Client URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </p>
            <p>
              <strong>Client Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
            </p>
            <p>
              <strong>Time:</strong> {new Date().toISOString()}
            </p>
            <p>
              <strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
            </p>
          </section>
        </div>
      )}
    </div>
  )
} 