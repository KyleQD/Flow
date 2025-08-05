"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { EnhancedPublicProfileView } from "@/components/profile/enhanced-public-profile-view"
import { EnhancedProfileSearch } from "@/components/search/enhanced-profile-search"
import socialInteractionsService from "@/lib/services/social-interactions.service"
import { useAuth } from "@/contexts/auth-context"

interface DemoProfile {
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

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DemoProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/search/unified?limit=50')
      
      if (response.ok) {
        const data = await response.json()
        const profiles = data.unified_results || []
        setProfiles(profiles)
      } else {
        toast.error('Failed to load profiles')
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
      toast.error('Error loading profiles')
    }
  }

  const openProfileModal = (profile: any) => {
    setSelectedProfile(profile)
    setShowProfileModal(true)
  }

  const handleFollow = async (profileId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to follow profiles')
      return
    }

    try {
      const isFollowing = false // You'd check actual follow status
      const action = isFollowing ? 'unfollow' : 'follow'
      
      await socialInteractionsService.followUser(profileId, action)
      toast.success(action === 'follow' ? 'Now following!' : 'Unfollowed')
    } catch (error) {
      console.error('Follow error:', error)
      toast.error('Failed to update follow status')
    }
  }

  const handleShare = async (profile: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.username}'s Profile`,
          text: `Check out ${profile.username} on Tourify!`,
          url: window.location.href
        })
      } catch (err) {
        console.log("Share failed:", err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Profile link copied to clipboard!')
      } catch (err) {
        toast.error('Failed to copy link')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-bold text-white">
          Discover the <span className="text-purple-400">Music Community</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Connect with artists, venues, and fellow music lovers. Explore profiles, follow your favorites, 
          and become part of a vibrant music ecosystem.
        </p>
        <div className="flex justify-center gap-6 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            <span>Artists</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span>Venues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            <span>Music Fans</span>
          </div>
        </div>
      </div>

      {/* Enhanced Profile Search */}
      <EnhancedProfileSearch 
        onProfileSelect={(profile) => openProfileModal(profile)}
        showFilters={true}
        compact={false}
      />

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <EnhancedPublicProfileView 
              profile={{
                id: selectedProfile.id,
                username: selectedProfile.username,
                account_type: selectedProfile.account_type,
                profile_data: selectedProfile.profile_data,
                avatar_url: selectedProfile.avatar_url,
                cover_image: selectedProfile.cover_image,
                verified: selectedProfile.verified,
                bio: selectedProfile.bio,
                location: selectedProfile.location,
                social_links: selectedProfile.social_links,
                stats: selectedProfile.stats,
                created_at: selectedProfile.created_at
              }}
              onFollow={(id) => handleFollow(id)}
              onShare={(profile) => handleShare(profile)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Community Stats */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Join Our Growing Community</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Whether you're an artist looking for venues, a venue seeking talent, or a fan wanting to 
            connect with like-minded people, and be part of the future of music.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {profiles.filter(p => p.account_type === 'artist').length}
              </div>
              <div className="text-gray-400">Artists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {profiles.filter(p => p.account_type === 'venue').length}
              </div>
              <div className="text-gray-400">Venues</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {profiles.filter(p => p.account_type === 'general').length}
              </div>
              <div className="text-gray-400">Music Fans</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}