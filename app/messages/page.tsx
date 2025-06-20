"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MessagesRedirect() {
  const router = useRouter()

  useEffect(() => {
    // For now, we'll assume it's an artist user. In a real app, you'd check the user type
    // from your auth/user context or API
    
    // TODO: Replace this with actual user type detection
    const userType = "artist" // This should come from your user context/auth system
    
    if (userType === "artist") {
      router.replace("/artist/messages")
    } else if (userType === "venue") {
      router.replace("/venue/messages")
    } else if (userType === "admin") {
      router.replace("/admin/dashboard/messages")
    } else {
      router.replace("/artist/messages")
    }
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Redirecting to messages...</p>
      </div>
    </div>
  )
}
