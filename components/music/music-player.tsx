"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Users
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MusicPlayerProps {
  track: {
    id: string
    title: string
    artist: string
    genre?: string
    duration?: number
    file_url: string
    cover_art_url?: string
    description?: string
    play_count?: number
    likes_count?: number
    comments_count?: number
    shares_count?: number
    tags?: string[]
    is_liked?: boolean
  }
  showStats?: boolean
  showActions?: boolean
  compact?: boolean
  onLike?: (musicId: string, liked: boolean) => void
  onComment?: (musicId: string) => void
  onShare?: (musicId: string) => void
  className?: string
}

export function MusicPlayer({
  track,
  showStats = true,
  showActions = true,
  compact = false,
  onLike,
  onComment,
  onShare,
  className = ''
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(track.is_liked || false)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
        
        // Record play
        await fetch('/api/music/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ musicId: track.id })
        })
      } catch (error) {
        console.error('Error playing audio:', error)
        toast.error('Failed to play audio')
      }
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progress = progressRef.current
    if (!audio || !progress) return

    const rect = progress.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressWidth = rect.width
    const clickPercent = clickX / progressWidth
    const newTime = clickPercent * audio.duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audio.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const handleLike = async () => {
    try {
      const response = await fetch('/api/music/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ musicId: track.id })
      })

      if (response.ok) {
        const { liked } = await response.json()
        setIsLiked(liked)
        onLike?.(track.id, liked)
        toast.success(liked ? 'Added to likes' : 'Removed from likes')
      }
    } catch (error) {
      console.error('Error liking music:', error)
      toast.error('Failed to like music')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  if (compact) {
    return (
      <Card className={`bg-slate-900/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Cover Art */}
            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
              {track.cover_art_url ? (
                <Image
                  src={track.cover_art_url}
                  alt={track.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-gray-500 text-xs">🎵</div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">
                {track.title}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {track.artist}
              </p>
            </div>

            {/* Play Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              disabled={isLoading}
              className="text-gray-400 hover:text-white"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="mt-2 relative h-1 bg-slate-700 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </CardContent>

        <audio ref={audioRef} src={track.file_url} preload="metadata" />
      </Card>
    )
  }

  return (
    <Card className={`bg-slate-900/50 border-slate-700/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Cover Art */}
          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
            {track.cover_art_url ? (
              <Image
                src={track.cover_art_url}
                alt={track.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-gray-500 text-lg">🎵</div>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white truncate">
                  {track.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {track.artist} {track.genre && `• ${track.genre}`}
                </p>
                {track.description && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {track.description}
                  </p>
                )}
                
                {/* Tags */}
                {track.tags && track.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {track.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-purple-500/30 text-purple-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                {showStats && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {track.play_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {track.play_count.toLocaleString()}
                      </span>
                    )}
                    {track.likes_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {track.likes_count.toLocaleString()}
                      </span>
                    )}
                    {track.comments_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {track.comments_count.toLocaleString()}
                      </span>
                    )}
                    {track.shares_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {track.shares_count.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`text-gray-400 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComment?.(track.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare?.(track.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem className="text-gray-300 hover:text-white">
                        <Clock className="h-4 w-4 mr-2" />
                        Add to Queue
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white">
                        <Users className="h-4 w-4 mr-2" />
                        View Artist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem className="text-gray-300 hover:text-white">
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Player Controls */}
            <div className="mt-4 space-y-3">
              {/* Progress Bar */}
              <div 
                ref={progressRef}
                className="relative h-2 bg-slate-700 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-white"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    ) : isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-gray-400 hover:text-white"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <audio ref={audioRef} src={track.file_url} preload="metadata" />
    </Card>
  )
} 