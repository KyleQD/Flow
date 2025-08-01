"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Music, 
  Building2, 
  Calendar, 
  Users,
  MapPin,
  Star,
  Clock,
  Filter,
  Heart,
  Plus,
  TrendingUp,
  Zap,
  Sparkles,
  Eye,
  Play,
  Headphones,
  Radio,
  Globe,
  Command,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import socialInteractionsService from "@/lib/services/social-interactions.service"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any>({ artists: [], venues: [], events: [], users: [], music: [], posts: [], total: 0 })
  const [trendingTags, setTrendingTags] = useState<any[]>([])
  const [followedProfiles, setFollowedProfiles] = useState<Set<string>>(new Set())
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Load data on component mount and search changes
  useEffect(() => {
    fetchSearchResults()
    fetchTrendingTags()
  }, [searchQuery, activeTab, selectedLocation, selectedGenre, showVerifiedOnly])

  const fetchSearchResults = async () => {
    try {
      setIsSearching(true)
      const params = new URLSearchParams()
      
      if (searchQuery) params.append('q', searchQuery)
      if (activeTab !== 'all') params.append('type', activeTab)
      if (selectedLocation) params.append('location', selectedLocation)
      if (selectedGenre) params.append('genre', selectedGenre)
      if (showVerifiedOnly) params.append('verified', 'true')
      
      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results)
      } else {
        toast.error('Failed to load search results')
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
      toast.error('Failed to load search results')
    } finally {
      setIsSearching(false)
    }
  }

  const fetchTrendingTags = async () => {
    try {
      const response = await fetch('/api/search/trending?limit=10')
      const data = await response.json()
      
      if (data.success) {
        setTrendingTags(data.trending)
      }
    } catch (error) {
      console.error('Error fetching trending tags:', error)
    }
  }

  const handleFollow = async (profileId: string, profileType: string) => {
    if (!user || !isAuthenticated) {
      toast.error('Please sign in to follow profiles')
      return
    }

    try {
      const isFollowing = followedProfiles.has(profileId)
      
      if (isFollowing) {
        const result = await socialInteractionsService.unfollowProfile(profileId, user.id)
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
        const result = await socialInteractionsService.followProfile(profileId, user.id)
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

  const handleShare = async (profileId: string, profileType: string) => {
    try {
      const result = await socialInteractionsService.shareProfile(profileId)
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

  const navigateToProfile = (username: string) => {
    router.push(`/profile/${username}`)
  }

  const navigateToEvent = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // fetchSearchResults will be called automatically by useEffect
  }

  const handleTrendingTagClick = (tag: string) => {
    setSearchQuery(tag)
    setActiveTab('all')
  }

  const getDisplayName = (profile: any) => {
    if (profile.account_type === 'artist') {
      return profile.profile_data?.artist_name || profile.username
    } else if (profile.account_type === 'venue') {
      return profile.profile_data?.venue_name || profile.username
    } else {
      return profile.profile_data?.name || profile.username
    }
  }

  const getProfileGradient = (accountType: string) => {
    switch (accountType) {
      case 'artist':
        return 'from-purple-500 to-pink-500'
      case 'venue':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-indigo-500 to-purple-500'
    }
  }

  const renderArtistCard = (artist: any, index: number) => {
    const displayName = getDisplayName(artist)
    const gradient = getProfileGradient(artist.account_type)
    const isFollowing = followedProfiles.has(artist.id)
    
    return (
      <motion.div
        key={artist.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card 
          className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden cursor-pointer"
          onClick={() => navigateToProfile(artist.username)}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
          
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-lg">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
          </div>

          <CardContent className="relative p-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-slate-600 group-hover:ring-purple-400/50 transition-all duration-300">
                  <AvatarImage src={artist.avatar_url} />
                  <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-lg font-bold`}>
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {artist.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full p-1">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {displayName}
                  </h3>
                  {artist.verified && (
                    <Badge className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-0 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <p className="text-slate-300 text-sm">@{artist.username}</p>
                <p className="text-slate-300 text-sm">{artist.bio}</p>
                
                <div className="flex items-center space-x-3 text-sm text-slate-400">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{artist.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{artist.stats?.followers?.toLocaleString() || 0}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Headphones className="h-3 w-3 mr-1" />
                    <span>{artist.stats?.streams?.toLocaleString() || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {artist.profile_data?.genres?.map((genre: string) => (
                    <Badge key={genre} variant="outline" className="border-slate-600 text-slate-300 text-xs hover:border-purple-400/50">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="sm" 
                  className={`${isFollowing ? 'bg-gradient-to-r from-green-600 to-emerald-600' : `bg-gradient-to-r ${gradient}`} hover:shadow-lg hover:shadow-purple-500/25 text-white border-0`}
                  onClick={() => handleFollow(artist.id, 'artist')}
                  disabled={isFollowing}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                  onClick={() => handleShare(artist.id, 'artist')}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Listen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderVenueCard = (venue: any, index: number) => {
    const displayName = getDisplayName(venue)
    const gradient = getProfileGradient(venue.account_type)
    const isFollowing = followedProfiles.has(venue.id)
    
    return (
      <motion.div
        key={venue.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card 
          className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden cursor-pointer"
          onClick={() => navigateToProfile(venue.username)}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
          
          <CardContent className="relative p-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-slate-600 group-hover:ring-blue-400/50 transition-all duration-300">
                  <AvatarImage src={venue.avatar_url} />
                  <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-lg font-bold`}>
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {venue.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-1">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {displayName}
                  </h3>
                  {venue.verified && (
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <p className="text-slate-300 text-sm">@{venue.username}</p>
                <p className="text-slate-300 text-sm">{venue.bio}</p>
                
                <div className="flex items-center space-x-3 text-sm text-slate-400">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{venue.location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{venue.profile_data?.capacity || 'N/A'} capacity</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{venue.stats?.events || 0} events</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {venue.profile_data?.genres?.map((genre: string) => (
                    <Badge key={genre} variant="outline" className="border-slate-600 text-slate-300 text-xs hover:border-blue-400/50">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="sm" 
                  className={`${isFollowing ? 'bg-gradient-to-r from-green-600 to-emerald-600' : `bg-gradient-to-r ${gradient}`} hover:shadow-lg hover:shadow-blue-500/25 text-white border-0`}
                  onClick={() => handleFollow(venue.id, 'venue')}
                  disabled={isFollowing}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                  onClick={() => handleShare(venue.id, 'venue')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderEventCard = (event: any, index: number) => {
    const gradient = 'from-orange-500 to-red-500'
    
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card 
          className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden cursor-pointer"
          onClick={() => navigateToEvent(event.id)}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
          
          <CardContent className="relative p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {event.title}
                  </h3>
                  <p className="text-slate-300 text-sm">{event.description}</p>
                </div>
                <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 font-bold`}>
                  {event.ticket_price || 'Free'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{event.event_time || 'TBA'}</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{event.venue_name}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.tickets_available || 0} tickets left</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs hover:border-pink-400/50">
                    {event.genre}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                    <Heart className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    className={`bg-gradient-to-r ${gradient} text-white border-0`}
                    onClick={() => window.open(event.ticket_link, '_blank')}
                  >
                    Get Tickets
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderUserCard = (user: any, index: number) => {
    const displayName = getDisplayName(user)
    const gradient = getProfileGradient(user.account_type)
    const isFollowing = followedProfiles.has(user.id)
    
    return (
      <motion.div
        key={user.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card 
          className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden cursor-pointer"
          onClick={() => navigateToProfile(user.username)}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
          
          <CardContent className="relative p-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-slate-600 group-hover:ring-purple-400/50 transition-all duration-300">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold`}>
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full p-1">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-white">{displayName}</h3>
                <p className="text-slate-300 text-sm">@{user.username}</p>
                <p className="text-slate-300 text-sm">{user.bio}</p>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                  <span>•</span>
                  <Users className="h-3 w-3" />
                  <span>{user.stats?.followers?.toLocaleString() || 0}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.profile_data?.interests?.map((interest: string) => (
                    <Badge key={interest} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="sm" 
                  className={`${isFollowing ? 'bg-gradient-to-r from-green-600 to-emerald-600' : `bg-gradient-to-r ${gradient}`} hover:shadow-lg text-white border-0`}
                  onClick={() => handleFollow(user.id, 'user')}
                  disabled={isFollowing}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container max-w-7xl mx-auto py-12 space-y-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
              Discover the Future
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl opacity-30" />
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Find artists, venues, events, and fellow digital music explorers in the cyberpunk universe
          </p>
          
          {/* Advanced Search Bar */}
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur" />
              <div className="relative flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 border border-slate-700/50">
                <div className="relative flex-1">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                    isSearching ? 'text-cyan-400' : 'text-slate-400'
                  }`} />
                  <Input
                    placeholder="Search artists, venues, events, or digital citizens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-transparent border-0 text-white placeholder-slate-400 text-lg focus:ring-0 focus:outline-none"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 px-6 py-3"
                  onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showVerifiedOnly ? 'All Results' : 'Verified Only'}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white border-0 px-6 py-3"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedLocation(null)
                    setSelectedGenre(null)
                    setShowVerifiedOnly(false)
                    setActiveTab('all')
                  }}
                >
                  <Command className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Trending Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="h-6 w-6 mr-3 text-green-400" />
                Trending in the Digital Underground
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {trendingTags.map((tag, index) => (
                  <motion.div
                    key={tag.tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => handleTrendingTagClick(tag.tag)}
                  >
                    <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 px-4 py-2">
                      <span className="font-medium">{tag.tag}</span>
                      <span className="ml-2 text-xs opacity-75">{tag.count}</span>
                      <TrendingUp className="h-3 w-3 ml-2 text-green-400" />
                      <span className="ml-1 text-xs text-green-400">{tag.trend}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Globe className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger 
                value="artists"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Music className="h-4 w-4 mr-2" />
                Artists
              </TabsTrigger>
              <TabsTrigger 
                value="venues"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Venues
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Citizens
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="all" className="space-y-8 mt-8">
            {/* Featured Artists */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold flex items-center text-white">
                  <Music className="h-7 w-7 mr-3 text-purple-400" />
                  Digital Artists
                </h2>
                <Button variant="outline" size="sm" className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20">
                  <Radio className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              {isSearching ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-800 rounded mb-2"></div>
                            <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchResults.artists.slice(0, 2).map((artist: any, index: number) => renderArtistCard(artist, index))}
                </div>
              )}
            </div>

            {/* Featured Venues */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold flex items-center text-white">
                  <Building2 className="h-7 w-7 mr-3 text-blue-400" />
                  Cyber Venues
                </h2>
                <Button variant="outline" size="sm" className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              {isSearching ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-800 rounded mb-2"></div>
                            <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchResults.venues.map((venue: any, index: number) => renderVenueCard(venue, index))}
                </div>
              )}
            </div>

            {/* Featured Events */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold flex items-center text-white">
                  <Calendar className="h-7 w-7 mr-3 text-pink-400" />
                  Upcoming Experiences
                </h2>
                <Button variant="outline" size="sm" className="border-pink-400/30 text-pink-300 hover:bg-pink-500/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              {isSearching ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-slate-800 rounded mb-2"></div>
                        <div className="h-3 bg-slate-800 rounded w-3/4 mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-3 bg-slate-800 rounded"></div>
                          <div className="h-3 bg-slate-800 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchResults.events.map((event: any, index: number) => renderEventCard(event, index))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="artists" className="space-y-6 mt-8">
            {isSearching ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-800 rounded mb-2"></div>
                          <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.artists.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.artists.map((artist: any, index: number) => renderArtistCard(artist, index))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Artists Found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria to find artists.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="venues" className="space-y-6 mt-8">
            {isSearching ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-800 rounded mb-2"></div>
                          <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.venues.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.venues.map((venue: any, index: number) => renderVenueCard(venue, index))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Venues Found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria to find venues.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-8">
            {isSearching ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-800 rounded mb-2"></div>
                      <div className="h-3 bg-slate-800 rounded w-3/4 mb-4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-3 bg-slate-800 rounded"></div>
                        <div className="h-3 bg-slate-800 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.events.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.events.map((event: any, index: number) => renderEventCard(event, index))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria to find events.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-8">
            {isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-800 rounded mb-2"></div>
                          <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.users.map((user: any, index: number) => renderUserCard(user, index))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria to find users.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 