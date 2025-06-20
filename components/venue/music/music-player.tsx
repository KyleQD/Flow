"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  ListMusic,
} from "lucide-react"
import Image from "next/image"

interface MusicPlayerProps {
  track?: {
    id: string
    title: string
    artist: string
    album: string
    coverArt: string
    audioSrc: string
    duration: number
  }
  onNext?: () => void
  onPrevious?: () => void
  onToggleLike?: () => void
  isLiked?: boolean
  showPlaylist?: boolean
  onTogglePlaylist?: () => void
  className?: string
}

export function MusicPlayer({
  track,
  onNext,
  onPrevious,
  onToggleLike,
  isLiked = false,
  showPlaylist = false,
  onTogglePlaylist,
  className = "",
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [prevVolume, setPrevVolume] = useState(80)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Default track if none provided
  const defaultTrack = {
    id: "default",
    title: "No track selected",
    artist: "Unknown Artist",
    album: "Unknown Album",
    coverArt: "/placeholder.svg?height=300&width=300&text=No+Track",
    audioSrc: "",
    duration: 0,
  }

  const currentTrack = track || defaultTrack

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  // Handle seek
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return
    const newVolume = value[0]
    setVolume(newVolume)
    audioRef.current.volume = newVolume / 100
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      setVolume(prevVolume)
      audioRef.current.volume = prevVolume / 100
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      setVolume(0)
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
        })
      }
    }
  }, [track, volume, isPlaying])

  // Handle track end
  const handleTrackEnd = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else if (onNext) {
      onNext()
    } else {
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  return (
    <div className={`bg-gray-900 border-t border-gray-800 p-3 ${className}`}>
      <audio
        ref={audioRef}
        src={currentTrack.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onVolumeChange={() => {
          if (audioRef.current) {
            setVolume(audioRef.current.volume * 100)
            setIsMuted(audioRef.current.muted)
          }
        }}
        hidden
      />

      <div className="flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          <div className="relative h-12 w-12 flex-shrink-0">
            <Image
              src={currentTrack.coverArt || "/placeholder.svg"}
              alt={currentTrack.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{currentTrack.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isLiked ? "text-red-500" : "text-gray-400 hover:text-white"}`}
            onClick={onToggleLike}
          >
            <Heart className={isLiked ? "fill-red-500" : ""} size={16} />
          </Button>
        </div>

        {/* Player Controls */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white ${isShuffle ? "text-purple-500" : ""}`}
              onClick={() => setIsShuffle(!isShuffle)}
            >
              <Shuffle size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <SkipBack size={16} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={togglePlay}
              disabled={!currentTrack.audioSrc}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={onNext}
              disabled={!onNext}
            >
              <SkipForward size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-gray-400 hover:text-white ${isRepeat ? "text-purple-500" : ""}`}
              onClick={() => setIsRepeat(!isRepeat)}
            >
              <Repeat size={16} />
            </Button>
          </div>

          <div className="flex items-center w-full max-w-xl gap-2 mt-1">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={currentTrack.duration || 100}
              step={1}
              onValueChange={handleSeek}
              disabled={!currentTrack.audioSrc}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-10">{formatTime(currentTrack.duration || 0)}</span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 w-1/5 min-w-[150px]">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <VolumeX size={16} />
            ) : volume < 50 ? (
              <Volume1 size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </Button>
          <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-24" />
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 text-gray-400 hover:text-white ${showPlaylist ? "text-purple-500" : ""}`}
            onClick={onTogglePlaylist}
          >
            <ListMusic size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
