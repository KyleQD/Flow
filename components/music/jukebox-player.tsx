'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Upload,
  Music,
  Disc3,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'

interface Track {
  id: string
  name: string
  artist: string
  file: File
  url: string
  duration?: number
}

interface JukeboxPlayerProps {
  onTrackChange?: (track: Track | null) => void
  onPlaybackStateChange?: (isPlaying: boolean) => void
}

export function JukeboxPlayer({ onTrackChange, onPlaybackStateChange }: JukeboxPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [showEqualizer, setShowEqualizer] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Handle file uploads
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    setIsUploading(true)
    const newTracks: Track[] = []

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('audio/')) {
        const track: Track = {
          id: `track_${Date.now()}_${index}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          file,
          url: URL.createObjectURL(file)
        }
        newTracks.push(track)
      }
    })

    setTracks(prev => [...prev, ...newTracks])
    setIsUploading(false)

    // Auto-play first track if no track is currently playing
    if (currentTrackIndex === -1 && newTracks.length > 0) {
      setCurrentTrackIndex(0)
    }
  }, [currentTrackIndex])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  // Audio playback controls
  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= tracks.length) return

    setCurrentTrackIndex(index)
    const track = tracks[index]
    
    if (audioRef.current) {
      audioRef.current.src = track.url
      audioRef.current.load()
      audioRef.current.play()
      setIsPlaying(true)
      onTrackChange?.(track)
      onPlaybackStateChange?.(true)
    }
  }, [tracks, onTrackChange, onPlaybackStateChange])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      onPlaybackStateChange?.(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
      onPlaybackStateChange?.(true)
    }
  }, [isPlaying, onPlaybackStateChange])

  const skipToNext = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length
    playTrack(nextIndex)
  }, [currentTrackIndex, tracks.length, playTrack])

  const skipToPrevious = useCallback(() => {
    const prevIndex = currentTrackIndex <= 0 ? tracks.length - 1 : currentTrackIndex - 1
    playTrack(prevIndex)
  }, [currentTrackIndex, tracks.length, playTrack])

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }, [isMuted])

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleEnded = useCallback(() => {
    skipToNext()
  }, [skipToNext])

  const handleSeek = useCallback((value: number[]) => {
    const newTime = (value[0] / 100) * duration
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }, [duration])

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Remove track
  const removeTrack = useCallback((index: number) => {
    setTracks(prev => {
      const newTracks = prev.filter((_, i) => i !== index)
      if (currentTrackIndex === index) {
        setCurrentTrackIndex(-1)
        setIsPlaying(false)
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }
      } else if (currentTrackIndex > index) {
        setCurrentTrackIndex(currentTrackIndex - 1)
      }
      return newTracks
    })
  }, [currentTrackIndex])

  const currentTrack = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null

  return (
    <div className="w-full space-y-6">
      {/* Jukebox Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-2xl font-mono text-yellow-400 mb-2">🎵 REAL JUKEBOX 🎵</div>
        <div className="text-sm font-mono text-gray-400">UPLOAD & PLAY YOUR TUNES</div>
      </motion.div>

      {/* File Upload Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-6"
      >
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-500 rounded-2xl p-8 text-center hover:border-yellow-400 transition-colors"
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-lg font-mono text-gray-300 mb-2">DROP AUDIO FILES HERE</div>
          <div className="text-sm font-mono text-gray-500 mb-4">MP3, WAV, OGG, M4A</div>
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload">
            <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 font-mono">
              SELECT FILES
            </Button>
          </label>
        </div>
      </motion.div>

      {/* Main Player */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-6"
        >
          {/* Vinyl Record Display */}
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
              className="relative"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full border-4 border-gray-400 shadow-2xl">
                <div className="absolute inset-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 border-gray-600"></div>
                <div className="absolute inset-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full border border-gray-500"></div>
                <div className="absolute inset-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border border-gray-600"></div>
                <div className="absolute inset-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border border-gray-700"></div>
                <div className="absolute inset-20 bg-gradient-to-br from-gray-900 to-black rounded-full border border-gray-800"></div>
                <div className="absolute inset-24 bg-black rounded-full border border-gray-900"></div>
                <div className="absolute inset-28 bg-gray-900 rounded-full border border-black"></div>
                <div className="absolute inset-32 bg-black rounded-full"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg"></div>
            </motion.div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-6">
            <div className="text-xl font-mono text-white mb-2">{currentTrack.name}</div>
            <div className="text-sm font-mono text-gray-400">{currentTrack.artist}</div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs font-mono text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              onClick={skipToPrevious}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-gray-500 hover:border-yellow-400"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
            
            <Button
              onClick={skipToNext}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-gray-500 hover:border-yellow-400"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-2 border-gray-500 hover:border-yellow-400"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              className="flex-1"
            />
          </div>
        </motion.div>
      )}

      {/* Playlist */}
      {tracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-6"
        >
          <div className="text-center mb-4">
            <div className="text-lg font-mono text-blue-400">PLAYLIST</div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  index === currentTrackIndex
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-500 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Music className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-mono text-white">{track.name}</div>
                    <div className="text-xs font-mono text-gray-400">{track.artist}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {index === currentTrackIndex && isPlaying && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Disc3 className="h-4 w-4 text-yellow-400" />
                    </motion.div>
                  )}
                  <Button
                    onClick={() => removeTrack(index)}
                    variant="outline"
                    size="icon"
                    className="w-6 h-6 rounded-full border border-gray-500 hover:border-red-400"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />
    </div>
  )
}
