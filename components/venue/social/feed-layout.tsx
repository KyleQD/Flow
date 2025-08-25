"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EnhancedFeed } from "./enhanced-feed"
import { PostCreatorLayout } from "./post-creator-layout"
import { UserRecommendation } from "../user-discovery/user-recommendation"
import { TrendingTopics } from "./trending-topics"
import { UpcomingEvents } from "./upcoming-events"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { Globe, Users, TrendingUp, Clock, Music, Calendar, Search, Filter, X, ArrowUp, Compass } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FeedLayoutProps {
  defaultTab?: string
  showPostCreator?: boolean
  showSidebar?: boolean
  className?: string
}

export function FeedLayout({
  defaultTab = "all",
  showPostCreator = true,
  showSidebar = true,
  className = "",
}: FeedLayoutProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Handle scroll events to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!isAuthenticated) {
    router.push("/login")
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showPostCreator && <PostCreatorLayout showSidebar={false} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Search and filters */}
          <Card className="bg-gray-900 text-white border-gray-800">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-gray-800 w-full flex overflow-x-auto scrollbar-hide">
                    <TabsTrigger value="all" className="flex items-center gap-1">
                      <Globe className="h-4 w-4" /> All
                    </TabsTrigger>
                    <TabsTrigger value="following" className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> Following
                    </TabsTrigger>
                    <TabsTrigger value="trending" className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" /> Trending
                    </TabsTrigger>
                    <TabsTrigger value="latest" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Latest
                    </TabsTrigger>
                    <TabsTrigger value="music" className="flex items-center gap-1">
                      <Music className="h-4 w-4" /> Music
                    </TabsTrigger>
                    <TabsTrigger value="events" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Events
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-gray-700 text-gray-300"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? "Hide filters" : "Show filters"}
                  </Button>

                  <div className="flex space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-purple-900/20 text-purple-400 border-purple-500/20 cursor-pointer"
                    >
                      #TourLife
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-purple-900/20 text-purple-400 border-purple-500/20 cursor-pointer"
                    >
                      #SoundCheck
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed content */}
          <EnhancedFeed
            filter={activeTab as any}
            showPostCreator={false}
            showFilters={false}
            searchQuery={searchQuery}
            showAdvancedFilters={showFilters}
          />
        </div>

        {showSidebar && (
          <div className="space-y-6">
            <UserRecommendation
              title="People to Follow"
              description="Industry professionals you might want to connect with"
              limit={3}
            />

            <TrendingTopics limit={5} />

            <UpcomingEvents limit={3} />

            <Card className="bg-gray-900 text-white border-gray-800 sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Compass className="h-4 w-4 mr-2 text-purple-400" />
                  Explore More
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-700 text-gray-300"
                    onClick={() => router.push("/explore")}
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    Discover Content
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-700 text-gray-300"
                    onClick={() => router.push("/network")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Find Connections
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-700 text-gray-300"
                    onClick={() => router.push("/events")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
              onClick={handleScrollToTop}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
