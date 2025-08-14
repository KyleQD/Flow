"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Music, 
  Users, 
  DollarSign, 
  BarChart2, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Heart,
  Headphones,
  Upload,
  MessageSquare,
  Activity,
  AlertCircle,
  Sparkles,
  Video,
  Briefcase,
  Disc,
  Award,
  Radio,
  Clock,
  Menu,
  Loader2,
  RefreshCw,
  User,
  Settings,
  MapPin,
  Eye,
  Play,
  Image as ImageIcon,
  FileText,
  Target,
  Zap,
  Bell,
  CheckCircle,
  CalendarDays,
  TrendingDown
} from "lucide-react"
import { cn } from "@/utils"
import { useArtist } from "@/contexts/artist-context"
import { useMultiAccount } from "@/hooks/use-multi-account"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { toast } from "sonner"
import { format, addDays, isToday, isTomorrow, differenceInDays } from "date-fns"
import { artistContentService } from '@/lib/services/artist-content.service'

// Import Phase 2 components
import { ArtistEventsOverview } from '@/components/dashboard/artist-events-overview'
import { ArtistContentOverview } from '@/components/dashboard/artist-content-overview'
import { ArtistActionItems } from '@/components/dashboard/artist-action-items'
import { ArtistBusinessInsights } from '@/components/dashboard/artist-business-insights'
import { ArtistSmartRecommendations } from '@/components/dashboard/artist-smart-recommendations'
import { ArtistNotifications } from '@/components/dashboard/artist-notifications'
import { ArtistAnalyticsOverview } from '@/components/dashboard/artist-analytics-overview'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const floatingAnimation = {
  y: [0, -10, 0]
}

// Enhanced quick actions with better categorization
const quickActions = [
  { 
    title: "Upload Track", 
    icon: Upload, 
    color: "from-purple-500 via-fuchsia-500 to-pink-600", 
    href: "/artist/music",
    description: "Share your latest creation",
    category: "content"
  },
  { 
    title: "Create Event", 
    icon: CalendarIcon, 
    color: "from-blue-500 via-cyan-500 to-teal-600", 
    href: "/artist/events",
    description: "Plan your next show",
    category: "events"
  },
  { 
    title: "Messages", 
    icon: MessageSquare, 
    color: "from-green-500 via-emerald-500 to-teal-600", 
    href: "/artist/messages",
    description: "Connect with fans",
    category: "social"
  },
  { 
    title: "Analytics", 
    icon: BarChart2, 
    color: "from-pink-500 via-rose-500 to-red-600", 
    href: "/artist/business",
    description: "Track your performance",
    category: "business"
  }
]

// Mock upcoming events data - used as fallback when no data available
const mockUpcomingEvents = [
  {
    id: "1",
    title: "Summer Festival 2024",
    date: addDays(new Date(), 7),
    venue: "Central Park",
    city: "New York",
    status: "confirmed",
    ticketSales: 450,
    capacity: 1000,
    revenue: 22500,
    type: "festival"
  },
  {
    id: "2", 
    title: "Album Release Party",
    date: addDays(new Date(), 14),
    venue: "The Grand Hall",
    city: "Los Angeles",
    status: "confirmed",
    ticketSales: 180,
    capacity: 300,
    revenue: 18000,
    type: "concert"
  },
  {
    id: "3",
    title: "Acoustic Night",
    date: addDays(new Date(), 21),
    venue: "Blue Note Jazz Club",
    city: "Chicago",
    status: "pending",
    ticketSales: 0,
    capacity: 150,
    revenue: 0,
    type: "concert"
  }
]

// Mock content performance data - used as fallback when no data available
const mockContentPerformance = [
  {
    id: "1",
    title: "Midnight Dreams",
    type: "track",
    plays: 15420,
    likes: 892,
    shares: 156,
    uploadDate: addDays(new Date(), -5),
    trend: "up"
  },
  {
    id: "2",
    title: "Live at Central Park",
    type: "video",
    views: 8920,
    likes: 445,
    shares: 89,
    uploadDate: addDays(new Date(), -3),
    trend: "up"
  },
  {
    id: "3",
    title: "Behind the Scenes",
    type: "photo",
    views: 3240,
    likes: 234,
    shares: 45,
    uploadDate: addDays(new Date(), -1),
    trend: "down"
  }
]

// Action items and tasks
const mockActionItems = [
  {
    id: "1",
    title: "Complete EPK",
    description: "Your Electronic Press Kit is 60% complete",
    priority: "high",
    dueDate: addDays(new Date(), 3),
    type: "profile"
  },
  {
    id: "2",
    title: "Review Collaboration Request",
    description: "Producer Mike Stevens wants to collaborate",
    priority: "medium",
    dueDate: addDays(new Date(), 7),
    type: "collaboration"
  },
  {
    id: "3",
    title: "Update Social Links",
    description: "Add your latest social media profiles",
    priority: "low",
    dueDate: addDays(new Date(), 14),
    type: "profile"
  }
]

