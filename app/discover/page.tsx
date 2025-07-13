"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Music, Users, Play, Heart, Share2, Calendar, Star, Mic, Building, User, Search, Filter, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PublicProfileView } from "@/components/profile/public-profile-view"
import socialInteractionsService from "@/lib/services/social-interactions.service"

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
  rank?: number
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DemoProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [followedProfiles, setFollowedProfiles] = useState<Set<string>>(new Set())
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const accountTypes = [
    { value: 'general', label: 'Music Fans', icon: User, color: 'bg-blue-500' },
    { value: 'artist', label: 'Artists', icon: Mic, color: 'bg-purple-500' },
    { value: 'venue', label: 'Venues', icon: Building, color: 'bg-green-500' }
  ]

  const locations = [
    "Las Vegas, NV", "Los Angeles, CA", "New York, NY", "Nashville, TN", 
    "Austin, TX", "Chicago, IL", "Seattle, WA", "Miami, FL"
  ]

  useEffect(() => {
    fetchProfiles()
  }, [searchQuery, selectedType, selectedLocation])

  const fetchProfiles = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (searchQuery) params.append('q', searchQuery)
      if (selectedType) params.append('type', selectedType)
      if (selectedLocation) params.append('location', selectedLocation)
      
      const response = await fetch(`/api/demo-accounts?${params.toString()}`)
      const data = await response.json()
      
      if (data.profiles) {
        setProfiles(data.profiles)
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
      toast.error('Failed to load profiles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async (profileId: string) => {
    try {
      const isFollowing = followedProfiles.has(profileId)
      const userId = socialInteractionsService.getCurrentUserId()
      
      if (isFollowing) {
        const result = await socialInteractionsService.unfollowProfile(profileId, userId || undefined)
        if (result.success) {
          setFollowedProfiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(profileId)
            return newSet
          })
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      } else {
        const result = await socialInteractionsService.followProfile(profileId, userId || undefined)
        if (result.success) {
          setFollowedProfiles(prev => new Set([...prev, profileId]))
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing profile:', error)
      toast.error('Failed to update follow status')
    }
  }

  const handleShare = async (profile: DemoProfile) => {
    try {
      const result = await socialInteractionsService.shareProfile(profile.id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error sharing profile:', error)
      toast.error('Failed to share profile')
    }
  }

  const getDisplayName = (profile: DemoProfile) => {
    if (profile.account_type === 'artist') {
      return profile.profile_data?.artist_name || profile.username
    } else if (profile.account_type === 'venue') {
      return profile.profile_data?.venue_name || profile.username
    } else {
      return profile.profile_data?.name || profile.username
    }
  }

  const getProfileIcon = (accountType: string) => {
    const type = accountTypes.find(t => t.value === accountType)
    return type?.icon || User
  }

  const getProfileColor = (accountType: string) => {
    const type = accountTypes.find(t => t.value === accountType)
    return type?.color || 'bg-gray-500'
  }

  const openProfileModal = (profile: DemoProfile) => {
    setSelectedProfile(profile)
    setShowProfileModal(true)
  }

  const navigateToProfile = (username: string) => {
    window.location.href = `/profile/${username}`
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchQuery || 
      getDisplayName(profile).toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = !selectedType || profile.account_type === selectedType
    const matchesLocation = !selectedLocation || profile.location?.includes(selectedLocation)

    return matchesSearch && matchesType && matchesLocation
  })

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

      {/* Search and Filters */}
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search profiles, artists, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400 h-12"
              />
            </div>

            {/* Account Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                onClick={() => setSelectedType(null)}
                className="h-12 bg-purple-600 hover:bg-purple-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                All Types
              </Button>
              {accountTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "default" : "outline"}
                    onClick={() => setSelectedType(type.value)}
                    className="h-12"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </Button>
                )
              })}
            </div>

            {/* Location Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedLocation === null ? "default" : "outline"}
                onClick={() => setSelectedLocation(null)}
                className="h-12"
              >
                <MapPin className="h-4 w-4 mr-2" />
                All Cities
              </Button>
              {locations.slice(0, 2).map((location) => (
                <Button
                  key={location}
                  variant={selectedLocation === location ? "default" : "outline"}
                  onClick={() => setSelectedLocation(location)}
                  className="h-12"
                >
                  {location.split(',')[0]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {selectedType ? `${accountTypes.find(t => t.value === selectedType)?.label || 'Profiles'}` : 'All Profiles'}
            <span className="text-gray-400 text-lg ml-2">({filteredProfiles.length})</span>
          </h2>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
            Live Community
          </Badge>
        </div>

        {/* Profile Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-slate-800 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-800 rounded mb-2"></div>
                      <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-800 rounded mb-2"></div>
                  <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => {
              const Icon = getProfileIcon(profile.account_type)
              const colorClass = getProfileColor(profile.account_type)
              
              return (
                <Card 
                  key={profile.id} 
                  className="bg-slate-900/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                  onClick={() => navigateToProfile(profile.username)}
                >
                  <CardContent className="p-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all">
                          <AvatarImage src={profile.avatar_url} alt={getDisplayName(profile)} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-lg font-bold">
                            {getDisplayName(profile).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-6 w-6 ${colorClass} rounded-full flex items-center justify-center`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                            {getDisplayName(profile)}
                          </h3>
                          {profile.verified && (
                            <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">@{profile.username}</p>
                        {profile.location && (
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <MapPin className="h-3 w-3" />
                            {profile.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    {/* Account Type Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`${colorClass} text-white px-3 py-1`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {accountTypes.find(t => t.value === profile.account_type)?.label}
                      </Badge>
                      {profile.account_type === 'artist' && profile.profile_data?.genre && (
                        <Badge variant="secondary" className="bg-slate-800 text-purple-300 border-purple-500/30">
                          {profile.profile_data.genre}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {profile.stats.followers.toLocaleString()} followers
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {profile.stats.likes.toLocaleString()} likes
                      </div>
                      {profile.stats.streams && (
                        <div className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {profile.stats.streams.toLocaleString()} streams
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {!followedProfiles.has(profile.id) ? (
                        <Button
                          onClick={() => handleFollow(profile.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed"
                        >
                          <Heart className="h-4 w-4 mr-2 fill-current" />
                          Following
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => navigateToProfile(profile.username)}
                        className="border-slate-700 text-gray-300 hover:text-white hover:border-purple-500 transition-all"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleShare(profile)}
                        className="border-slate-700 text-gray-300 hover:text-white hover:border-purple-500 transition-all"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Profiles Found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search criteria or explore different account types and locations.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType(null)
                  setSelectedLocation(null)
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
                         <PublicProfileView 
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
          <h2 className="text-3xl font-bold text-white mb-4">Growing Music Community</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            Join a thriving ecosystem of artists, venues, and music lovers. Discover new talent, 
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