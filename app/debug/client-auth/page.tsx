"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function ClientAuthDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load session on page load
  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true)
        setError(null)
        
        // Get client-side session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw new Error(`Session error: ${error.message}`)
        }
        
        const sessionObj = {
          exists: !!data.session,
          userId: data.session?.user?.id || null,
          email: data.session?.user?.email || null,
          expires: data.session?.expires_at
            ? new Date(data.session.expires_at * 1000).toISOString()
            : null,
          hasAccessToken: !!data.session?.access_token,
          hasRefreshToken: !!data.session?.refresh_token
        }
        
        setSession(sessionObj)
        
        // Check onboarding status if user is authenticated
        if (sessionObj.userId) {
          try {
            const { data: onboardingData, error: onboardingError } = await supabase
              .from('onboarding')
              .select('*')
              .eq('user_id', sessionObj.userId)
              .maybeSingle()
            
            if (onboardingError) {
              console.error("Error fetching onboarding status:", onboardingError)
              setOnboardingStatus({
                error: onboardingError.message,
                exists: false,
                completed: false
              })
            } else {
              setOnboardingStatus({
                exists: !!onboardingData,
                completed: onboardingData?.completed || false,
                data: onboardingData || null
              })
            }
          } catch (err) {
            console.error("Error checking onboarding:", err)
            setOnboardingStatus({
              error: err instanceof Error ? err.message : String(err),
              exists: false,
              completed: false
            })
          }
        }
      } catch (err) {
        console.error("Error loading session:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    
    loadSession()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Auth state changed: ${event}`)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const sessionObj = {
            exists: true,
            userId: newSession?.user?.id || null,
            email: newSession?.user?.email || null,
            expires: newSession?.expires_at
              ? new Date(newSession.expires_at * 1000).toISOString()
              : null,
            hasAccessToken: !!newSession?.access_token,
            hasRefreshToken: !!newSession?.refresh_token,
            lastEvent: event
          }
          
          setSession(sessionObj)
          
          // Also update onboarding status when session changes
          if (sessionObj.userId) {
            try {
              const { data: onboardingData, error: onboardingError } = await supabase
                .from('onboarding')
                .select('*')
                .eq('user_id', sessionObj.userId)
                .maybeSingle()
              
              if (onboardingError) {
                console.error("Error fetching onboarding status:", onboardingError)
                setOnboardingStatus({
                  error: onboardingError.message,
                  exists: false,
                  completed: false
                })
              } else {
                setOnboardingStatus({
                  exists: !!onboardingData,
                  completed: onboardingData?.completed || false,
                  data: onboardingData || null
                })
              }
            } catch (err) {
              console.error("Error checking onboarding:", err)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setSession({
            exists: false,
            lastEvent: event
          })
          setOnboardingStatus(null)
        }
      }
    )
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const refreshSession = async () => {
    try {
      setLoading(true)
      
      // Refresh session
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }
      
      console.log("Session refreshed:", {
        userId: data.session?.user?.id,
        expires: data.session?.expires_at 
          ? new Date(data.session.expires_at * 1000).toISOString()
          : null
      })
      
      // Update session state
      setSession({
        exists: !!data.session,
        userId: data.session?.user?.id || null,
        email: data.session?.user?.email || null,
        expires: data.session?.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : null,
        hasAccessToken: !!data.session?.access_token,
        hasRefreshToken: !!data.session?.refresh_token,
        lastAction: 'refreshed'
      })
    } catch (err) {
      console.error("Error refreshing session:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }
  
  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      
      // Clear session state
      setSession({
        exists: false,
        lastAction: 'signed_out'
      })
      
      // Navigate to login page
      window.location.href = '/login'
    } catch (err) {
      console.error("Error signing out:", err)
      setError(err instanceof Error ? err.message : String(err))
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Client-Side Authentication Debug</h1>
      <p className="text-gray-500 mb-6">This page only uses client-side auth checks</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading authentication data...</div>
      ) : (
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="flex items-center mb-4">
              <div className={`h-4 w-4 rounded-full mr-2 ${session?.exists ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{session?.exists ? 'Authenticated' : 'Not Authenticated'}</span>
            </div>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </section>
          
          {session?.exists && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Onboarding Status</h2>
              <div className="flex items-center mb-4">
                <div className={`h-4 w-4 rounded-full mr-2 ${onboardingStatus?.completed ? 'bg-green-500' : onboardingStatus?.exists ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {onboardingStatus?.completed ? 'Onboarding Complete' : 
                   onboardingStatus?.exists ? 'Onboarding In Progress' : 
                   'Onboarding Not Started'}
                </span>
              </div>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(onboardingStatus, null, 2)}
              </pre>
              {session?.exists && !onboardingStatus?.completed && (
                <div className="mt-4">
                  <Button onClick={() => window.location.href = '/onboarding'}>
                    Go to Onboarding
                  </Button>
                </div>
              )}
            </section>
          )}
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={refreshSession}
                disabled={loading || !session?.exists}
              >
                Refresh Session
              </Button>
              
              <Button 
                onClick={signOut}
                disabled={loading || !session?.exists}
                variant="destructive"
              >
                Sign Out
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/login'} 
                variant="outline"
                disabled={loading}
              >
                Go to Login
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/events'} 
                variant="outline"
                disabled={loading}
              >
                Test Protected Route
              </Button>
            </div>
          </section>
          
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Next.js 15 Note</h2>
            <p className="text-sm text-gray-700">
              In Next.js 15, server components have difficulty accessing cookies due to API changes. 
              This page relies completely on client-side authentication checks to avoid those issues.
              The middleware should still properly handle redirects based on authentication state.
            </p>
          </section>
        </div>
      )}
    </div>
  )
} 