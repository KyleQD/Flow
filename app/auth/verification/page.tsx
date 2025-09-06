"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function VerificationPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const type = searchParams.get("type") || "verification"
  const hasError = searchParams.get("error") === "true"
  const isSuccess = searchParams.get("success") === "true"
  const errorMessage = searchParams.get("message") || "We couldn't verify your account."
  
  // Check session and onboarding status
  useEffect(() => {
    async function checkSession() {
      try {
        console.log("[Verification] Checking user session")
        const { data: { session } } = await supabase.auth.getSession()
        
        console.log("[Verification] Session check result:", {
          hasSession: !!session,
          userId: session?.user?.id || null
        })
        
        if (session?.user?.id) {
          setIsAuthenticated(true)
          
          // Check onboarding status
          try {
            console.log("[Verification] Checking onboarding status")
            const { data, error } = await supabase
              .from('onboarding')
              .select('completed')
              .eq('user_id', session.user.id)
              .maybeSingle()
              
            if (error) {
              console.error("[Verification] Error checking onboarding:", error)
              // Default to needing onboarding on error
              setOnboardingStatus(false)
            } else {
              console.log("[Verification] Onboarding status:", {
                exists: !!data,
                completed: data?.completed === true
              })
              setOnboardingStatus(data?.completed === true)
            }
          } catch (err) {
            console.error("[Verification] Exception checking onboarding:", err)
            setOnboardingStatus(false)
          }
        }
      } catch (err) {
        console.error("[Verification] Error checking session:", err)
        setError("Failed to check authentication status")
      } finally {
        setSessionChecked(true)
        setLoading(false)
      }
    }
    
    checkSession()
  }, [])
  
  // After session is checked, handle redirection
  useEffect(() => {
    if (!sessionChecked) return
    
    const redirectTimer = setTimeout(() => {
      if (isAuthenticated) {
        const redirectTo = '/dashboard'
        console.log(`[Verification] Redirecting authenticated user to: ${redirectTo}`)
        router.push(redirectTo)
      } else if (type === "signup" || type === "recovery") {
        console.log("[Verification] Redirecting to login after signup/recovery")
        router.push('/login')
      }
    }, 5000) // Redirect after 5 seconds to ensure user reads the message
    
    return () => clearTimeout(redirectTimer)
  }, [sessionChecked, isAuthenticated, onboardingStatus, router, type])
  
  // Handle the different verification states
  let title = "Verifying..."
  let description = "Please wait while we verify your account."
  let icon = <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
  
  if (!loading) {
    if (hasError) {
      title = "Verification Failed"
      description = `${errorMessage} Please try again or contact support.`
      icon = <AlertCircle className="h-12 w-12 text-red-500" />
    } else if (isSuccess && type === "verification") {
      title = "Email Verified Successfully"
      description = "Your email has been successfully verified. You can now access your account."
      icon = <CheckCircle className="h-12 w-12 text-green-500" />
    } else if (type === "signup") {
      title = "Registration Successful"
      description = "Your account has been created. Please check your email to verify your account."
      icon = <CheckCircle className="h-12 w-12 text-green-500" />
    } else if (type === "recovery") {
      title = "Password Reset Initiated"
      description = "We've sent a password reset link to your email. Please check your inbox."
      icon = <CheckCircle className="h-12 w-12 text-purple-500" />
    } else if (isAuthenticated) {
      title = "Verification Successful"
      description = "Your account has been verified. You'll be redirected shortly."
      icon = <CheckCircle className="h-12 w-12 text-green-500" />
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 to-slate-900/80"></div>
      </div>
      
      <Card className="w-full max-w-md bg-slate-900/70 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="flex items-center space-x-2 mb-4">
            <Music className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              TOURIFY
            </span>
          </div>
          <CardTitle className="text-2xl text-white">{title}</CardTitle>
          <CardDescription className="text-slate-400">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center text-center">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="py-6">{icon}</div>
          
          {!loading && (
            <div className="text-sm text-slate-400 mt-2">
              {isAuthenticated ? (
                <p>Redirecting you to your dashboard...</p>
              ) : isSuccess ? (
                <p>Redirecting you to the login page to access your verified account...</p>
              ) : type === "signup" ? (
                <p>Redirecting you to the login page...</p>
              ) : type === "recovery" ? (
                <p>Please check your email and follow the instructions to reset your password.</p>
              ) : (
                <p>You'll need to log in to access your account.</p>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {!loading && (
            <div className="space-x-2">
              {isAuthenticated ? (
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              ) : isSuccess ? (
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 