export default function ArtistDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRetrying, setIsRetrying] = useState(false)
  const { user: authUser } = useAuth()
  const { currentAccount, userAccounts, switchAccount } = useMultiAccount()
  const { user, profile, stats, isLoading, features, displayName, avatarInitial, syncArtistName, refreshStats } = useArtist()
  
  // Real data state
  interface UpcomingEventItem {
    id: string
    title: string
    date: Date
    venue?: string
    city?: string
    status?: string
    ticketSales?: number
    capacity?: number
    revenue?: number
    type?: string
  }
  interface ContentItem {
    id: string
    title: string
    type: 'track' | 'video' | 'photo' | 'blog'
    plays?: number
    views?: number
    likes?: number
    uploadDate?: Date
    trend?: 'up' | 'down'
  }
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEventItem[]>([])
  const [recentContent, setRecentContent] = useState<ContentItem[]>([])

  // Check if we need to switch to artist account
  const artistAccount = userAccounts.find(acc => acc.account_type === 'artist')
  const isInArtistMode = currentAccount?.account_type === 'artist'

  // Generate dynamic stats from context
  const dynamicStats = [
    {
      title: "Total Revenue",
      value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      progress: Math.min((stats.totalRevenue / 100000) * 100, 100),
      color: "from-emerald-400 via-teal-500 to-cyan-600",
      glowColor: "shadow-emerald-500/25",
      hasData: true,
      dataSource: "Connected platforms"
    },
    {
      title: "Total Fans",
      value: `${(stats.totalFans / 1000).toFixed(1)}K`,
      change: "+8.2%",
      trend: "up",
      icon: Users,
      progress: Math.min((stats.totalFans / 200000) * 100, 100),
      color: "from-blue-400 via-indigo-500 to-purple-600",
      glowColor: "shadow-blue-500/25",
      hasData: true,
      dataSource: "Social media platforms"
    },
    {
      title: "Streams",
      value: `${(stats.totalStreams / 1000000).toFixed(1)}M`,
      change: stats.totalStreams > 500000 ? "+15.3%" : "-2.1%",
      trend: stats.totalStreams > 500000 ? "up" : "down",
      icon: Headphones,
      progress: Math.min((stats.totalStreams / 2000000) * 100, 100),
      color: "from-purple-400 via-fuchsia-500 to-pink-600",
      glowColor: "shadow-purple-500/25",
      hasData: true,
      dataSource: "Streaming platforms"
    },
    {
      title: "Engagement",
      value: `${stats.engagementRate}%`,
      change: "+5.3%",
      trend: "up",
      icon: Heart,
      progress: stats.engagementRate,
      color: "from-pink-400 via-rose-500 to-red-600",
      glowColor: "shadow-pink-500/25",
      hasData: true,
      dataSource: "Social media analytics"
    }
  ]

  // Calculate upcoming events summary (prefer real data, fallback to mocks)
  const eventsSource = upcomingEvents.length > 0 ? upcomingEvents : mockUpcomingEvents
  const upcomingEventsSummary = {
    total: eventsSource.length,
    confirmed: eventsSource.filter((e: any) => e.status === 'confirmed').length,
    pending: eventsSource.filter((e: any) => e.status === 'pending').length,
    totalRevenue: eventsSource.reduce((sum: number, e: any) => sum + (e.revenue || 0), 0),
    nextEvent: eventsSource[0]
  }

  // Calculate content performance summary (prefer real data)
  const contentItems: any[] = recentContent.length > 0 ? recentContent : mockContentPerformance as any
  const contentSummary = {
    totalTracks: stats.musicCount,
    totalVideos: stats.videoCount,
    totalPhotos: stats.photoCount,
    totalViews: contentItems.reduce((sum, c) => sum + (c.views || c.plays || 0), 0),
    totalLikes: contentItems.reduce((sum, c) => sum + (c.likes || 0), 0)
  }

  // Handle account switching
  const handleSwitchToArtist = async () => {
    if (!artistAccount) {
      toast.error("No artist account found. Please create one first.")
      return
    }

    try {
      setIsRetrying(true)
      await switchAccount(artistAccount.profile_id, 'artist')
      toast.success("Switched to artist mode")
    } catch (error) {
      console.error("Error switching to artist account:", error)
      toast.error("Failed to switch to artist mode")
    } finally {
      setIsRetrying(false)
    }
  }

  // Auto-sync artist name if it's missing
  useEffect(() => {
    if (profile && !profile.artist_name && user && isInArtistMode) {
      console.log('Artist name is missing, attempting to sync...')
      syncArtistName()
    }
  }, [profile, user, syncArtistName, isInArtistMode])

  // Load dashboard data (events + recent content) when authenticated in artist mode
  useEffect(() => {
    if (!user?.id || !isInArtistMode) return

    let aborted = false

    async function loadData() {
      try {
        const [events, music, videos, photos] = await Promise.all([
          artistContentService.getEvents(user.id, { upcoming: true, limit: 3 }).catch(() => []),
          artistContentService.getMusic(user.id, { limit: 5 }).catch(() => []),
          artistContentService.getVideos(user.id, { limit: 5 }).catch(() => []),
          artistContentService.getPhotos(user.id, { limit: 5 }).catch(() => []),
        ])

        if (aborted) return

        const mappedEvents: UpcomingEventItem[] = (events || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          date: new Date(e.event_date),
          venue: e.venue_name,
          city: e.venue_city,
          status: e.status,
          capacity: e.capacity ?? undefined,
          type: e.type,
        }))
        setUpcomingEvents(mappedEvents)

        const mappedContent: ContentItem[] = [
          ...(music || []).map((m: any) => ({
            id: m.id,
            title: m.title,
            type: 'track' as const,
            plays: m.metadata?.plays ?? 0,
            likes: m.metadata?.likes ?? 0,
            uploadDate: m.created_at ? new Date(m.created_at) : undefined,
            trend: 'up' as const,
          })),
          ...(videos || []).map((v: any) => ({
            id: v.id,
            title: v.title,
            type: 'video' as const,
            views: v.metadata?.views ?? 0,
            likes: v.metadata?.likes ?? 0,
            uploadDate: v.created_at ? new Date(v.created_at) : undefined,
            trend: 'up' as const,
          })),
          ...(photos || []).map((p: any) => ({
            id: p.id,
            title: p.title || 'Photo',
            type: 'photo' as const,
            views: p.metadata?.views ?? 0,
            likes: p.metadata?.likes ?? 0,
            uploadDate: p.created_at ? new Date(p.created_at) : undefined,
            trend: 'down' as const,
          })),
        ]

        setRecentContent(mappedContent.slice(0, 6))
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      }
    }

    loadData()
    return () => { aborted = true }
  }, [user?.id, isInArtistMode])

  // Show account switching prompt if not in artist mode
  if (!isInArtistMode && artistAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm max-w-md rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Music className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Switch to Artist Mode</h2>
              <p className="text-gray-400">
                You're currently in {currentAccount?.account_type || 'general'} mode. 
                Switch to your artist account to access the full dashboard.
              </p>
            </div>
            
            <Button 
              onClick={handleSwitchToArtist}
              disabled={isRetrying}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Switch to Artist Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Artist Dashboard</h2>
          <p className="text-gray-400">Setting up your music career hub...</p>
        </div>
      </div>
    )
  }

  // Show error state if no artist account exists
  if (!artistAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm max-w-md rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Artist Account</h2>
              <p className="text-gray-400">
                You don't have an artist account set up yet. Create one to access the artist dashboard.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/create?type=artist">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Artist Account
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"
          animate={floatingAnimation}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, -10, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-purple-500/20">
                <AvatarImage src={profile?.social_links?.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-gray-400">
                  Ready to make some music magic today?
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshStats()}
                className="border-slate-700 text-gray-300 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild variant="outline" size="sm" className="border-slate-700 text-gray-300 hover:text-white">
                <Link href="/artist/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your content, events, or analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
            />
          </div>
        </motion.div>

        {/* Profile Completion Alert */}
        {profile && (!profile.bio || !profile.genres || !profile.artist_name) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <span>Complete your artist profile to get discovered by more fans and industry professionals.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 self-start lg:self-center"
                  asChild
                >
                  <Link href="/artist/profile">Complete Profile</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dynamicStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 group rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} ${stat.glowColor}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{Math.round(stat.progress)}%</span>
                    </div>
                    <Progress value={stat.progress} className="h-2" />
                    <p className="text-xs text-gray-500">{stat.dataSource}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Scheduled Events & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scheduled Events Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-400" />
                        Scheduled Events
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Your upcoming performances and events
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm" className="border-slate-700 text-gray-300 hover:text-white">
                      <Link href="/artist/events">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingEventsSummary.total > 0 ? (
                    <div className="space-y-4">
                      {/* Next Event Highlight */}
                      {upcomingEventsSummary.nextEvent && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/20 rounded-2xl">
                                <CalendarIcon className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">Next Event</h3>
                                <p className="text-sm text-gray-400">
                                  {isToday(upcomingEventsSummary.nextEvent.date) ? 'Today' : 
                                   isTomorrow(upcomingEventsSummary.nextEvent.date) ? 'Tomorrow' :
                                   `in ${differenceInDays(upcomingEventsSummary.nextEvent.date, new Date())} days`}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {upcomingEventsSummary.nextEvent.status}
                            </Badge>
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {upcomingEventsSummary.nextEvent.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {upcomingEventsSummary.nextEvent.venue}, {upcomingEventsSummary.nextEvent.city}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {upcomingEventsSummary.nextEvent.ticketSales}/{upcomingEventsSummary.nextEvent.capacity}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${upcomingEventsSummary.nextEvent.revenue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Events Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-slate-800/50 rounded-2xl">
                          <div className="text-2xl font-bold text-blue-400">{upcomingEventsSummary.total}</div>
                          <div className="text-sm text-gray-400">Total Events</div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{upcomingEventsSummary.confirmed}</div>
                          <div className="text-sm text-gray-400">Confirmed</div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">{upcomingEventsSummary.pending}</div>
                          <div className="text-sm text-gray-400">Pending</div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">${(upcomingEventsSummary.totalRevenue / 1000).toFixed(1)}K</div>
                          <div className="text-sm text-gray-400">Projected Revenue</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No upcoming events scheduled</p>
                      <Button asChild className="bg-purple-600 hover:bg-purple-700">
                        <Link href="/artist/events">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Event
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Content Performance */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        Content Performance
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        How your content is performing
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm" className="border-slate-700 text-gray-300 hover:text-white">
                      <Link href="/artist/content">
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{contentSummary.totalTracks}</div>
                      <div className="text-sm text-gray-400">Tracks</div>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{contentSummary.totalVideos}</div>
                      <div className="text-sm text-gray-400">Videos</div>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{contentSummary.totalPhotos}</div>
                      <div className="text-sm text-gray-400">Photos</div>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-pink-400">{(contentSummary.totalViews / 1000).toFixed(1)}K</div>
                      <div className="text-sm text-gray-400">Total Views</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {(contentItems as any[]).map((content, index) => (
                      <div key={content.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-700/50 rounded-lg">
                            {content.type === 'track' && <Music className="h-4 w-4 text-purple-400" />}
                            {content.type === 'video' && <Video className="h-4 w-4 text-blue-400" />}
                            {content.type === 'photo' && <ImageIcon className="h-4 w-4 text-green-400" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{content.title}</h4>
                            <p className="text-sm text-gray-400">
                              {content.plays ? `${(content.plays / 1000).toFixed(1)}K plays` : `${(content.views / 1000).toFixed(1)}K views`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Heart className="h-4 w-4 text-red-400" />
                            {content.likes}
                          </div>
                          {content.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Action Items */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Fast access to your most used features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link href={action.href}>
                          <Card className="bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer group rounded-2xl">
                            <CardContent className="p-4 text-center">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className="h-5 w-5 text-white" />
                              </div>
                              <h3 className="font-semibold text-white text-sm mb-1">{action.title}</h3>
                              <p className="text-gray-400 text-xs">{action.description}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Items */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" />
                    Action Items
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Tasks that need your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActionItems.map((item, index) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          item.priority === 'high' ? 'bg-red-500/20' :
                          item.priority === 'medium' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <Bell className={`h-4 w-4 ${
                            item.priority === 'high' ? 'text-red-400' :
                            item.priority === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{item.title}</h4>
                          <p className="text-gray-400 text-xs mb-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${
                              item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Due {format(item.dueDate, 'MMM d')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Business Insights
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Key metrics and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Revenue Growth</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your revenue is up 12.5% this month. Consider releasing new content to maintain momentum.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Fan Engagement</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your latest track has 15% higher engagement. Share behind-the-scenes content to boost interaction.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Event Opportunity</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        You have 3 upcoming events. Promote them on social media to increase ticket sales.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Phase 2: Advanced Features */}
        <div className="mt-12 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-400" />
              Advanced Insights & Analytics
            </h2>
          </motion.div>

          {/* Smart Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ArtistSmartRecommendations 
              artistStats={stats}
              recentContent={mockContentPerformance}
              upcomingEvents={mockUpcomingEvents}
            />
          </motion.div>

          {/* Analytics Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ArtistAnalyticsOverview 
              data={undefined} // Will use mock data from component
              timeRange="30d"
            />
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <ArtistNotifications />
          </motion.div>
        </div>
      </div>
    </div>
  )
}