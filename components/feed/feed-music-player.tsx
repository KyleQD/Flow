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
  SkipBack,
  SkipForward
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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

interface MusicTrack {
  id: string
  title: string
  artist: string
  album?: string
  genre?: string
  duration?: number
  file_url: string
  cover_art_url?: string
  description?: string
  tags: string[]
  is_featured: boolean
  is_public: boolean
  stats: {
    plays: number
    likes: number
    comments: number
    shares: number
  }
  created_at: string
  author?: {
    id: string
    name: string
    username: string
    avatar_url?: string
    is_verified: boolean
  }
}

interface FeedMusicPlayerProps {
  track: MusicTrack
  onLike?: (trackId: string) => void
  onShare?: (trackId: string) => void
  onComment?: (trackId: string) => void
  isLiked?: boolean
  className?: string
  compact?: boolean
}

export function FeedMusicPlayer({ 
  track, 
  onLike, 
  onShare, 
  onComment,
  isLiked = false,
  className = '',
  compact = false
}: FeedMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track.duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showWaveform, setShowWaveform] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || 0)
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

  const handlePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        setIsLoading(true)
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      toast.error('Failed to play audio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audio.volume = newVolume
    setIsMuted(newVolume === 0)
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleLike = () => {
    onLike?.(track.id)
  }

  const handleShare = () => {
    onShare?.(track.id)
  }

  const handleComment = () => {
    onComment?.(track.id)
  }

  if (compact) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group ${className}`}>
        <div className="flex items-center gap-4">
          {/* Album Art */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl overflow-hidden">
              {track.cover_art_url ? (
                <img 
                  src={track.cover_art_url} 
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
            </div>
            
            {/* Play Button Overlay */}
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full bg-black/50 hover:bg-black/70 rounded-xl border-0 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">
              {track.title}
            </h3>
            <p className="text-gray-400 text-sm truncate">
              {track.artist}
            </p>
            {track.genre && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-2 py-1 text-xs mt-1">
                {track.genre}
              </Badge>
            )}
          </div>

          {/* Duration */}
          <div className="text-gray-400 text-sm">
            {formatTime(duration)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-8 w-8 p-0 ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0 text-gray-400 hover:text-purple-400"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <audio ref={audioRef} src={track.file_url} preload="metadata" />
      </div>
    )
  }

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 group ${className}`}>
      {/* Header with User Info */}
      {track.author && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={track.author.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {track.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{track.author.name}</span>
                {track.author.is_verified && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-2 py-0.5 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                posted a track {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}
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
                  Add to Playlist
                </DropdownMenuItem>
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

      {/* Main Player Section */}
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Album Art */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl overflow-hidden">
              {track.cover_art_url ? (
                <img 
                  src={track.cover_art_url} 
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
              )}
            </div>
            
            {/* Play Button Overlay */}
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full bg-black/50 hover:bg-black/70 rounded-2xl border-0 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </Button>
          </div>

          {/* Track Info and Controls */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {track.title}
              </h2>
              <p className="text-gray-300 text-lg mb-2">
                {track.artist}
              </p>
              {track.album && (
                <p className="text-gray-400 text-sm mb-3">
                  from {track.album}
                </p>
              )}
              {track.description && (
                <p className="text-gray-400 text-sm line-clamp-2">
                  {track.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {track.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {track.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index}
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-2 py-1 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {track.tags.length > 3 && (
                  <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-2 py-1 text-xs">
                    +{track.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Waveform Visualization */}
            <div className="mb-4">
              <div 
                ref={progressRef}
                onClick={handleSeek}
                className="relative h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                
                {/* Waveform bars */}
                <div className="absolute inset-0 flex items-center justify-between px-1">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-white/20 rounded-full"
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        opacity: i < (currentTime / duration) * 50 ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
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

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
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
                  className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{track.stats.plays.toLocaleString()} plays</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{track.stats.likes.toLocaleString()} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{track.stats.comments.toLocaleString()} comments</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={track.file_url} preload="metadata" />
    </div>
  )
}
