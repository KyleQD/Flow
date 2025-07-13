'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Clock,
  Verified,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { useFeed } from '@/hooks/use-feed'
import { useAuth } from '@/hooks/use-auth'
import type { ExtendedPost } from '@/lib/services/feed.service'
import Link from 'next/link'

interface PostCardProps {
  post: ExtendedPost
  onCommentClick?: () => void
  onShareClick?: () => void
}

// Helper function to generate profile URL based on username
function getProfileUrl(username: string | null | undefined) {
  if (!username) return '/profile/user'
  return `/profile/${username}`
}

export function PostCard({ post, onCommentClick, onShareClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [isMediaPlaying, setIsMediaPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const { likePost, unlikePost } = useFeed()
  const { user } = useAuth()

  const isLongContent = post.content.length > 300

  const handleLike = async () => {
    if (!user) return

    const wasLiked = isLiked
    const newCount = wasLiked ? likesCount - 1 : likesCount + 1

    // Optimistic update
    setIsLiked(!wasLiked)
    setLikesCount(newCount)

    try {
      if (wasLiked) {
        await unlikePost(post.id)
      } else {
        await likePost(post.id)
      }
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked)
      setLikesCount(likesCount)
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // TODO: Implement bookmark functionality
  }

  const formatContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const hashtagRegex = /#(\w+)/g
    const mentionRegex = /@(\w+)/g

    return content
      .replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      .replace(hashtagRegex, '<span class="text-blue-400 hover:text-blue-300 cursor-pointer">#$1</span>')
      .replace(mentionRegex, '<span class="text-purple-400 hover:text-purple-300 cursor-pointer">@$1</span>')
  }

  const renderMedia = () => {
    if (!post.post_media || post.post_media.length === 0) return null

    return (
      <div className="mt-4 rounded-lg overflow-hidden">
        {post.post_media.map((media, index) => (
          <div key={media.id} className="relative">
            {media.type === 'image' && (
              <img
                src={media.url}
                alt={media.alt_text || 'Post media'}
                className="w-full h-auto max-h-96 object-cover"
              />
            )}
            
            {media.type === 'video' && (
              <div className="relative">
                <video
                  src={media.url}
                  poster={media.thumbnail_url}
                  className="w-full h-auto max-h-96 object-cover"
                  controls={isMediaPlaying}
                  muted={isMuted}
                  onPlay={() => setIsMediaPlaying(true)}
                  onPause={() => setIsMediaPlaying(false)}
                />
                {!isMediaPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Button
                      size="lg"
                      className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      onClick={() => setIsMediaPlaying(true)}
                    >
                      <Play className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-white" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-white" />
                  )}
                </Button>
              </div>
            )}
            
            {media.type === 'audio' && (
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg">
                <audio
                  src={media.url}
                  controls
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Link href={getProfileUrl(post.profiles?.username)} className="flex-shrink-0">
                <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all duration-200">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>
                    {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link href={getProfileUrl(post.profiles?.username)} className="hover:underline">
                    <h4 className="font-semibold text-white">
                      {post.profiles?.full_name || post.profiles?.username}
                    </h4>
                  </Link>
                  {post.profiles?.is_verified && (
                    <Verified className="h-4 w-4 text-blue-400" />
                  )}
                  <Link href={getProfileUrl(post.profiles?.username)} className="hover:underline">
                    <span className="text-slate-400">@{post.profiles?.username}</span>
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                  {post.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{post.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-slate-300 hover:text-white">
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:text-white">
                  Report post
                </DropdownMenuItem>
                {user?.id === post.user_id && (
                  <>
                    <DropdownMenuItem className="text-slate-300 hover:text-white">
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:text-red-300">
                      Delete post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Post Content */}
          <div className="mb-4">
            <div
              className="text-slate-200 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatContent(
                  isLongContent && !showFullContent
                    ? post.content.substring(0, 300) + '...'
                    : post.content
                )
              }}
            />
            
            {isLongContent && (
              <Button
                variant="link"
                className="p-0 h-auto text-blue-400 hover:text-blue-300"
                onClick={() => setShowFullContent(!showFullContent)}
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.hashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer"
                >
                  #{hashtag}
                </Badge>
              ))}
            </div>
          )}

          {/* Media */}
          {renderMedia()}

          <Separator className="my-4 bg-slate-700/50" />

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
            {likesCount > 0 && (
              <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            )}
            {post.comments_count > 0 && (
              <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
            )}
            {post.shares_count > 0 && (
              <span>{post.shares_count} {post.shares_count === 1 ? 'share' : 'shares'}</span>
            )}
            {post.views_count > 0 && (
              <span>{post.views_count} {post.views_count === 1 ? 'view' : 'views'}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`transition-colors ${
                  isLiked
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-slate-400 hover:text-red-400'
                }`}
                onClick={handleLike}
              >
                <Heart
                  className={`h-5 w-5 mr-2 transition-all ${
                    isLiked ? 'fill-current' : ''
                  }`}
                />
                Like
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-blue-400"
                onClick={onCommentClick}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Comment
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-green-400"
                onClick={onShareClick}
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={`transition-colors ${
                isBookmarked
                  ? 'text-yellow-500 hover:text-yellow-400'
                  : 'text-slate-400 hover:text-yellow-400'
              }`}
              onClick={handleBookmark}
            >
              <Bookmark
                className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 