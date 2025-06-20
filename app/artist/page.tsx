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
  Loader2
} from "lucide-react"
import { cn } from "@/utils"
import { useArtist } from "@/contexts/artist-context"
import Link from "next/link"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const floatingAnimation = {
  y: [0, -10, 0]
}

const quickActions = [
  { 
    title: "Upload Track", 
    icon: Upload, 
    color: "from-purple-500 via-fuchsia-500 to-pink-600", 
    href: "/artist/content",
    description: "Share your latest creation"
  },
  { 
    title: "Create Event", 
    icon: CalendarIcon, 
    color: "from-blue-500 via-cyan-500 to-teal-600", 
    href: "/artist/events",
    description: "Plan your next show"
  },
  { 
    title: "Messages", 
    icon: MessageSquare, 
    color: "from-green-500 via-emerald-500 to-teal-600", 
    href: "/artist/messages",
    description: "Connect with fans"
  },
  { 
    title: "Analytics", 
    icon: BarChart2, 
    color: "from-pink-500 via-rose-500 to-red-600", 
    href: "/artist/business",
    description: "Track your performance"
  }
]

const recentActivity = [
  {
    id: 1,
    title: "New Release",
    description: "Your single 'Midnight Dreams' was uploaded",
    date: "2024-03-15",
    type: "release",
    icon: Disc,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    status: "active"
  },
  {
    id: 2,
    title: "Performance",
    description: "Upcoming show at Madison Square Garden",
    date: "2024-04-20",
    type: "event",
    icon: Radio,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    status: "upcoming"
  },
  {
    id: 3,
    title: "Achievement",
    description: "Reached 1M monthly listeners on Spotify",
    date: "2024-03-10",
    type: "milestone",
    icon: Award,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    status: "completed"
  },
  {
    id: 4,
    title: "New Collaboration",
    description: "Started working with producer Mike Stevens",
    date: "2024-03-08",
    type: "collaboration",
    icon: Users,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    status: "active"
  }
]

