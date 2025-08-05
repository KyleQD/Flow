"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  ExternalLink,
  Heart,
  Share2,
  Download,
  Volume2,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Music,
  Disc3
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: string
  streams: number
  release_date: string
  cover_art?: string
  preview_url?: string
  spotify_url?: string
  apple_music_url?: string
  youtube_url?: string
  genre?: string
  featured?: boolean
}

interface MusicShowcaseProps {
  artistId: string
  artistName: string
  showFeaturedOnly?: boolean
  showPlayerControls?: boolean
  compact?: boolean
  className?: string
}

export function MusicShowcase({ 
  artistId, 
  artistName, 
  showFeaturedOnly = false,
  showPlayerControls = true,
  compact = false,
  className 
}: MusicShowcaseProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTracks()
  }, [artistId, showFeaturedOnly])

  const fetchTracks = async () => {
    try {
      setLoading(true)
      // TODO: Replace with real API call
      const response = await fetch(`/api/artists/${artistId}/music`)
      
      if (response.ok) {
        const data = await response.json()
        let tracks = data.tracks || []
        
        if (showFeaturedOnly) {
          tracks = tracks.filter((track: Track) => track.featured)
        }
        
        setTracks(tracks)
        if (tracks.length > 0 && !currentTrack) {
          setCurrentTrack(tracks[0])
        }
      } else {
        // Fallback to mock data
        const mockTracks: Track[] = [
          {
            id: "1",
            title: "Midnight Echoes",
            artist: artistName,
            album: "Digital Dreams",
            duration: "3:42",
            streams: 2500000,
            release_date: "2024-01-15",
            cover_art: "/album-placeholder.jpg",
            preview_url: "https://example.com/preview1.mp3",
            spotify_url: "https://open.spotify.com/track/example1",
            genre: "Electronic",
            featured: true
          },
          {
            id: "2", 
            title: "Neon Nights",
            artist: artistName,
            album: "Digital Dreams",
            duration: "4:18",
            streams: 1800000,
            release_date: "2024-01-15",
            cover_art: "/album-placeholder.jpg",
            preview_url: "https://example.com/preview2.mp3",
            spotify_url: "https://open.spotify.com/track/example2",
            genre: "Synthwave"
          },
          {
            id: "3",
            title: "Electric Pulse",
            artist: artistName,
            album: "Singles",
            duration: "3:15",
            streams: 950000,
            release_date: "2023-11-22",
            cover_art: "/single-placeholder.jpg",
            preview_url: "https://example.com/preview3.mp3",
            genre: "Electronic"
          }
        ]
        
        const filteredTracks = showFeaturedOnly 
          ? mockTracks.filter(track => track.featured)
          : mockTracks
          
        setTracks(filteredTracks)
        if (filteredTracks.length > 0) {
          setCurrentTrack(filteredTracks[0])
        }
      }
    } catch (error) {
      console.error('Error fetching tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatStreams = (streams: number) => {
    if (streams >= 1000000) {
      return `${(streams / 1000000).toFixed(1)}M`
    } else if (streams >= 1000) {
      return `${(streams / 1000).toFixed(1)}K`
    }
    return streams.toString()
  }

  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'string') return duration
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = (track?: Track) => {
    if (track && track.id !== currentTrack?.id) {
      setCurrentTrack(track)
      setIsPlaying(true)
      // TODO: Implement actual audio playback
    } else {
      setIsPlaying(!isPlaying)
      // TODO: Play/pause current track
    }
  }

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id)
    const nextIndex = (currentIndex + 1) % tracks.length
    setCurrentTrack(tracks[nextIndex])
    setIsPlaying(true)
  }

  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1
    setCurrentTrack(tracks[prevIndex])
    setIsPlaying(true)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
    // TODO: Seek to position in audio
  }

  if (loading) {
    return (
      <Card className={cn("bg-white/10 backdrop-blur border border-white/20", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-20 bg-white/20 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-white/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tracks.length === 0) {
    return (
      <Card className={cn("bg-white/10 backdrop-blur border border-white/20", className)}>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="h-10 w-10 text-purple-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No Music Available</h3>
          <p className="text-gray-400 text-lg">
            This artist hasn't uploaded any tracks yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={cn("bg-white/10 backdrop-blur border border-white/20", className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Disc3 className="h-5 w-5" />
            Latest Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tracks.slice(0, 3).map((track) => (
              <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                  onClick={() => handlePlayPause(track)}
                >
                  {isPlaying && currentTrack?.id === track.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <img 
                  src={track.cover_art || "/placeholder-album.jpg"} 
                  alt={track.title}
                  className="h-10 w-10 rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{track.title}</h4>
                  <p className="text-sm text-white/70 truncate">{track.album}</p>
                </div>
                
                <div className="text-xs text-white/60">
                  {formatStreams(track.streams)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Now Playing / Featured Track */}
      {currentTrack && (
        <Card className="bg-white/10 backdrop-blur border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src={currentTrack.cover_art || "/placeholder-album.jpg"} 
                  alt={currentTrack.title}
                  className="h-24 w-24 rounded-lg shadow-2xl"
                />
                {currentTrack.featured && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black">
                    Featured
                  </Badge>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{currentTrack.title}</h3>
                <p className="text-white/70 text-lg">{currentTrack.artist}</p>
                {currentTrack.album && (
                  <p className="text-white/50">{currentTrack.album}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-white/60">{formatStreams(currentTrack.streams)} plays</span>
                  {currentTrack.genre && (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {currentTrack.genre}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {currentTrack.spotify_url && (
                  <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Spotify
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Player Controls */}
            {showPlayerControls && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={handlePrevTrack}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-white/90 rounded-full h-12 w-12"
                    onClick={() => handlePlayPause()}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={handleNextTrack}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/60">{formatDuration(currentTime)}</span>
                  <div className="flex-1">
                    <Progress 
                      value={(currentTime / duration) * 100} 
                      className="h-2 bg-white/20"
                    />
                  </div>
                  <span className="text-sm text-white/60">{currentTrack.duration}</span>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-white/60" />
                    <div className="w-20">
                      <Progress value={volume} className="h-1 bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Track List */}
      <Card className="bg-white/10 backdrop-blur border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            {showFeaturedOnly ? "Featured Tracks" : "All Music"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div 
                key={track.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
                  currentTrack?.id === track.id && "bg-white/10"
                )}
                onClick={() => handlePlayPause(track)}
              >
                <div className="w-8 text-center">
                  {isPlaying && currentTrack?.id === track.id ? (
                    <Volume2 className="h-4 w-4 text-green-400 mx-auto" />
                  ) : (
                    <span className="text-white/60 text-sm">{index + 1}</span>
                  )}
                </div>
                
                <img 
                  src={track.cover_art || "/placeholder-album.jpg"} 
                  alt={track.title}
                  className="h-12 w-12 rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium truncate",
                    currentTrack?.id === track.id ? "text-green-400" : "text-white"
                  )}>
                    {track.title}
                  </h4>
                  <p className="text-sm text-white/70 truncate">{track.album}</p>
                </div>
                
                <div className="text-right text-sm text-white/60">
                  <p>{formatStreams(track.streams)}</p>
                  <p>{track.duration}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  {track.spotify_url && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}