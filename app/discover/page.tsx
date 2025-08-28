"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { EnhancedPublicProfileView } from "@/components/profile/enhanced-public-profile-view"
import socialInteractionsService from "@/lib/services/social-interactions.service"
import { useAuth } from "@/contexts/auth-context"
import {
  Compass,
  Flame,
  Calendar,
  Users,
  Music2,
  Building2,
  MapPin,
  ArrowRight,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Star,
  Verified,
  Eye,
  Heart,
  Share2,
  Loader2,
  Search
} from "lucide-react"

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
    rating?: number
  }
  created_at: string
  is_demo?: boolean
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DemoProfile[]>([])
  const [trendingPosts, setTrendingPosts] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user: currentUser } = useAuth()

  useEffect(() => {
    loadDiscover()
  }, [])

  const loadDiscover = async () => {
    try {
      setIsLoading(true)
      
      // Fetch real platform data from enhanced discover API
      const discoverRes = await fetch('/api/discover')

      if (discoverRes.ok) {
        const discover = await discoverRes.json()
        
        // Set real platform data
        setTrendingPosts(discover.sections?.trending || [])
        setUpcomingEvents(discover.sections?.upcoming || [])
        
        // Combine artists and venues for profiles
        const allProfiles = [
          ...(discover.sections?.artists || []),
          ...(discover.sections?.venues || [])
        ]
        setProfiles(allProfiles)
        
        console.log('✅ Loaded real platform data:', {
          posts: discover.sections?.trending?.length || 0,
          events: discover.sections?.upcoming?.length || 0,
          artists: discover.sections?.artists?.length || 0,
          venues: discover.sections?.venues?.length || 0,
          stats: discover.stats
        })
      } else {
        // Fallback to unified search if discover API fails
        console.log('⚠️ Discover API failed, falling back to unified search')
        const unifiedRes = await fetch('/api/search/unified?limit=20')
        if (unifiedRes.ok) {
          const unified = await unifiedRes.json()
          setProfiles(unified.unified_results || [])
        }
      }
    } catch (error) {
      console.error('Error fetching platform data:', error)
      toast.error('Error loading discover content')
    } finally {
      setIsLoading(false)
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
      
      if ((socialInteractionsService as any).followUser) {
        await (socialInteractionsService as any).followUser(profileId, action)
      }
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

  // Consistent result counts for all sections
  const ITEMS_PER_SECTION = 4 // Reduced to 4 for horizontal scrolling
  
  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles
    
    const query = searchQuery.toLowerCase().trim()
    return profiles.filter(profile => {
      const searchableText = [
        profile.username,
        profile.profile_data?.full_name,
        profile.profile_data?.bio,
        profile.profile_data?.location,
        profile.account_type,
        ...(profile.profile_data?.tags || [])
      ].join(' ').toLowerCase()
      
      return searchableText.includes(query)
    })
  }, [profiles, searchQuery])
  
  const artists = useMemo(() => filteredProfiles.filter(p => p.account_type === 'artist').slice(0, ITEMS_PER_SECTION), [filteredProfiles])
  const venues = useMemo(() => filteredProfiles.filter(p => p.account_type === 'venue').slice(0, ITEMS_PER_SECTION), [filteredProfiles])
  
  // Filter trending posts and events based on search query
  const filteredTrendingPosts = useMemo(() => {
    if (!searchQuery.trim()) return trendingPosts
    
    const query = searchQuery.toLowerCase().trim()
    return trendingPosts.filter(post => {
      const searchableText = [
        post.content,
        post.author?.username,
        post.author?.name,
        ...(post.tags || [])
      ].join(' ').toLowerCase()
      
      return searchableText.includes(query)
    })
  }, [trendingPosts, searchQuery])
  
  const filteredUpcomingEvents = useMemo(() => {
    if (!searchQuery.trim()) return upcomingEvents
    
    const query = searchQuery.toLowerCase().trim()
    return upcomingEvents.filter(event => {
      const searchableText = [
        event.title,
        event.description,
        event.venue?.name,
        event.venue?.location,
        ...(event.tags || [])
      ].join(' ').toLowerCase()
      
      return searchableText.includes(query)
    })
  }, [upcomingEvents, searchQuery])

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, -15, 0],
            transition: {
              duration: 4,
              repeat: Infinity,
              delay: 1
            }
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/3 to-teal-500/3 rounded-full blur-3xl"
          animate={{
            y: [0, -8, 0],
            x: [0, 8, 0],
            transition: {
              duration: 5,
              repeat: Infinity,
              delay: 2
            }
          }}
        />
      </div>

      <div className="relative z-10 space-y-8 p-6 lg:p-8">
      {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 border border-white/10 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="relative p-8 md:p-12 text-center">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            >
              Find new{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                artists
              </span>
              ,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                events
              </span>{" "}
              and{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                venues
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-gray-300 max-w-3xl mx-auto text-lg mb-6"
            >
              Curated just for you. Explore trending posts, upcoming events, and people you'll love to follow.
            </motion.p>

          </div>
        </motion.div>

      {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
      <Tabs defaultValue="foryou" className="space-y-8">
            <TabsList className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-1 w-full overflow-x-auto">
              <TabsTrigger value="foryou" className="rounded-xl data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200">
                <Sparkles className="h-4 w-4 mr-2" />
                For You
              </TabsTrigger>
              <TabsTrigger value="artists" className="rounded-xl data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200">
                <Music2 className="h-4 w-4 mr-2" />
                Artists
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-xl data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="venues" className="rounded-xl data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200">
                <Building2 className="h-4 w-4 mr-2" />
                Venues
              </TabsTrigger>
              <TabsTrigger value="music" className="rounded-xl data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-200">
                <Flame className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
        </TabsList>

        {/* For You */}
        <TabsContent value="foryou" className="space-y-8">
              {/* Simple Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="max-w-md mx-auto"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search artists, venues, events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-2 text-sm text-gray-400"
                  >
                    Searching for "{searchQuery}" • {filteredProfiles.length + filteredTrendingPosts.length + filteredUpcomingEvents.length} results
                  </motion.div>
                )}
              </motion.div>

          {/* Trending Posts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <CategorySection 
                  title="Trending Now" 
                  icon={<Flame className="h-4 w-4" />} 
                  href="/feed"
                  description="Hot content from the community"
                >
                  <HorizontalScrollGrid>
                    {isLoading && <SkeletonHorizontal count={4} />}
                    {!isLoading && filteredTrendingPosts.slice(0, 4).map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group flex-shrink-0"
                      >
                        <TrendingPostCard post={p} />
                      </motion.div>
                    ))}
                  </HorizontalScrollGrid>
                </CategorySection>
              </motion.div>

              {/* Featured Artists */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <CategorySection 
                  title="Featured Artists" 
                  icon={<Music2 className="h-4 w-4" />} 
                  href="/artists"
                  description="Discover talented musicians"
                >
                  <HorizontalScrollGrid>
                    {isLoading && <SkeletonHorizontal count={4} />}
                    {!isLoading && artists.slice(0, 4).map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group flex-shrink-0"
                      >
                        <CompactProfileCard profile={p} onOpen={openProfileModal} />
                      </motion.div>
                    ))}
                  </HorizontalScrollGrid>
                </CategorySection>
              </motion.div>

          {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <CategorySection 
                  title="Upcoming Events" 
                  icon={<Calendar className="h-4 w-4" />} 
                  href="/events"
                  description="Don't miss these shows"
                >
                  <HorizontalScrollGrid>
                    {isLoading && <SkeletonHorizontal count={4} />}
                    {!isLoading && filteredUpcomingEvents.slice(0, 4).map((e, index) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group flex-shrink-0"
                      >
                        <CompactEventCard event={e} />
                      </motion.div>
                    ))}
                  </HorizontalScrollGrid>
                </CategorySection>
              </motion.div>

              {/* Popular Venues */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                <CategorySection 
                  title="Popular Venues" 
                  icon={<Building2 className="h-4 w-4" />} 
                  href="/venues"
                  description="Amazing places to perform"
                >
                  <HorizontalScrollGrid>
                    {isLoading && <SkeletonHorizontal count={4} />}
                    {!isLoading && venues.slice(0, 4).map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group flex-shrink-0"
                      >
                        <CompactProfileCard profile={p} onOpen={openProfileModal} isVenue />
                      </motion.div>
                    ))}
                  </HorizontalScrollGrid>
                </CategorySection>
              </motion.div>
        </TabsContent>

        {/* Artists */}
        <TabsContent value="artists" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <DiscoverSection title="Top Artists" icon={<Music2 className="h-4 w-4" />} href="/artists">
                  <ConsistentGrid>
                    {isLoading && <SkeletonGrid count={ITEMS_PER_SECTION} />}
                    {!isLoading && artists.map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group"
                      >
                        <ProfileCard profile={p} onOpen={openProfileModal} />
                      </motion.div>
                    ))}
                  </ConsistentGrid>
                </DiscoverSection>
              </motion.div>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
          <DiscoverSection title="Upcoming Events" icon={<Calendar className="h-4 w-4" />} href="/events">
                  <ConsistentGrid>
                    {isLoading && <SkeletonGrid count={ITEMS_PER_SECTION} />}
                    {!isLoading && upcomingEvents.slice(0, ITEMS_PER_SECTION).map((e, index) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group"
                      >
                        <EventCard event={e} />
                      </motion.div>
                    ))}
                  </ConsistentGrid>
          </DiscoverSection>
              </motion.div>
        </TabsContent>

        {/* Venues */}
        <TabsContent value="venues" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <DiscoverSection title="Featured Venues" icon={<Building2 className="h-4 w-4" />} href="/venues">
                  <ConsistentGrid>
                    {isLoading && <SkeletonGrid count={ITEMS_PER_SECTION} />}
                    {!isLoading && venues.map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group"
                      >
                        <ProfileCard profile={p} onOpen={openProfileModal} isVenue />
                      </motion.div>
                    ))}
                  </ConsistentGrid>
                </DiscoverSection>
              </motion.div>
        </TabsContent>

        {/* Music */}
        <TabsContent value="music" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <DiscoverSection title="Trending Music" icon={<Flame className="h-4 w-4" />} href="/feed">
                  <ConsistentGrid>
                    {isLoading && <SkeletonGrid count={ITEMS_PER_SECTION} />}
                    {!isLoading && trendingPosts.slice(0, ITEMS_PER_SECTION).map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group"
                      >
                        <MusicCard post={p} />
                      </motion.div>
                    ))}
                  </ConsistentGrid>
          </DiscoverSection>
              </motion.div>
        </TabsContent>
      </Tabs>
        </motion.div>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50 rounded-3xl">
          <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-400" />
                Profile Details
              </DialogTitle>
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
      </div>
    </div>
  )
}

