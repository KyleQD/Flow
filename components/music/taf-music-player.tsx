'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { tafConverter } from '@/lib/utils/taf-converter'
import { toast } from 'sonner'

interface TafMusicPlayerProps {
  track: {
    id: string
    title: string
    file_url: string
    cover_art_url?: string
    duration?: number
  }
  className?: string
  showControls?: boolean
  autoPlay?: boolean
}

export function TafMusicPlayer({ 
  track, 
  className = '', 
  showControls = true,
  autoPlay = false 
}: TafMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isTafFormat, setIsTafFormat] = useState(false)
  const [tafMetadata, setTafMetadata] = useState<any>(null)
  const [errorCorrection, setErrorCorrection] = useState<{
    dataShards: number
    parityShards: number
    recoveredShards: number
  } | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    checkTafFormat()
    if (autoPlay) {
      handlePlay()
    }
  }, [track.file_url])

  const checkTafFormat = async () => {
    try {
      const isTaf = await tafConverter.isTafFormat(track.file_url)
      setIsTafFormat(isTaf)
      
      if (isTaf) {
        const metadata = await tafConverter.getTafMetadata(track.file_url)
        setTafMetadata(metadata)
      }
    } catch (error) {
      console.error('Failed to check TAF format:', error)
    }
  }

  const handlePlay = async () => {
    if (!audioRef.current) return

    try {
      setIsLoading(true)

      if (isTafFormat) {
        // Handle TAF format with error correction
        await playTafAudio()
      } else {
        // Handle regular audio format
        await playRegularAudio()
      }

      setIsPlaying(true)
    } catch (error) {
      console.error('Failed to play audio:', error)
      toast.error('Failed to play audio file')
    } finally {
      setIsLoading(false)
    }
  }

  const playTafAudio = async () => {
    try {
      // Decode TAF file to audio buffer
      const audioBuffer = await tafConverter.decodeTaf(track.file_url)
      
      // Create audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Create gain node for volume control
      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.connect(audioContextRef.current.destination)
      }

      // Decode audio buffer
      const decodedBuffer = await audioContextRef.current.decodeAudioData(audioBuffer.buffer as ArrayBuffer)
      
      // Create source node
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }
      
      sourceNodeRef.current = audioContextRef.current.createBufferSource()
      sourceNodeRef.current.buffer = decodedBuffer
      
      // Connect to gain node
      sourceNodeRef.current.connect(gainNodeRef.current)
      
      // Set up event handlers
      sourceNodeRef.current.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }
      
      // Start playback
      sourceNodeRef.current.start(0)
      
      // Update duration
      setDuration(decodedBuffer.duration)
      
      // Start time tracking
      startTimeTracking()
      
    } catch (error) {
      console.error('Failed to play TAF audio:', error)
      throw error
    }
  }

  const playRegularAudio = async () => {
    if (!audioRef.current) return
    
    try {
      await audioRef.current.play()
      setDuration(audioRef.current.duration || 0)
    } catch (error) {
      console.error('Failed to play regular audio:', error)
      throw error
    }
  }

  const handlePause = () => {
    if (isTafFormat) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop()
        sourceNodeRef.current = null
      }
    } else {
      audioRef.current?.pause()
    }
    setIsPlaying(false)
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    
    if (isTafFormat) {
      // For TAF format, we need to restart playback at new position
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop()
        playTafAudio()
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = newTime
      }
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume
    }
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? volume : 0
    }
    
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  const startTimeTracking = () => {
    const interval = setInterval(() => {
      if (isTafFormat) {
        if (sourceNodeRef.current && audioContextRef.current) {
          const currentTime = audioContextRef.current.currentTime
          setCurrentTime(currentTime)
        }
      } else {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime)
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      {/* TAF Format Indicator */}
      {isTafFormat && (
        <div className="mb-3 p-2 bg-purple-900/20 border border-purple-500/30 rounded-md">
          <div className="flex items-center gap-2 text-purple-300 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>TAF Format with Error Correction</span>
          </div>
          {tafMetadata && (
            <div className="mt-1 text-xs text-purple-400">
              Data Shards: {tafMetadata.dataShards} | Parity Shards: {tafMetadata.parityShards}
            </div>
          )}
        </div>
      )}

      {/* Track Info */}
      <div className="flex items-center gap-3 mb-4">
        {track.cover_art_url && (
          <img 
            src={track.cover_art_url} 
            alt={track.title}
            className="w-12 h-12 rounded-md object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{track.title}</h3>
          <p className="text-sm text-gray-400">
            {isTafFormat ? 'TAF Format' : 'Standard Format'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Progress 
          value={(currentTime / duration) * 100} 
          className="h-2 bg-slate-700"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlay}
              disabled={isLoading}
              className="text-white hover:bg-slate-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="text-white hover:bg-slate-700"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <div className="w-20">
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Hidden audio element for regular formats */}
      {!isTafFormat && (
        <audio
          ref={audioRef}
          src={track.file_url}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Audio error:', e)
            toast.error('Failed to load audio file')
          }}
        />
      )}
    </div>
  )
}
