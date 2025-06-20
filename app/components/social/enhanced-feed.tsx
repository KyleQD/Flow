"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSocial } from "@/context/social-context"
import { useAuth } from "@/context/auth-context"
import { useInView } from "react-intersection-observer"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Clock, Star, Users } from "lucide-react"

interface Post {
  id: string
  userId: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  media?: {
    type: "image" | "video"
    url: string
  }[]
}

interface EnhancedFeedProps {
  initialTab?: "trending" | "latest" | "following"
  showTabs?: boolean
  className?: string
}

export function EnhancedFeed({ initialTab = "trending", showTabs = true, className = "" }: EnhancedFeedProps) {
  const { user: currentUser } = useAuth()
  const { posts, users, loadMorePosts } = useSocial()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [feedPosts, setFeedPosts] = useState<Post[]>([])

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Filter and sort posts based on active tab
  const filterPosts = useCallback(
    (posts: Post[]) => {
      switch (activeTab) {
        case "trending":
          return [...posts].sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
        case "latest":
          return [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        case "following":
          // In a real app, you would filter by followed users
          return posts.filter((post) => post.userId !== currentUser?.id)
        default:
          return posts
      }
    },
    [activeTab, currentUser],
  )

  // Load initial posts
  useEffect(() => {
    const loadInitialPosts = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const filtered = filterPosts(posts)
        setFeedPosts(filtered)
        setHasMore(filtered.length >= 10)
      } catch (error) {
        console.error("Error loading posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialPosts()
  }, [posts, filterPosts])

  // Handle infinite scroll
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      const loadMore = async () => {
        setIsLoading(true)
        try {
          const newPosts = await loadMorePosts()
          if (newPosts.length === 0) {
            setHasMore(false)
          } else {
            setFeedPosts((prev) => [...prev, ...filterPosts(newPosts)])
          }
        } catch (error) {
          console.error("Error loading more posts:", error)
          setHasMore(false)
        } finally {
          setIsLoading(false)
        }
      }

      loadMore()
    }
  }, [inView, isLoading, hasMore, loadMorePosts, filterPosts])

  // Get user by ID
  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId)
  }

  // Loading state
  if (isLoading && feedPosts.length === 0) {
    return (
      <Card className={`bg-gray-900 text-white border-gray-800 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Feed</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-gray-900 text-white border-gray-800 ${className}`}>
      {showTabs && (
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trending" className="text-xs">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="latest" className="text-xs">
                <Clock className="h-4 w-4 mr-1" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="following" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Following
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <AnimatePresence mode="popLayout">
            {feedPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No posts to display</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {feedPosts.map((post, index) => {
                  const user = getUserById(post.userId)
                  if (!user) return null

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="p-4 hover:bg-gray-800/50"
                    >
                      {/* Post content here - you can import and use your PostItem component */}
                      <div className="text-sm">{post.content}</div>
                    </motion.div>
                  )
                })}

                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="py-4 flex justify-center">
                    {isLoading && <LoadingSpinner size="sm" />}
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 