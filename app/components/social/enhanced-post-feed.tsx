"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "../loading-spinner"
import { useSocial } from "@/contexts/social-context"
import { useAuth } from "@/contexts/auth-context"
import { useInView } from "react-intersection-observer"
import { motion, AnimatePresence } from "framer-motion"
import { EnhancedPostCreator } from "./enhanced-post-creator"

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

interface EnhancedPostFeedProps {
  showPostCreator?: boolean
  className?: string
  userId?: string // For filtering posts by user
  tag?: string // For filtering posts by tag
}

export function EnhancedPostFeed({
  showPostCreator = true,
  className = "",
  userId,
  tag,
}: EnhancedPostFeedProps) {
  const { user: currentUser } = useAuth()
  const social = useSocial() as any
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Filter posts based on props
  const filterPosts = useCallback(
    (posts: Post[]) => {
      let filtered = [...posts]

      if (userId) {
        filtered = filtered.filter((post) => post.userId === userId)
      }

      if (tag) {
        filtered = filtered.filter((post) => post.content.toLowerCase().includes(`#${tag.toLowerCase()}`))
      }

      return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    [userId, tag],
  )

  // Load initial posts
  useEffect(() => {
    const loadInitialPosts = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const filtered = filterPosts(social.posts || [])
        setFeedPosts(filtered)
        setHasMore(filtered.length >= 10)
      } catch (error) {
        console.error("Error loading posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialPosts()
  }, [social.posts, filterPosts])

  // Handle infinite scroll
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      const loadMore = async () => {
        setIsLoading(true)
        try {
          const newPosts = await (social.loadMorePosts ? social.loadMorePosts() : Promise.resolve([]))
          if (newPosts.length === 0) {
            setHasMore(false)
          } else {
            const filtered = filterPosts(newPosts)
            setFeedPosts((prev) => [...prev, ...filtered])
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
  }, [inView, isLoading, hasMore, social.loadMorePosts, filterPosts])

  // Handle post creation
  const handlePostCreated = useCallback(() => {
    // Refresh the feed
    setFeedPosts((prev) => filterPosts(social.posts || []))
  }, [social.posts, filterPosts])

  // Get user by ID
  const getUserById = (userId: string) => {
    return (social.users || []).find((u: any) => u.id === userId)
  }

  // Loading state
  if (isLoading && feedPosts.length === 0) {
    return (
      <Card className={`bg-gray-900 text-white border-gray-800 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Posts</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showPostCreator && currentUser && (
        <EnhancedPostCreator onPostCreated={handlePostCreated} className="sticky top-4" />
      )}

      <Card className={`bg-gray-900 text-white border-gray-800 ${className}`}>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
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
    </div>
  )
} 