// Enhanced Subcomponents with Consistent Design
function DiscoverSection({ title, icon, href, children }: { title: string; icon?: React.ReactNode; href?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl">
          {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">Discover amazing content</p>
          </div>
        </div>
        {href && (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-white/20 text-slate-200 hover:bg-white/10 hover:border-white/30 transition-all duration-200" 
            onClick={() => (window.location.href = href)}
          >
              See more
            <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        )}
              </div>
      {children}
            </div>
  )
}

function ConsistentGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
              </div>
  )
}

function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="h-[280px] bg-slate-800/50 rounded-2xl animate-pulse"
        />
      ))}
    </>
  )
}

function ProfileCard({ profile, onOpen, isVenue = false }: { profile: DemoProfile; onOpen: (p: DemoProfile) => void; isVenue?: boolean }) {
  const displayName = profile.profile_data?.name || profile.username
  const colorScheme = isVenue ? 'emerald' : 'purple'
  
  return (
    <Card className="h-full bg-slate-900/50 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/10 cursor-pointer" onClick={() => onOpen(profile)}>
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12 border border-white/20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className={`bg-gradient-to-r ${isVenue ? 'from-emerald-500 to-teal-500' : 'from-purple-500 to-pink-500'} text-white`}>
              {displayName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-white font-medium text-sm truncate">{displayName}</span>
              {profile.verified && <Verified className="h-3 w-3 text-blue-400 flex-shrink-0" />}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {profile.location || (isVenue ? 'Venue' : 'Artist')}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {profile.stats?.followers || 0}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {profile.stats?.rating || 4.5}
            </div>
          </div>
          <Badge className={`text-xs ${
            isVenue ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' :
            'bg-purple-500/20 text-purple-200 border-purple-500/30'
          }`}>
            {isVenue ? 'Venue' : 'Artist'}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className={`w-full rounded-xl ${
          isVenue ? 'border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400/60' :
          'border-purple-500/40 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400/60'
        } transition-all duration-200`}>
          <Eye className="h-3.5 w-3.5 mr-2" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  )
}

function EventCard({ event }: { event: any }) {
  return (
    <Card className="h-full bg-slate-900/50 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Calendar className="h-4 w-4 text-blue-400" />
          </div>
          <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 text-xs">
            Event
          </Badge>
        </div>
        <div className="flex-1 mb-4">
          <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{event.name || event.title}</h3>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {new Date(event.event_date || event.date).toLocaleDateString()}
            </div>
            {event.venue_name && (
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="w-full rounded-xl border-blue-500/40 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/60 transition-all duration-200">
          View Event
          <ArrowRight className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}

function MusicCard({ post }: { post: any }) {
  return (
    <Card className="h-full bg-slate-900/50 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-pink-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-500/10">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={post.profiles?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm">
              {(post.profiles?.username || 'U')[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{post.profiles?.username || 'user'}</div>
            <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</div>
          </div>
          <Flame className="h-4 w-4 text-pink-400" />
        </div>
        <div className="text-gray-200 text-sm line-clamp-3 flex-1 mb-4">{post.content}</div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {Math.floor(Math.random() * 100) + 10}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {Math.floor(Math.random() * 500) + 50}
            </div>
          </div>
          <Share2 className="h-3 w-3 hover:text-white cursor-pointer transition-colors" />
        </div>
        <Button size="sm" variant="outline" className="w-full rounded-xl border-pink-500/40 text-pink-200 hover:bg-pink-500/20 hover:border-pink-400/60 transition-all duration-200">
          <PlayCircle className="h-3.5 w-3.5 mr-2" />
          Open Post
              </Button>
        </CardContent>
      </Card>
  )
}

// New Category-based Components for Horizontal Scrolling
function CategorySection({ title, icon, href, description, children }: { 
  title: string; 
  icon?: React.ReactNode; 
  href?: string; 
  description?: string;
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {description && <p className="text-sm text-gray-400">{description}</p>}
          </div>
        </div>
        {href && (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-white/20 text-slate-200 hover:bg-white/10 hover:border-white/30 transition-all duration-200" 
            onClick={() => (window.location.href = href)}
          >
            See more
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

function HorizontalScrollGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {children}
    </div>
  )
}

function SkeletonHorizontal({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="w-[280px] h-[200px] bg-slate-800/50 rounded-2xl animate-pulse flex-shrink-0"
        />
      ))}
    </>
  )
}

function TrendingPostCard({ post }: { post: any }) {
  return (
    <Card className="w-[280px] h-[200px] bg-slate-900/50 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/10">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={post.profiles?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
              {(post.profiles?.username || 'U')[0]}
            </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{post.profiles?.username || 'user'}</div>
            <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</div>
          </div>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </div>
        <div className="text-gray-200 text-sm line-clamp-3 flex-1 mb-3">{post.content}</div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-3 w-3" />
            <span>{Math.floor(Math.random() * 100) + 10}</span>
            <Eye className="h-3 w-3 ml-2" />
            <span>{Math.floor(Math.random() * 500) + 50}</span>
          </div>
          <Share2 className="h-3 w-3 hover:text-white cursor-pointer transition-colors" />
        </div>
        <Button size="sm" variant="outline" className="w-full rounded-xl border-purple-500/40 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400/60 transition-all duration-200">
          <PlayCircle className="h-3 w-3 mr-2" />
          View
        </Button>
      </CardContent>
    </Card>
  )
}

function CompactProfileCard({ profile, onOpen, isVenue = false }: { 
  profile: DemoProfile; 
  onOpen: (p: DemoProfile) => void; 
  isVenue?: boolean 
}) {
  const displayName = profile.profile_data?.name || profile.username
  
  return (
    <Card className="w-[280px] h-[200px] bg-slate-900/50 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/10 cursor-pointer" onClick={() => onOpen(profile)}>
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-white/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className={`bg-gradient-to-r ${isVenue ? 'from-emerald-500 to-teal-500' : 'from-purple-500 to-pink-500'} text-white`}>
                {displayName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white font-medium text-sm truncate">{displayName}</span>
                {profile.verified && <Verified className="h-3 w-3 text-blue-400 flex-shrink-0" />}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {profile.location || (isVenue ? 'Venue' : 'Artist')}
              </div>
            </div>
          </div>
          {!profile.is_demo && (
            <div className="flex-shrink-0">
              <Badge className="bg-green-500/20 text-green-200 border-green-500/30 text-xs px-2 py-1">
                Live
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {profile.stats?.followers || 0}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {profile.stats?.rating || 4.5}
            </div>
          </div>
          <Badge className={`text-xs ${
            isVenue ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' :
            'bg-purple-500/20 text-purple-200 border-purple-500/30'
          }`}>
            {isVenue ? 'Venue' : 'Artist'}
          </Badge>
        </div>
        <div className="flex-1" />
        <Button size="sm" variant="outline" className={`w-full rounded-xl ${
          isVenue ? 'border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400/60' :
          'border-purple-500/40 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400/60'
        } transition-all duration-200`}>
          <Eye className="h-3 w-3 mr-2" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  )
}

function CompactEventCard({ event }: { event: any }) {
  return (
    <Card className="w-[280px] h-[200px] bg-slate-900/50 border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Calendar className="h-4 w-4 text-blue-400" />
          </div>
          <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 text-xs">
            Event
          </Badge>
        </div>
        <div className="flex-1 mb-4">
          <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{event.name || event.title}</h3>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {new Date(event.event_date || event.date).toLocaleDateString()}
            </div>
            {event.venue_name && (
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="w-full rounded-xl border-blue-500/40 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/60 transition-all duration-200">
          View Event
          <ArrowRight className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}