"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArtistPublicProfileView } from "@/components/profile/artist-public-profile-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { MessageModal } from "@/components/messaging/message-modal"
import { useAuth } from "@/contexts/auth-context"

interface ArtistProfileData {
  id: string
  username: string
  account_type: 'artist'
  profile_data: {
    artist_name?: string
    stage_name?: string
    bio?: string
    genre?: string
    location?: string
    website?: string
    instagram?: string
    twitter?: string
    youtube?: string
    spotify?: string
    contact_email?: string
    phone?: string
    booking_rate?: string
    availability?: string
    equipment?: string
    music_style?: string
    experience_years?: string
    notable_performances?: string
    record_label?: string
    awards?: string
    upcoming_releases?: string
    collaboration_interest?: boolean
    available_for_hire?: boolean
  }
  avatar_url?: string
  cover_image?: string
  verified: boolean
  social_links?: any
  stats: {
    followers: number
    following: number
    posts: number
    likes: number
    views: number
    streams?: number
    events?: number
    monthly_listeners?: number
    total_revenue?: number
    engagement_rate?: number
  }
  created_at: string
}

export default function ArtistPublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [profile, setProfile] = useState<ArtistProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (username) {
      fetchArtistProfile()
    }
  }, [username])

  const fetchArtistProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching artist profile for username:', username)
      
      // Try to fetch the artist profile by username directly
      const response = await fetch(`/api/profile/${encodeURIComponent(username)}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          console.log('✅ Profile loaded successfully:', data.profile.username)
          setProfile(data.profile)
          
          // Check if this is the current user's profile
          if (isAuthenticated && user) {
            const currentUsername = user.user_metadata?.username || 
                                  user.user_metadata?.artist_name?.toLowerCase().replace(/\s+/g, '') ||
                                  user.user_metadata?.stage_name?.toLowerCase().replace(/\s+/g, '')
            
            if (currentUsername && currentUsername.toLowerCase() === username.toLowerCase()) {
              setIsOwnProfile(true)
              console.log('✅ This is the current user\'s profile')
            } else {
              setIsOwnProfile(false)
              console.log('✅ This is another user\'s profile')
            }
          } else {
            setIsOwnProfile(false)
            console.log('✅ User not authenticated, treating as public profile')
          }
        } else {
          setError('Artist profile not found')
        }
      } else if (response.status === 404) {
        console.log('❌ Profile not found for username:', username)
        setError('Artist profile not found')
      } else {
        console.log('❌ API error:', response.status, response.statusText)
        setError('Failed to load artist profile')
      }
    } catch (error) {
      console.error('❌ Error fetching artist profile:', error)
      setError('Failed to load artist profile')
      toast.error('Failed to load artist profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (profileId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow artists')
      return
    }

    try {
      const response = await fetch('/api/profile/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId }),
      })

      if (response.ok) {
        toast.success('Successfully followed artist')
        // Refresh profile data to update follower count
        fetchArtistProfile()
      } else {
        toast.error('Failed to follow artist')
      }
    } catch (error) {
      console.error('Error following artist:', error)
      toast.error('Failed to follow artist')
    }
  }

  const handleMessage = async (profileId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to send messages')
      return
    }

    setShowMessageModal(true)
  }

  const handleShare = async (profile: ArtistProfileData) => {
    try {
      const shareUrl = `${window.location.origin}/artist/${profile.username}`
      
      if (navigator.share) {
        await navigator.share({
          title: `${profile.profile_data?.artist_name || profile.username} - Artist Profile`,
          text: `Check out ${profile.profile_data?.artist_name || profile.username}'s artist profile on Tourify`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Profile link copied to clipboard')
      }
    } catch (error) {
      console.error('Error sharing profile:', error)
      toast.error('Failed to share profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-purple-300">Loading artist profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex items-center justify-center">
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
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-300">No profile data available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ArtistPublicProfileView
        profile={profile}
        isOwnProfile={isOwnProfile}
        onFollow={handleFollow}
        onMessage={handleMessage}
        onShare={handleShare}
      />
      
      {showMessageModal && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientId={profile.id}
          recipientName={profile.profile_data?.artist_name || profile.username}
        />
      )}
    </>
  )
} 