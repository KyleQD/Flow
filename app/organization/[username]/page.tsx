"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { EnhancedPublicProfileView } from "@/components/profile/enhanced-public-profile-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface OrganizationProfileData {
  id: string
  username: string
  account_type: 'organization'
  profile_data: any
  avatar_url?: string
  cover_image?: string
  verified: boolean
  bio?: string
  location?: string
  social_links: any
  stats: {
    followers: number
    following: number
    posts: number
    likes: number
    views: number
    events?: number
  }
  created_at: string
}

export default function OrganizationPublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [profile, setProfile] = useState<OrganizationProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) fetchProfile()
  }, [username])

  async function fetchProfile() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}`)
      if (!res.ok) {
        setError(res.status === 404 ? 'Organization profile not found' : 'Failed to load profile')
        return
      }
      const data = await res.json()
      if (!data?.profile || data.profile.account_type !== 'organization') {
        setError('Organization profile not found')
        return
      }
      setProfile(data.profile)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load profile')
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-purple-300">Loading organization profile...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Profile Not Found</h2>
          <p className="text-red-300">{error}</p>
        </div>
        <Button onClick={() => router.back()} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  )

  if (!profile) return null

  return (
    <EnhancedPublicProfileView
      profile={profile}
      isOwnProfile={false}
      onFollow={() => {}}
      onMessage={() => {}}
      onShare={() => {}}
    />
  )
}