export default function ArtistDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, profile, stats, isLoading, features, displayName, avatarInitial, syncArtistName } = useArtist()

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

  // Auto-sync artist name if it's missing
  useEffect(() => {
    if (profile && !profile.artist_name && user) {
      console.log('Artist name is missing, attempting to sync...')
      syncArtistName()
    }
  }, [profile, user, syncArtistName])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="text-xl">Loading your dashboard...</span>
        </div>
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
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/3 to-teal-500/3 rounded-full blur-3xl"
          animate={{
            y: [0, -10, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Header */}
      <div className="border-b border-slate-800/50 bg-black/40 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-sm text-slate-400">Here's what's happening with your music.</p>
              </div>
            </motion.div>
            
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 lg:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full lg:w-[200px] bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-start space-x-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg rounded-xl"
                  asChild
                >
                  <Link href="/artist/content">
                    <Plus className="mr-1 lg:mr-2 h-4 w-4" />
                    <span className="hidden lg:inline">New Content</span>
                    <span className="lg:hidden">New</span>
                  </Link>
                </Button>
                <Link href="/artist/messages">
                  <Button
                    size="icon"
                    className="rounded-xl bg-slate-800/50 hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 transition-all shadow-lg"
                    aria-label="Go to messages"
                  >
                    <MessageSquare className="h-5 w-5 text-purple-400 hover:text-white transition-colors" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
        {/* Profile Completion Alert */}
        {profile && (!profile.bio || !profile.genres || !profile.artist_name) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {dynamicStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                transition: { type: "spring", stiffness: 400, damping: 17 }
              }}
              className="group cursor-pointer"
            >
              <Card 
                className={cn(
                  "bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60",
                  "border border-slate-700/30 backdrop-blur-xl",
                  "transition-all duration-500 hover:border-slate-600/50",
                  "hover:shadow-2xl hover:shadow-slate-900/50",
                  "relative overflow-hidden",
                  stat.glowColor && `hover:${stat.glowColor}`
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                  stat.color
                )} />
                
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <motion.div 
                    className={cn(
                      "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-xl",
                      "border border-white/10 group-hover:border-white/20 transition-all duration-300",
                      stat.color
                    )}
                    whileHover={{ 
                      rotate: 360,
                      transition: { duration: 0.6, ease: "easeInOut" }
                    }}
                  >
                    <stat.icon className="h-6 w-6 text-white drop-shadow-sm" />
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-white group-hover:to-slate-100"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "flex items-center text-xs font-medium transition-colors duration-300", 
                      stat.trend === "up" 
                        ? "text-emerald-400 group-hover:text-emerald-300" 
                        : "text-rose-400 group-hover:text-rose-300"
                    )}>
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                      >
                        {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      </motion.div>
                      {stat.change}
                    </div>
                    <div className="w-[60%]">
                      <Progress 
                        value={stat.progress} 
                        className="h-2 bg-slate-800/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-slate-700/30 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-slate-200 flex items-center group">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5 mr-3 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                </motion.div>
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Quick Actions
                </span>
              </CardTitle>
              <CardDescription className="text-slate-400">Fast access to your most used features</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                    whileHover={{ 
                      scale: 1.08,
                      y: -5,
                      transition: { type: "spring", stiffness: 400, damping: 17 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={action.href}>
                      <Button
                        variant="ghost"
                        className="h-24 w-full flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-slate-800/30 to-slate-900/50 hover:from-slate-700/50 hover:to-slate-800/70 border border-slate-700/30 hover:border-slate-600/50 rounded-2xl backdrop-blur-sm transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <motion.div 
                          className={cn("h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg border border-white/10 group-hover:border-white/20 transition-all duration-300", action.color)}
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <action.icon className="h-6 w-6 text-white drop-shadow-sm" />
                        </motion.div>
                        <div className="text-center space-y-1 relative z-10">
                          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">{action.title}</span>
                          <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">{action.description}</p>
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-slate-700/30 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
              
              <CardHeader className="flex flex-row items-center justify-between relative z-10">
                <div>
                  <CardTitle className="text-slate-200 flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-5 w-5 text-cyan-400" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Recent Activity
                    </span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">Your latest updates and achievements</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ 
                        x: 4,
                        transition: { type: "spring", stiffness: 400, damping: 17 }
                      }}
                      className={cn(
                        "flex items-center space-x-4 p-4 rounded-2xl group transition-all duration-300 relative overflow-hidden border",
                        activity.bgColor,
                        activity.borderColor,
                        "hover:border-opacity-50 hover:bg-opacity-80"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      
                      <motion.div 
                        className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center relative z-10 border border-white/10 group-hover:border-white/20 transition-all duration-300",
                          activity.bgColor
                        )}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -5, 5, 0],
                          transition: { duration: 0.6 }
                        }}
                      >
                        <activity.icon className={cn("h-7 w-7 drop-shadow-sm", activity.color)} />
                      </motion.div>
                      
                      <div className="flex-1 min-w-0 relative z-10">
                        <motion.div 
                          className="font-semibold text-white group-hover:text-slate-100 transition-colors duration-300"
                          whileHover={{ x: 2 }}
                        >
                          {activity.title}
                        </motion.div>
                        <div className="text-sm text-slate-400 group-hover:text-slate-300 truncate transition-colors duration-300">
                          {activity.description}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{activity.date}</div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "relative z-10 transition-colors duration-300",
                          activity.status === "completed" && "bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20",
                          activity.status === "active" && "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20",
                          activity.status === "upcoming" && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 group-hover:bg-yellow-500/20"
                        )}
                      >
                        {activity.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800/50" asChild>
                    <Link href="/artist/feed">View All Activity</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-slate-700/30 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="text-slate-200 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                  Your Growth
                </CardTitle>
                <CardDescription className="text-slate-400">This month's highlights</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalTracks}</div>
                  <div className="text-sm text-slate-400">Total Tracks</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalEvents}</div>
                  <div className="text-sm text-slate-400">Upcoming Events</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalCollaborations}</div>
                  <div className="text-sm text-slate-400">Active Collaborations</div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  asChild
                >
                  <Link href="/artist/business">View Full Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}