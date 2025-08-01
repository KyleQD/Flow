"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { SocialFeed } from "@/components/feed/social-feed"

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after initial loading is complete and we have auth state
    if (!loading) {
      if (isAuthenticated && user) {
        // Don't redirect - show the social feed instead
        return
      }
      // Don't redirect unauthenticated users - let them stay on homepage
    }
  }, [loading, isAuthenticated, user, router])

  // If still loading, show loading state
  if (loading) {
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

  // If authenticated user, show the social feed
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <SocialFeed />
      </div>
    )
  }

  // Show login prompt for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center text-white max-w-md mx-auto p-6">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
            <div className="text-4xl">🎵</div>
          </div>
          <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur opacity-20"></div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Welcome to Tourify
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Connect. Create. Tour.
        </p>
        
        <p className="text-gray-400 mb-8">
          The ultimate platform for artists, venues, and music industry professionals.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => router.push('/signup')}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}

