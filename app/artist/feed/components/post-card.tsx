"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { PostActions } from "./post-actions"
import type { Post } from "@/types/post"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: Post
  onLikeToggle: (postId: string, isLiked: boolean) => void
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const formattedDate = React.useMemo(
    () => formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    [post.created_at]
  )

  return (
    <Card className="bg-[#13151c] border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.profile_picture_url} alt={post.author.display_name} />
            <AvatarFallback>{post.author.display_name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{post.author.display_name}</span>
              <span className="text-gray-400">@{post.author.username}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400">{formattedDate}</span>
            </div>
            <p className="text-gray-100 whitespace-pre-wrap">{post.content}</p>
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {post.media_urls.map((url, index) => {
                  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                  return (
                    <div key={url} className="relative pt-[100%]">
                      {isImage ? (
                        <img
                          src={url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={url}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          controls
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <PostActions post={post} onLikeToggle={onLikeToggle} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 