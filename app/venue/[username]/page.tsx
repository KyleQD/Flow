"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { VenueProfileEnhanced } from "@/components/profile/venue-profile-enhanced"
import { useAuth } from "@/contexts/auth-context"

interface ProfileResponse {
  profile: {
    id: string
    username: string
    account_type: 'venue' | string
    profile_data: any
    avatar_url?: string
    cover_image?: string
    verified: boolean
    location?: string
    stats: any
    social_links?: any
  }
  portfolio?: any[]
  experiences?: any[]
  certifications?: any[]
}

export default function VenuePublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const { isAuthenticated } = useAuth()

  const [data, setData] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) load()
  }, [username])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error('Profile not found')
      const json = await res.json()
      if (!json.profile) throw new Error('Profile not found')
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Failed to load profile')
      toast.error(e.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto mb-4" />
        <p className="text-indigo-200">Loading venue profile...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Profile Not Found</h2>
          <p className="text-red-300">{error || 'We could not find this venue.'}</p>
        </div>
        <Button onClick={() => router.back()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  )

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-black/40"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <VenueProfileEnhanced
        profile={data.profile as any}
        portfolio={data.portfolio || []}
        isOwnProfile={false}
      />
    </div>
  )
}


