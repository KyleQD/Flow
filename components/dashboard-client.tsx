"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Dashboard from "@/components/dashboard"
import { getProfile } from "@/services/supabase"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

interface DashboardClientProps {
  userId: string
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile(userId)
        if (!profile) {
          router.push('/onboarding')
          return
        }
        setIsLoading(false)
      } catch (err) {
        const error = err as Error
        console.error('Error loading profile:', error)
        setError(error.message)
        toast.error('Failed to load profile')
      }
    }

    loadProfile()
  }, [userId, router])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900">
        <div className="text-center p-8 max-w-md">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-white">Loading your dashboard...</h1>
            <p className="text-slate-400 mt-2">Please wait while we fetch your data.</p>
            {error && (
              <div className="mt-4 text-red-400 bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Dashboard userId={userId} />
    </div>
  )
} 