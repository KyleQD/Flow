'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Clock,
  Users,
  Maximize2,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface VideoContent {
  id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  duration?: number
  category?: string
  tags: string[]
  created_at: string
  author?: {
    id: string
    name: string
    username: string
    avatar_url?: string
    is_verified: boolean
  }
  engagement: {
    likes: number
    views: number
    shares: number
    comments: number
  }
  metadata?: {
    aspect_ratio?: number
    orientation?: 'vertical' | 'horizontal'
  }
}

interface FeedVideoPlayerProps {
  video: VideoContent
  onLike?: (videoId: string) => void
  onShare?: (videoId: string) => void
  onComment?: (videoId: string) => void
  isLiked?: boolean
  className?: string
  compact?: boolean
}

export function FeedVideoPlayer({ 
  video, 
  onLike, 
  onShare, 
  onComment,
  isLiked = false,
  className = '',
  compact = false
}: FeedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(video.duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const updateTime = () => setCurrentTime(videoElement.currentTime)
    const updateDuration = () => setDuration(videoElement.duration || 0)
    const handleEnded = () => setIsPlaying(false)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    videoElement.addEventListener('timeupdate', updateTime)
    videoElement.addEventListener('loadedmetadata', updateDuration)
    videoElement.addEventListener('ended', handleEnded)
    videoElement.addEventListener('loadstart', handleLoadStart)
    videoElement.addEventListener('canplay', handleCanPlay)

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime)
      videoElement.removeEventListener('loadedmetadata', updateDuration)
      videoElement.removeEventListener('ended', handleEnded)
      videoElement.removeEventListener('loadstart', handleLoadStart)
      videoElement.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const handlePlayPause = async () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    try {
      if (isPlaying) {
        videoElement.pause()
        setIsPlaying(false)
      } else {
        setIsLoading(true)
        await videoElement.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error playing video:', error)
      toast.error('Failed to play video')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    videoElement.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    videoElement.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isMuted) {
      videoElement.volume = volume
      setIsMuted(false)
    } else {
      videoElement.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleLike = () => {
    onLike?.(video.id)
  }

  const handleShare = () => {
    onShare?.(video.id)
  }

  const handleComment = () => {
    onComment?.(video.id)
  }

  const isVertical = video.metadata?.orientation === 'vertical' || (video.metadata?.aspect_ratio && video.metadata.aspect_ratio < 1)

  if (compact) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group ${className}`}>
        <div className="relative">
          <div className={`${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black`}>
            <video
              ref={videoRef}
              src={video.video_url}
              poster={video.thumbnail_url}
              className="w-full h-full object-cover"
              preload="metadata"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 border-0 p-0"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </Button>
            </div>

            {/* Duration Badge */}
            {duration > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatTime(duration)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-white font-semibold line-clamp-2 group-hover:text-purple-300 transition-colors mb-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
              {video.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {video.author && (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={video.author.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                    {video.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-gray-300 text-sm">
                {video.author?.name || 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{video.engagement.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{video.engagement.likes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Header with User Info */}
      {video.author && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={video.author.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {video.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{video.author.name}</span>
                {video.author.is_verified && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-2 py-0.5 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                posted a video {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800">
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="relative">
        <div className={`${isVertical ? 'aspect-[9/16] max-w-md mx-auto' : 'aspect-video'} bg-black`}>
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.thumbnail_url}
            className="w-full h-full object-cover"
            preload="metadata"
          />
          
          {/* Play Button Overlay */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/20"
              >
                <Button
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  className="h-20 w-20 rounded-full bg-black/50 hover:bg-black/70 border-0 p-0"
                >
                  {isLoading ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
              >
                {/* Progress Bar */}
                <div 
                  onClick={handleSeek}
                  className="relative h-1 bg-white/20 rounded-full cursor-pointer mb-3"
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration Badge */}
          {duration > 0 && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatTime(duration)}
            </div>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {video.title}
        </h2>
        {video.description && (
          <p className="text-gray-300 mb-4 line-clamp-3">
            {video.description}
          </p>
        )}

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {video.tags.slice(0, 5).map((tag, index) => (
              <Badge 
                key={index}
                className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-2 py-1 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {video.tags.length > 5 && (
              <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-2 py-1 text-xs">
                +{video.tags.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-10 w-10 p-0 ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="h-10 w-10 p-0 text-gray-400 hover:text-purple-400"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-10 w-10 p-0 text-gray-400 hover:text-purple-400"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{video.engagement.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{video.engagement.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{video.engagement.comments.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
