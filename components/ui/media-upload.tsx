'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileText,
  Link,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { MediaPreview } from './media-preview'
import { MediaPlayer } from './media-player'
import { 
  useMediaUpload, 
  detectMediaType, 
  validateMediaFile,
  formatFileSize,
  MediaFile,
  MediaType
} from '@/lib/utils/enhanced-media-upload'
import { cn } from '@/lib/utils'

interface MediaUploadProps {
  onMediaSelected?: (mediaFiles: MediaFile[]) => void
  onMediaUploaded?: (uploadedMedia: any[]) => void
  maxFiles?: number
  maxFileSize?: number
  allowedTypes?: MediaType[]
  className?: string
  showPreview?: boolean
  autoUpload?: boolean
  userId?: string
}

export function MediaUpload({
  onMediaSelected,
  onMediaUploaded,
  maxFiles = 10,
  maxFileSize,
  allowedTypes = ['image', 'video', 'audio', 'document'],
  className,
  showPreview = true,
  autoUpload = false,
  userId
}: MediaUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [embeddedUrl, setEmbeddedUrl] = useState('')
  const [showEmbeddedInput, setShowEmbeddedInput] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFiles, validateFiles } = useMediaUpload()

  // Generate unique ID for media files
  const generateId = useCallback(() => {
    return `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validate files
    const { valid, invalid } = validateFiles(fileArray)
    
    // Show errors for invalid files
    invalid.forEach(({ file, error }) => {
      console.error(`Invalid file ${file.name}:`, error)
    })

    // Create media file objects
    const newMediaFiles: MediaFile[] = valid.map(file => ({
      id: generateId(),
      file,
      type: detectMediaType(file),
      fileSize: file.size,
      altText: file.name
    }))

    // Check if adding these files would exceed maxFiles
    if (mediaFiles.length + newMediaFiles.length > maxFiles) {
      console.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    const updatedMediaFiles = [...mediaFiles, ...newMediaFiles]
    setMediaFiles(updatedMediaFiles)
    onMediaSelected?.(updatedMediaFiles)

    // Auto-upload if enabled
    if (autoUpload && userId) {
      handleUpload(newMediaFiles)
    }
  }, [mediaFiles, maxFiles, onMediaSelected, autoUpload, userId, validateFiles, generateId])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileSelect(files)
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    }
  }, [handleFileSelect])

  // Handle embedded URL
  const handleEmbeddedUrl = useCallback(() => {
    if (!embeddedUrl.trim()) return

    const newMediaFile: MediaFile = {
      id: generateId(),
      file: new File([], 'embedded'),
      type: 'embedded',
      url: embeddedUrl,
      fileSize: 0,
      altText: 'Embedded content'
    }

    const updatedMediaFiles = [...mediaFiles, newMediaFile]
    setMediaFiles(updatedMediaFiles)
    onMediaSelected?.(updatedMediaFiles)
    setEmbeddedUrl('')
    setShowEmbeddedInput(false)
  }, [embeddedUrl, mediaFiles, onMediaSelected, generateId])

  // Remove media file
  const handleRemoveMedia = useCallback((id: string) => {
    const updatedMediaFiles = mediaFiles.filter(file => file.id !== id)
    setMediaFiles(updatedMediaFiles)
    onMediaSelected?.(updatedMediaFiles)
    
    // Clear upload progress and errors for removed file
    setUploadProgress(prev => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
    setUploadErrors(prev => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
  }, [mediaFiles, onMediaSelected])

  // Upload media files
  const handleUpload = useCallback(async (filesToUpload: MediaFile[] = mediaFiles) => {
    if (!userId || filesToUpload.length === 0) return

    setIsUploading(true)
    setUploadErrors({})

    try {
      const result = await uploadFiles({
        userId,
        mediaFiles: filesToUpload,
        onProgress: (progress) => {
          console.log('Total upload progress:', progress)
        },
        onFileProgress: (fileId, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: progress
          }))
        }
      })

      if (result.success && result.mediaItems) {
        onMediaUploaded?.(result.mediaItems)
        
        // Clear upload progress
        setUploadProgress({})
        
        // Update media files with uploaded URLs
        const updatedMediaFiles = mediaFiles.map(file => {
          const uploadedItem = result.mediaItems?.find(item => item.id === file.id)
          if (uploadedItem) {
            return {
              ...file,
              url: uploadedItem.url,
              thumbnailUrl: uploadedItem.thumbnailUrl,
              duration: uploadedItem.duration,
              metadata: uploadedItem.metadata
            }
          }
          return file
        })
        
        setMediaFiles(updatedMediaFiles)
      } else {
        setUploadErrors({ general: result.error || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadErrors({ general: 'Upload failed' })
    } finally {
      setIsUploading(false)
    }
  }, [userId, mediaFiles, uploadFiles, onMediaUploaded])

  // Get allowed file types for input
  const acceptedFileTypes = useMemo(() => {
    const typeMap: Record<MediaType, string> = {
      image: 'image/*',
      video: 'video/*',
      audio: 'audio/*',
      document: '.pdf,.doc,.docx,.txt',
      embedded: ''
    }
    
    return allowedTypes
      .map(type => typeMap[type])
      .filter(Boolean)
      .join(',')
  }, [allowedTypes])

  // Render upload area
  const renderUploadArea = () => (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300',
        isDragOver 
          ? 'border-purple-500 bg-purple-500/10' 
          : 'border-gray-600 hover:border-gray-500',
        mediaFiles.length > 0 && 'border-t-0 rounded-t-none'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-white mb-2">
        Upload Media
      </h3>
      <p className="text-gray-400 mb-4">
        Drag and drop files here, or click to browse
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {allowedTypes.map(type => (
          <Badge key={type} variant="secondary" className="text-xs">
            {type.toUpperCase()}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={mediaFiles.length >= maxFiles}
        >
          <Plus className="h-4 w-4 mr-2" />
          Select Files
        </Button>
        
        {allowedTypes.includes('embedded') && (
          <Button
            variant="outline"
            onClick={() => setShowEmbeddedInput(true)}
            disabled={mediaFiles.length >= maxFiles}
          >
            <Link className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )

  // Render embedded URL input
  const renderEmbeddedInput = () => {
    if (!showEmbeddedInput) return null

    return (
      <Card className="mb-4 bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label htmlFor="embedded-url" className="text-white">
              Embedded URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="embedded-url"
                type="url"
                placeholder="https://..."
                value={embeddedUrl}
                onChange={(e) => setEmbeddedUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleEmbeddedUrl} disabled={!embeddedUrl.trim()}>
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmbeddedInput(false)
                  setEmbeddedUrl('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render media previews
  const renderMediaPreviews = () => {
    if (!showPreview || mediaFiles.length === 0) return null

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaFiles.map((mediaFile) => (
          <div key={mediaFile.id} className="relative">
            <MediaPreview
              id={mediaFile.id}
              type={mediaFile.type}
              url={mediaFile.url || URL.createObjectURL(mediaFile.file)}
              thumbnailUrl={mediaFile.thumbnailUrl}
              altText={mediaFile.altText}
              title={mediaFile.file.name}
              duration={mediaFile.duration}
              fileSize={mediaFile.fileSize}
              metadata={mediaFile.metadata}
              onRemove={handleRemoveMedia}
              showControls={true}
            />
            
            {/* Upload progress */}
            {uploadProgress[mediaFile.id] !== undefined && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 rounded-b-lg">
                <Progress value={uploadProgress[mediaFile.id]} className="h-1" />
                <div className="text-xs text-white mt-1">
                  {uploadProgress[mediaFile.id]}% uploaded
                </div>
              </div>
            )}
            
            {/* Upload error */}
            {uploadErrors[mediaFile.id] && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Error
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Render upload button
  const renderUploadButton = () => {
    if (mediaFiles.length === 0 || autoUpload) return null

    return (
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {mediaFiles.length} file(s) selected
        </div>
        
        <Button
          onClick={() => handleUpload()}
          disabled={isUploading || !userId}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {mediaFiles.length} File(s)
            </>
          )}
        </Button>
      </div>
    )
  }

  // Render general error
  const renderGeneralError = () => {
    if (!uploadErrors.general) return null

    return (
      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{uploadErrors.general}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {renderEmbeddedInput()}
      {renderUploadArea()}
      {renderMediaPreviews()}
      {renderUploadButton()}
      {renderGeneralError()}
    </div>
  )
} 