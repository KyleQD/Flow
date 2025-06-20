"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSocial } from "@/context/social-context"
import { useAuth } from "../../../../context/auth-context"
import { LoadingSpinner } from "../../../../components/loading-spinner"
import { PostFeed } from "../../../../components/social/post-feed"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UserPostsPage() {
  const params = useParams()
  const username = params?.username as string
  const { users, loadingUsers } = useSocial()
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Find user by username
  useEffect(() => {
    if (!loadingUsers && username) {
      const user = users.find((u) => u.username === username)
      setProfileUser(user || null)
      setIsLoading(false)
    }
  }, [username, users, loadingUsers])

  if (isLoading || loadingUsers) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-gray-400 mb-6">The user you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button className="bg-purple-600 hover:bg-purple-700">Return to Home</Button>
        </Link>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/profile/${username}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">{profileUser.fullName}'s Posts</h1>
          <p className="text-gray-400">@{profileUser.username}</p>
        </div>
      </div>

      <Card className="bg-gray-900 text-white border-gray-800">
        <CardContent className="p-4">
          <PostFeed userId={profileUser.id} showPostCreator={isOwnProfile} />
        </CardContent>
      </Card>
    </div>
  )
}
