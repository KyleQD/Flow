'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileText,
  ExternalLink,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { MediaPlayer } from './media-player'
import { cn } from '@/lib/utils'
import { formatFileSize, formatDuration } from '@/lib/utils/enhanced-media-upload'
import { MediaType } from '@/lib/utils/enhanced-media-upload'

interface MediaPreviewProps {
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
  onRemove?: (id: string) => void
  onEdit?: (id: string) => void
  className?: string
  showControls?: boolean
  maxHeight?: number
  aspectRatio?: number
}

export function MediaPreview({
  id,
  type,
  url,
  thumbnailUrl,
  altText,
  title,
  artist,
  duration,
  fileSize,
  metadata,
  onRemove,
  onEdit,
  className,
  showControls = true,
  maxHeight = 400,
  aspectRatio
}: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)

  const handleRemove = useCallback(() => {
    onRemove?.(id)
  }, [id, onRemove])

  const handleEdit = useCallback(() => {
    onEdit?.(id)
  }, [id, onEdit])

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  const getMediaIcon = () => {
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

  const getMediaBadgeColor = () => {
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

  // Render image preview
  const renderImagePreview = () => (
    <div className="relative group">
      <img
        src={url}
        alt={altText || 'Media preview'}
        className={cn(
          'w-full h-auto object-cover rounded-lg transition-all duration-300',
          aspectRatio && `aspect-[${aspectRatio}]`
        )}
        style={{ maxHeight }}
      />
      
      {/* Overlay controls */}
      {showControls && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg">
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFullPreview(true)}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRemove}
              className="bg-red-500/90 hover:bg-red-500 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  // Render video preview
  const renderVideoPreview = () => (
    <div className="relative group">
      <video
        src={url}
        poster={thumbnailUrl}
        className={cn(
          'w-full h-auto object-cover rounded-lg transition-all duration-300',
          aspectRatio && `aspect-[${aspectRatio}]`
        )}
        style={{ maxHeight }}
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <Button
            variant="secondary"
            size="lg"
            onClick={togglePlay}
            className="bg-white/90 hover:bg-white text-black"
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Overlay controls */}
      {showControls && (
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleMute}
            className="bg-black/70 hover:bg-black/90 text-white"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRemove}
            className="bg-red-500/90 hover:bg-red-500 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

  // Render audio preview
  const renderAudioPreview = () => (
    <Card className="bg-slate-900 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">
              {title || 'Audio File'}
            </div>
            {artist && (
              <div className="text-sm text-gray-400 truncate">{artist}</div>
            )}
            <div className="flex items-center gap-2 mt-1">
              {duration && (
                <span className="text-xs text-gray-500">
                  {formatDuration(duration)}
                </span>
              )}
              {fileSize && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-400 hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render document preview
  const renderDocumentPreview = () => (
    <Card className="bg-slate-900 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">
              {title || 'Document'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {fileSize && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(fileSize)}
                </span>
              )}
              <Badge variant="secondary" className="text-xs">
                {url.split('.').pop()?.toUpperCase() || 'DOC'}
              </Badge>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="text-white hover:bg-white/20"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-400 hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render embedded content preview
  const renderEmbeddedPreview = () => (
    <Card className="bg-slate-900 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">
              {title || 'Embedded Content'}
            </div>
            <div className="text-sm text-gray-400 truncate">
              {url}
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="text-white hover:bg-white/20"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-400 hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render media based on type
  const renderMedia = () => {
    switch (type) {
      case 'image':
        return renderImagePreview()
      case 'video':
        return renderVideoPreview()
      case 'audio':
        return renderAudioPreview()
      case 'document':
        return renderDocumentPreview()
      case 'embedded':
        return renderEmbeddedPreview()
      default:
        return renderDocumentPreview()
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Media type badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge className={cn('text-white border-0', getMediaBadgeColor())}>
          {getMediaIcon()}
          <span className="ml-1 capitalize">{type}</span>
        </Badge>
      </div>

      {/* Media content */}
      {renderMedia()}

      {/* Full preview modal */}
      {showFullPreview && type === 'image' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <img
              src={url}
              alt={altText || 'Full preview'}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 