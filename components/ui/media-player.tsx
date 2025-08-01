'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaPlayerProps {
  src: string
  type: 'audio' | 'video'
  poster?: string
  title?: string
  artist?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  controls?: boolean
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onError?: (error: string) => void
}

export function MediaPlayer({
  src,
  type,
  poster,
  title,
  artist,
  className,
  autoPlay = false,
  loop = false,
  controls = true,
  onTimeUpdate,
  onEnded,
  onError
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState(0)

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize media element
  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const handleLoadedMetadata = () => {
      setDuration(media.duration)
      if (autoPlay) {
        media.play().catch(console.error)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime)
      setBuffered(media.buffered.length > 0 ? media.buffered.end(media.buffered.length - 1) : 0)
      onTimeUpdate?.(media.currentTime, media.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handleError = () => {
      onError?.('Failed to load media')
    }

    media.addEventListener('loadedmetadata', handleLoadedMetadata)
    media.addEventListener('timeupdate', handleTimeUpdate)
    media.addEventListener('play', handlePlay)
    media.addEventListener('pause', handlePause)
    media.addEventListener('ended', handleEnded)
    media.addEventListener('error', handleError)

    return () => {
      media.removeEventListener('loadedmetadata', handleLoadedMetadata)
      media.removeEventListener('timeupdate', handleTimeUpdate)
      media.removeEventListener('play', handlePlay)
      media.removeEventListener('pause', handlePause)
      media.removeEventListener('ended', handleEnded)
      media.removeEventListener('error', handleError)
    }
  }, [autoPlay, onTimeUpdate, onEnded, onError])

  // Auto-hide controls for video
  useEffect(() => {
    if (type !== 'video' || !controls) return

    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [type, controls, isPlaying])

  // Playback controls
  const togglePlay = useCallback(() => {
    const media = mediaRef.current
    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play().catch(console.error)
    }
  }, [isPlaying])

  const seek = useCallback((value: number) => {
    const media = mediaRef.current
    if (!media) return

    media.currentTime = value
    setCurrentTime(value)
  }, [])

  const skip = useCallback((seconds: number) => {
    const media = mediaRef.current
    if (!media) return

    media.currentTime = Math.max(0, Math.min(media.currentTime + seconds, media.duration))
  }, [])

  const toggleMute = useCallback(() => {
    const media = mediaRef.current
    if (!media) return

    media.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleVolumeChange = useCallback((value: number) => {
    const media = mediaRef.current
    if (!media) return

    media.volume = value
    setVolume(value)
    setIsMuted(value === 0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen().catch(console.error)
    }
  }, [isFullscreen])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render media element
  const renderMediaElement = () => {
    const commonProps = {
      ref: mediaRef as any,
      src,
      loop,
      preload: 'metadata',
      className: 'w-full h-full object-cover'
    }

    if (type === 'video') {
      return (
        <video
          {...commonProps}
          poster={poster}
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
      )
    }

    return (
      <audio
        {...commonProps}
        className="hidden"
      />
    )
  }

  // Render controls
  const renderControls = () => {
    if (!controls) return null

    return (
      <div className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0',
        type === 'audio' && 'relative bg-slate-900 rounded-lg'
      )}>
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={([value]) => handleVolumeChange(value)}
                className="w-20"
              />
            </div>

            {/* Fullscreen button for video */}
            {type === 'video' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render audio player with custom UI
  if (type === 'audio') {
    return (
      <Card className={cn('bg-slate-900 border-slate-700', className)}>
        <CardContent className="p-4">
          {/* Audio info */}
          {(title || artist) && (
            <div className="mb-4 text-center">
              {title && <div className="font-medium text-white">{title}</div>}
              {artist && <div className="text-sm text-gray-400">{artist}</div>}
            </div>
          )}

          {/* Audio visualization placeholder */}
          <div className="mb-4 h-20 bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 bg-purple-500 rounded-full transition-all duration-300',
                    isPlaying ? 'animate-pulse' : 'opacity-50'
                  )}
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          {renderControls()}
        </CardContent>
      </Card>
    )
  }

  // Render video player
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative group cursor-pointer',
        className
      )}
    >
      {renderMediaElement()}
      {renderControls()}
    </div>
  )
} 