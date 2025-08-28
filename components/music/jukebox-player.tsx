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
  RotateCcw,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkPlus,
  RefreshCw,
  ExternalLink,
  Rss,
  TrendingUp,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Track {
  id: string
  name: string
  artist: string
  file: File
  url: string
  duration?: number
}

interface RSSItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  category: string
  image?: string
  audioUrl?: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
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
  const [activeTab, setActiveTab] = useState('upload')
  const [rssItems, setRssItems] = useState<RSSItem[]>([])
  const [isLoadingRSS, setIsLoadingRSS] = useState(false)
  const [rssCategory, setRssCategory] = useState('all')
  const [isUsingRealRSS, setIsUsingRealRSS] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  // RSS Categories - Updated to match actual RSS source categories
  const rssCategories = [
    { value: 'all', label: 'All Music', icon: Music },
    { value: 'Music News', label: 'Music News', icon: Star },
    { value: 'Indie Music', label: 'Indie Music', icon: TrendingUp },
    { value: 'Hip-Hop', label: 'Hip-Hop', icon: Music },
    { value: 'Electronic Music', label: 'Electronic', icon: Music },
    { value: 'Underground Music', label: 'Underground', icon: Music },
    { value: 'Local Music', label: 'Local Music', icon: Music }
  ]

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

  // Load RSS feed - Enhanced to better handle real RSS sources
  const loadRSSFeed = useCallback(async (category: string = 'all') => {
    setIsLoadingRSS(true)
    try {
      console.log('[Jukebox] Loading RSS feed for category:', category)
      
      let url = '/api/feed/rss-news?limit=25'
      if (category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`
      }
      
      console.log('[Jukebox] Fetching from URL:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`RSS API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[Jukebox] RSS API response:', {
        success: data.success,
        totalItems: data.news?.length || 0,
        sources: data.sources,
        categories: data.categories,
        successfulSources: data.successfulSources?.length || 0,
        failedSources: data.failedSources?.length || 0
      })
      
      if (data.success && data.news && data.news.length > 0) {
        const processedItems: RSSItem[] = data.news.map((item: any, index: number) => ({
          id: `rss_${item.id || index}`,
          title: item.title || 'Untitled',
          description: item.description || '',
          link: item.link || '#',
          pubDate: item.pubDate || new Date().toISOString(),
          source: item.source || 'Unknown',
          category: item.category || 'Music',
          image: item.image || `https://dummyimage.com/400x250/8b5cf6/ffffff?text=${item.source?.charAt(0) || 'M'}`,
          audioUrl: item.audioUrl || null,
          likes: Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 30) + 2,
          isLiked: false,
          isBookmarked: false
        }))
        
        console.log('[Jukebox] Processed RSS items:', processedItems.length)
        setRssItems(processedItems)
        setIsUsingRealRSS(true)
        
        // Log RSS status for debugging
        if (data.successfulSources && data.successfulSources.length > 0) {
          console.log('[Jukebox] RSS Sources working:', data.successfulSources.length)
        }
        if (data.failedSources && data.failedSources.length > 0) {
          console.log('[Jukebox] RSS Sources failed:', data.failedSources.length)
        }
      } else {
        console.warn('[Jukebox] RSS API returned no data, using fallback')
        setRssItems(generateMockRSSItems())
        setIsUsingRealRSS(false)
      }
    } catch (error) {
      console.error('[Jukebox] Failed to load RSS feed:', error)
      // Fallback to mock data
      setRssItems(generateMockRSSItems())
      setIsUsingRealRSS(false)
    } finally {
      setIsLoadingRSS(false)
    }
  }, [])

  // Generate mock RSS items for fallback
  const generateMockRSSItems = (): RSSItem[] => {
    return [
      {
        id: 'mock_1',
        title: '🎵 New Indie Rock Album "Midnight Dreams" Released',
        description: 'The latest album from indie sensation "The Night Owls" features 12 tracks of atmospheric rock with haunting vocals and innovative production techniques.',
        link: '#',
        pubDate: new Date().toISOString(),
        source: 'Indie Music Weekly (Demo)',
        category: 'Indie Music',
        image: 'https://dummyimage.com/400x250/8b5cf6/ffffff?text=Indie+Rock',
        likes: 89,
        comments: 23,
        shares: 15,
        isLiked: false,
        isBookmarked: false
      },
      {
        id: 'mock_2',
        title: '🔥 Hip-Hop Artist "MC Flow" Drops Surprise EP',
        description: 'The underground hip-hop scene is buzzing with the unexpected release of "Street Poetry" - a 6-track EP that showcases raw talent and authentic storytelling.',
        link: '#',
        pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Hip-Hop Daily (Demo)',
        category: 'Hip-Hop',
        image: 'https://dummyimage.com/400x250/ef4444/ffffff?text=Hip-Hop',
        likes: 156,
        comments: 45,
        shares: 28,
        isLiked: false,
        isBookmarked: false
      },
      {
        id: 'mock_3',
        title: '🎧 Electronic Producer "SynthWave" Announces World Tour',
        description: 'Following the success of their latest album "Digital Dreams", electronic music producer SynthWave has announced a 20-city world tour starting next month.',
        link: '#',
        pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: 'Electronic Music News (Demo)',
        category: 'Electronic Music',
        image: 'https://dummyimage.com/400x250/06b6d4/ffffff?text=Electronic',
        likes: 234,
        comments: 67,
        shares: 42,
        isLiked: false,
        isBookmarked: false
      },
      {
        id: 'mock_4',
        title: '🎸 Rock Legends "The Thunder" Release First Album in 10 Years',
        description: 'After a decade-long hiatus, rock legends "The Thunder" have surprised fans with their new album "Electric Storm", featuring 14 tracks of pure rock energy.',
        link: '#',
        pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: 'Rock Music Today (Demo)',
        category: 'Music News',
        image: 'https://dummyimage.com/400x250/dc2626/ffffff?text=Rock',
        likes: 312,
        comments: 89,
        shares: 56,
        isLiked: false,
        isBookmarked: false
      },
      {
        id: 'mock_5',
        title: '🎷 Jazz Fusion Collective "Midnight Groove" Drops Experimental EP',
        description: 'Pushing the boundaries of jazz fusion, "Midnight Groove" releases their experimental EP "Urban Rhythms" featuring collaborations with electronic artists.',
        link: '#',
        pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: 'Jazz Weekly (Demo)',
        category: 'Underground Music',
        image: 'https://dummyimage.com/400x250/7c3aed/ffffff?text=Jazz',
        likes: 78,
        comments: 34,
        shares: 12,
        isLiked: false,
        isBookmarked: false
      }
    ]
  }

  // Load RSS feed on mount and category change
  useEffect(() => {
    loadRSSFeed(rssCategory)
  }, [rssCategory, loadRSSFeed])

  // Handle RSS interactions
  const handleLikeRSS = useCallback((itemId: string) => {
    setRssItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ))
  }, [])

  const handleBookmarkRSS = useCallback((itemId: string) => {
    setRssItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isBookmarked: !item.isBookmarked }
        : item
    ))
  }, [])

  const handleShareRSS = useCallback((item: RSSItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: item.link
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${item.title}\n${item.description}\n${item.link}`)
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
        <div className="text-sm font-mono text-gray-400">UPLOAD & DISCOVER MUSIC</div>
      </motion.div>

      {/* Main Jukebox Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black border-2 border-gray-500 rounded-2xl p-2 mb-6">
            <TabsTrigger 
              value="upload"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white font-mono text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              UPLOAD FILES
            </TabsTrigger>
            <TabsTrigger 
              value="feed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-mono text-sm"
            >
              <Rss className="h-4 w-4 mr-2" />
              MUSIC FEED
            </TabsTrigger>
            <TabsTrigger 
              value="playlist"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-mono text-sm"
            >
              <Music className="h-4 w-4 mr-2" />
              PLAYLIST
            </TabsTrigger>
          </TabsList>

          {/* Upload Files Tab */}
          <TabsContent value="upload" className="space-y-4">
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
          </TabsContent>

          {/* Music Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            {/* RSS Category Filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-lg font-mono text-blue-400">MUSIC DISCOVERY</div>
                {isUsingRealRSS ? (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-600 text-white text-xs font-mono">
                      LIVE RSS
                    </Badge>
                    <span className="text-xs font-mono text-green-400">
                      {rssItems.length} articles
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-600 text-white text-xs font-mono">
                      DEMO DATA
                    </Badge>
                    <span className="text-xs font-mono text-yellow-400">
                      {rssItems.length} articles
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => loadRSSFeed(rssCategory)}
                disabled={isLoadingRSS}
                variant="outline"
                size="sm"
                className="font-mono border-gray-500 hover:border-blue-400"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingRSS ? 'animate-spin' : ''}`} />
                REFRESH
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {rssCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.value}
                    onClick={() => setRssCategory(category.value)}
                    variant={rssCategory === category.value ? "default" : "outline"}
                    size="sm"
                    className={`font-mono text-xs ${
                      rssCategory === category.value 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600' 
                        : 'border-gray-500 hover:border-blue-400'
                    }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Button>
                )
              })}
            </div>

            {/* RSS Feed Content */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {isLoadingRSS ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                  <div className="text-sm font-mono text-gray-400 mt-2">LOADING MUSIC FEED...</div>
                </div>
              ) : rssItems.length > 0 ? (
                rssItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black border-2 border-gray-600 rounded-xl p-4 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-600 text-white text-xs font-mono">
                            {item.category}
                          </Badge>
                          <span className="text-xs font-mono text-gray-400">
                            {item.source}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-mono text-white mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        
                        <p className="text-xs font-mono text-gray-400 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {/* Interaction Buttons */}
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={() => handleLikeRSS(item.id)}
                            variant="ghost"
                            size="sm"
                            className={`font-mono text-xs ${
                              item.isLiked ? 'text-red-400' : 'text-gray-400'
                            } hover:text-red-400`}
                          >
                            <Heart className={`h-3 w-3 mr-1 ${item.isLiked ? 'fill-current' : ''}`} />
                            {item.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-mono text-xs text-gray-400 hover:text-blue-400"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {item.comments}
                          </Button>
                          
                          <Button
                            onClick={() => handleShareRSS(item)}
                            variant="ghost"
                            size="sm"
                            className="font-mono text-xs text-gray-400 hover:text-green-400"
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            {item.shares}
                          </Button>
                          
                          <Button
                            onClick={() => handleBookmarkRSS(item.id)}
                            variant="ghost"
                            size="sm"
                            className={`font-mono text-xs ${
                              item.isBookmarked ? 'text-yellow-400' : 'text-gray-400'
                            } hover:text-yellow-400`}
                          >
                            {item.isBookmarked ? (
                              <Bookmark className="h-3 w-3 mr-1 fill-current" />
                            ) : (
                              <BookmarkPlus className="h-3 w-3 mr-1" />
                            )}
                            SAVE
                          </Button>
                          
                          <Button
                            onClick={() => window.open(item.link, '_blank')}
                            variant="ghost"
                            size="sm"
                            className="font-mono text-xs text-gray-400 hover:text-purple-400"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            READ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm font-mono text-gray-400">NO MUSIC CONTENT FOUND</div>
                  <div className="text-xs font-mono text-gray-500 mt-1">Try refreshing or changing categories</div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Playlist Tab */}
          <TabsContent value="playlist" className="space-y-4">
            {tracks.length > 0 ? (
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
            ) : (
              <div className="text-center py-8">
                <div className="text-sm font-mono text-gray-400">NO TRACKS IN PLAYLIST</div>
                <div className="text-xs font-mono text-gray-500 mt-1">Upload some music files to get started</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
