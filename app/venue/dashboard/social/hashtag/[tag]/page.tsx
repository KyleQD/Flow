"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/context/social"
import { useAuth } from "@/context/auth"
import { LoadingSpinner } from "../../../../components/loading-spinner"
import { EnhancedPostFeed } from "@/components/social/enhanced-post-feed"
import { ArrowLeft, Hash, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { PostItem } from "@/app/venue/components/social/post-item"

export default function HashtagPage() {
  const params = useParams()
  const router = useRouter()
  const tag = params?.tag as string
  const { posts, loadingPosts, users } = useSocial()
  const { user: currentUser } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [postCount, setPostCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Count posts with this hashtag
  useEffect(() => {
    if (!loadingPosts && tag) {
      // In a real app, you would fetch posts with this hashtag from an API
      // For now, we'll just count posts that contain the tag in their content
      const count = posts.filter((post) => post.content.toLowerCase().includes(`#${tag.toLowerCase()}`)).length

      setPostCount(count)
      setIsLoading(false)
    }
  }, [tag, posts, loadingPosts])

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing)
  }

  if (isLoading || loadingPosts) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const hashtagPosts = posts.filter(post => 
    post.content.toLowerCase().includes(`#${tag}`.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center">
            <Hash className="h-6 w-6 mr-2 text-purple-400" />
            <h1 className="text-2xl font-bold">#{tag}</h1>
          </div>
          <p className="text-gray-400">{postCount} posts</p>
        </div>

        <Button
          variant={isFollowing ? "default" : "outline"}
          className={isFollowing ? "bg-purple-600" : "border-gray-700"}
          onClick={handleFollowToggle}
        >
          <Bell className="h-4 w-4 mr-2" />
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>

      <Card className="bg-gray-900 text-white border-gray-800">
        <CardHeader>
          <CardTitle>#{tag}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hashtagPosts.length > 0 ? (
              hashtagPosts.map(post => {
                const author = users.find(u => u.id === post.userId)
                return author ? (
                  <PostItem key={post.id} post={post} author={author} />
                ) : null
              })
            ) : (
              <p className="text-muted-foreground">No posts found with this hashtag.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
