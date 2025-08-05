"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after initial loading is complete and we have auth state
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirect authenticated users to dashboard
        router.push('/dashboard')
        return
      } else {
        // Redirect unauthenticated users to login
        router.push('/login')
        return
      }
    }
  }, [loading, isAuthenticated, user, router])

  // Show loading state while determining auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center text-white">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-400" />
          <div className="absolute inset-0 h-12 w-12 rounded-full bg-purple-400/20 animate-pulse mx-auto mb-4"></div>
        </div>
        <p className="text-lg font-light">Loading Tourify...</p>
      </div>
    </div>
  )
}

