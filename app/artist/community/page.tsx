"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  MessageSquare, 
  Briefcase, 
  Heart,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
  UserPlus,
  Zap,
  Globe,
  Star,
  Calendar,
  Bell,
  FolderOpen,
  GitBranch
} from "lucide-react"
import { SimpleCollaborationHub } from "@/components/collaboration/simple-collaboration-hub"
// import { EnhancedCollaborationHub } from "@/components/collaboration/enhanced-collaboration-hub"
// import { RealTimeActivityFeed } from "@/components/collaboration/real-time-activity-feed"

const communityFeatures = [
  { 
    label: "Fan Engagement", 
    icon: Heart, 
    href: "/artist/features/fan-engagement", 
    description: "Manage your fan club and connect with your audience",
    color: "from-pink-500 to-rose-600",
    stats: { total: 1247, recent: 23 },
    category: "fans"
  },
  { 
    label: "Network", 
    icon: Users, 
    href: "/artist/network", 
    description: "Connect with other artists and industry professionals",
    color: "from-blue-500 to-cyan-600",
    stats: { total: 89, recent: 5 },
    category: "professional"
  },
  { 
    label: "Jobs", 
    icon: Briefcase, 
    href: "/artist/jobs", 
    description: "Find and post music industry jobs",
    color: "from-green-500 to-emerald-600",
    stats: { total: 12, recent: 3 },
    category: "professional"
  },
  { 
    label: "Messages", 
    icon: MessageSquare, 
    href: "/artist/messages", 
    description: "Send and receive direct messages",
    color: "from-purple-500 to-violet-600",
    stats: { total: 156, recent: 8 },
    category: "communication"
  },
  {
    label: "Events",
    icon: Calendar,
    href: "/artist/events",
    description: "Discover and create community events",
    color: "from-orange-500 to-red-600",
    stats: { total: 7, recent: 2 },
    category: "events"
  },
  {
    label: "Collaborations",
    icon: Star,
    href: "/artist/collaborations",
    description: "Find artists to collaborate with and manage projects",
    color: "from-indigo-500 to-purple-600",
    stats: { total: 4, recent: 1 },
    category: "professional"
  },
  {
    label: "Project Workspaces",
    icon: Users,
    href: "/collaboration/projects",
    description: "Collaborative project management and file sharing",
    color: "from-green-500 to-teal-600",
    stats: { total: 2, recent: 0 },
    category: "professional"
  }
]

const quickStats = [
  { label: "Total Connections", value: "1.4K", change: "+12%", icon: Users },
  { label: "Active Conversations", value: "23", change: "+8", icon: MessageSquare },
  { label: "Community Events", value: "7", change: "+2", icon: Calendar },
]

const recentActivity = [
  {
    id: 1,
    type: "connection",
    user: { name: "Sarah Johnson", avatar: "/avatars/sarah.jpg", role: "Producer" },
    action: "connected with you",
    time: "2 hours ago"
  },
  {
    id: 2,
    type: "message",
    user: { name: "Mike Chen", avatar: "/avatars/mike.jpg", role: "Sound Engineer" },
    action: "sent you a message",
    time: "4 hours ago"
  },
  {
    id: 3,
    type: "event",
    user: { name: "Local Music Scene", avatar: "/avatars/community.jpg", role: "Community" },
    action: "invited you to 'Open Mic Night'",
    time: "1 day ago"
  }
]

const fadeIn = {
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

function CommunityFeatureCard({ feature, index }: { feature: typeof communityFeatures[0], index: number }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={feature.href} className="block group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/10 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                {feature.stats.recent > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    +{feature.stats.recent} new
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                {feature.label}
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                {feature.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{feature.stats.total.toLocaleString()} {feature.category === "fans" ? "fans" : "items"}</span>
              <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
                View all →
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default function CommunityDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredFeatures = useMemo(() => {
    return communityFeatures.filter(feature => {
      const matchesSearch = feature.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           feature.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || feature.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const categories = useMemo(() => {
    const cats = ["all", ...new Set(communityFeatures.map(f => f.category))]
    return cats.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: cat === "all" ? communityFeatures.length : communityFeatures.filter(f => f.category === cat).length
    }))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Community Hub
              </h1>
              <p className="text-sm text-slate-400">Connect, collaborate, and grow with the music community</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[250px] bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Find People
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-green-400 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Community Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-200 flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-purple-400" />
                    Community Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className={`transition-all duration-200 ${
                          selectedCategory === category.value
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "border-slate-700 text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        {category.label}
                        <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Features Grid */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="wait">
                {filteredFeatures.map((feature, index) => (
                  <CommunityFeatureCard
                    key={feature.label}
                    feature={feature}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredFeatures.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-slate-500 mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p>No community features found matching your criteria</p>
                </div>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                  variant="outline"
                  className="border-slate-700 text-slate-300"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>

          {/* Real-time Activity Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-slate-950/90 border-slate-800 text-white">
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Loading activity...</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Collaboration Hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <SimpleCollaborationHub />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-400">
                Fast access to community features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Send Message", icon: MessageSquare, href: "/artist/messages/new" },
                  { label: "Find Collaborators", icon: Users, href: "/artist/collaborations" },
                  { label: "New Project", icon: Plus, href: "/collaboration/projects/create" },
                  { label: "Browse Opportunities", icon: TrendingUp, href: "/artist/collaborations?tab=browse" }
                ].map((action, index) => (
                  <motion.div
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={action.href}>
                      <Button
                        variant="ghost"
                        className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-slate-800/50 transition-all duration-200"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">{action.label}</span>
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 