"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PublicProfileView } from "@/components/profile/public-profile-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { MessageModal } from "@/components/messaging/message-modal"
import { useAuth } from "@/contexts/auth-context"

interface ProfileData {
  id: string
  username: string
  account_type: 'general' | 'artist' | 'venue'
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
    streams?: number
    events?: number
  }
  created_at: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, check if this is the current user's profile
      try {
        const currentUserResponse = await fetch('/api/profile/current')
        if (currentUserResponse.ok) {
          const currentUserData = await currentUserResponse.json()
          
          if (currentUserData.profile) {
            const profileUsername = currentUserData.profile.username
            
            // Check for username match
            if (profileUsername === username || profileUsername?.toLowerCase() === username.toLowerCase()) {
              console.log('✅ Found matching profile for current user:', username)
              setProfile(currentUserData.profile)
              setIsOwnProfile(true)
              return
            }
          }
        }
      } catch (apiError) {
        console.error('Error checking current user profile:', apiError)
      }
      
      // If not current user, try to fetch the profile by username
      const response = await fetch(`/api/profile/${encodeURIComponent(username)}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setProfile(data.profile)
          setIsOwnProfile(false)
        } else {
          setError('Profile not found')
        }
      } else if (response.status === 404) {
        setError('Profile not found')
      } else {
        setError('Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (profileId: string) => {
    if (!user || !isAuthenticated) {
      toast.error('Please sign in to follow profiles')
      return
    }

    try {
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followingId: profileId,
          action: 'follow'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Profile followed successfully! 🎵')
        // Refresh the profile to update follower count
        await fetchProfile()
      } else {
        const error = await response.json()
        console.error('Follow action failed:', error)
        toast.error(error.error || 'Failed to follow profile')
      }
    } catch (error) {
      console.error('Error following profile:', error)
      toast.error('Failed to follow profile')
    }
  }

  const handleMessage = async (profileId: string) => {
    if (!user || !isAuthenticated) {
      toast.error('Please sign in to send messages')
      return
    }
    
    if (isOwnProfile) {
      toast.error('You cannot send a message to yourself')
      return
    }

    setShowMessageModal(true)
  }

  const handleShare = async (profile: ProfileData) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.profile_data?.name || profile.username}'s Profile`,
          text: `Check out ${profile.profile_data?.name || profile.username} on Tourify!`,
          url: window.location.href
        })
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Profile link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing profile:', error)
      toast.error('Failed to share profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Profile</h2>
          <p className="text-gray-400">Please wait while we fetch the profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-400 mb-8">
            The profile "@{username}" doesn't exist or has been removed.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => router.back()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/discover')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-6 py-3"
            >
              Discover Profiles
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Back Button */}
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

      {/* Profile View */}
      <PublicProfileView
        profile={profile}
        isOwnProfile={isOwnProfile}
        onFollow={handleFollow}
        onMessage={handleMessage}
        onShare={handleShare}
      />

      {/* Message Modal */}
      {profile && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipient={{
            id: profile.id,
            username: profile.username,
            full_name: profile.profile_data?.name || profile.profile_data?.artist_name || profile.profile_data?.venue_name,
            avatar_url: profile.avatar_url
          }}
        />
      )}
    </div>
  )
} 