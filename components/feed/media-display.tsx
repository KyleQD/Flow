'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Download,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileText
} from 'lucide-react'
import { MediaPlayer } from '@/components/ui/media-player'
import { MediaType } from '@/lib/utils/enhanced-media-upload'
import { cn } from '@/lib/utils'
import { formatFileSize, formatDuration } from '@/lib/utils/enhanced-media-upload'

interface MediaItem {
  id: string
  type: MediaType
  url: string
  thumbnailUrl?: string
  altText?: string
  title?: string
  artist?: string
  duration?: number
  fileSize?: number
  metadata?: any
}

interface MediaDisplayProps {
  mediaItems: MediaItem[]
  className?: string
  maxHeight?: number
  showControls?: boolean
  allowFullscreen?: boolean
  layout?: 'grid' | 'carousel' | 'stack'
  aspectRatio?: number
}

export function MediaDisplay({
  mediaItems,
  className,
  maxHeight = 400,
  showControls = true,
  allowFullscreen = true,
  layout = 'grid',
  aspectRatio
}: MediaDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())

  // Handle carousel navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : mediaItems.length - 1))
  }, [mediaItems.length])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev < mediaItems.length - 1 ? prev + 1 : 0))
  }, [mediaItems.length])

  // Handle video play/pause
  const toggleVideoPlay = useCallback((mediaId: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId)
      } else {
        newSet.add(mediaId)
      }
      return newSet
    })
  }, [])

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Get media icon
  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <VideoIcon className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get media badge color
  const getMediaBadgeColor = (type: MediaType) => {
    switch (type) {
      case 'image':
        return 'bg-blue-500'
      case 'video':
        return 'bg-red-500'
      case 'audio':
        return 'bg-purple-500'
      case 'document':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Render single image
  const renderImage = (item: MediaItem, index: number) => (
    <div className="relative group">
      <img
        src={item.url}
        alt={item.altText || 'Media content'}
        className={cn(
          'w-full h-auto object-cover transition-all duration-300',
          aspectRatio && `aspect-[${aspectRatio}]`,
          layout === 'carousel' && index === currentIndex ? 'block' : 'hidden'
        )}
        style={{ maxHeight }}
        onClick={() => allowFullscreen && setIsFullscreen(true)}
      />
      
      {/* Overlay controls */}
      {showControls && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg">
          <div className="absolute top-2 left-2">
            <Badge className={cn('text-white border-0', getMediaBadgeColor(item.type))}>
              {getMediaIcon(item.type)}
              <span className="ml-1 capitalize">{item.type}</span>
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {allowFullscreen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="bg-white/90 hover:bg-white text-black"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Render single video
  const renderVideo = (item: MediaItem, index: number) => (
    <div className="relative group">
      <video
        src={item.url}
        poster={item.thumbnailUrl}
        className={cn(
          'w-full h-auto object-cover transition-all duration-300',
          aspectRatio && `aspect-[${aspectRatio}]`,
          layout === 'carousel' && index === currentIndex ? 'block' : 'hidden'
        )}
        style={{ maxHeight }}
        controls={showControls}
        onPlay={() => toggleVideoPlay(item.id)}
        onPause={() => toggleVideoPlay(item.id)}
      />
      
      {/* Overlay controls */}
      {showControls && (
        <div className="absolute top-2 left-2">
          <Badge className={cn('text-white border-0', getMediaBadgeColor(item.type))}>
            {getMediaIcon(item.type)}
            <span className="ml-1 capitalize">{item.type}</span>
          </Badge>
        </div>
      )}
    </div>
  )

  // Render single audio
  const renderAudio = (item: MediaItem, index: number) => (
    <Card className={cn(
      'bg-slate-900 border-slate-700',
      layout === 'carousel' && index === currentIndex ? 'block' : 'hidden'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">
              {item.title || 'Audio File'}
            </div>
            {item.artist && (
              <div className="text-sm text-gray-400 truncate">{item.artist}</div>
            )}
            <div className="flex items-center gap-2 mt-1">
              {item.duration && (
                <span className="text-xs text-gray-500">
                  {formatDuration(item.duration)}
                </span>
              )}
              {item.fileSize && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(item.fileSize)}
                </span>
              )}
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVideoPlay(item.id)}
                className="text-white hover:bg-white/20"
              >
                {playingVideos.has(item.id) ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render single document
  const renderDocument = (item: MediaItem, index: number) => (
    <Card className={cn(
      'bg-slate-900 border-slate-700',
      layout === 'carousel' && index === currentIndex ? 'block' : 'hidden'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">
              {item.title || 'Document'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {item.fileSize && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(item.fileSize)}
                </span>
              )}
              <Badge variant="secondary" className="text-xs">
                {item.url?.split('.').pop()?.toUpperCase() || 'DOC'}
              </Badge>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(item.url, '_blank')}
                className="text-white hover:bg-white/20"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render single media item
  const renderMediaItem = (item: MediaItem, index: number) => {
    switch (item.type) {
      case 'image':
        return renderImage(item, index)
      case 'video':
        return renderVideo(item, index)
      case 'audio':
        return renderAudio(item, index)
      case 'document':
        return renderDocument(item, index)
      case 'embedded':
        return renderDocument(item, index) // Treat embedded as document for now
      default:
        return renderDocument(item, index)
    }
  }

  // Render grid layout
  const renderGridLayout = () => (
    <div className={cn(
      'grid gap-2',
      mediaItems.length === 1 && 'grid-cols-1',
      mediaItems.length === 2 && 'grid-cols-2',
      mediaItems.length === 3 && 'grid-cols-3',
      mediaItems.length === 4 && 'grid-cols-2',
      mediaItems.length > 4 && 'grid-cols-2 sm:grid-cols-3'
    )}>
      {mediaItems.map((item, index) => (
        <div key={item.id} className="relative">
          {renderMediaItem(item, index)}
          
          {/* Show count overlay for grid with more than 4 items */}
          {mediaItems.length > 4 && index === 3 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
              <span className="text-white text-lg font-medium">
                +{mediaItems.length - 4} more
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  // Render carousel layout
  const renderCarouselLayout = () => (
    <div className="relative">
      {mediaItems.map((item, index) => (
        <div key={item.id}>
          {renderMediaItem(item, index)}
        </div>
      ))}
      
      {/* Carousel navigation */}
      {mediaItems.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Carousel indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )

  // Render stack layout
  const renderStackLayout = () => (
    <div className="space-y-2">
      {mediaItems.map((item, index) => (
        <div key={item.id}>
          {renderMediaItem(item, index)}
        </div>
      ))}
    </div>
  )

  // Render based on layout
  const renderLayout = () => {
    switch (layout) {
      case 'grid':
        return renderGridLayout()
      case 'carousel':
        return renderCarouselLayout()
      case 'stack':
        return renderStackLayout()
      default:
        return renderGridLayout()
    }
  }

  // Render fullscreen modal
  const renderFullscreenModal = () => {
    if (!isFullscreen || mediaItems.length === 0) return null

    const currentItem = mediaItems[currentIndex]

    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-full max-h-full">
          {/* Close button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Media content */}
          <div className="max-w-full max-h-full">
            {currentItem.type === 'image' && (
              <img
                src={currentItem.url}
                alt={currentItem.altText || 'Full screen media'}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            {currentItem.type === 'video' && (
              <video
                src={currentItem.url}
                poster={currentItem.thumbnailUrl}
                controls
                className="max-w-full max-h-full"
                autoPlay
              />
            )}
            
            {currentItem.type === 'audio' && (
              <div className="bg-slate-900 p-8 rounded-lg">
                <MediaPlayer
                  src={currentItem.url}
                  type="audio"
                  title={currentItem.title}
                  artist={currentItem.artist}
                  controls
                  autoPlay
                />
              </div>
            )}
          </div>

          {/* Navigation for multiple items */}
          {mediaItems.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {mediaItems.length}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (mediaItems.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      {renderLayout()}
      {renderFullscreenModal()}
    </div>
  )
} 