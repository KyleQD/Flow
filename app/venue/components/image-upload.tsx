'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, AlertCircle, CheckCircle, Loader2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  uploadVenueImage, 
  deleteVenueImage, 
  validateImageFile, 
  createFilePreview, 
  revokeFilePreview,
  formatFileSize,
  ImageUploadResult 
} from '@/lib/utils/image-upload'

interface ImageUploadProps {
  userId: string
  currentImageUrl?: string
  imageType: 'avatar' | 'cover' | 'gallery'
  onUploadComplete: (url: string, metadata?: any) => void
  onUploadError?: (error: string) => void
  onDeleteComplete?: () => void
  className?: string
  disabled?: boolean
  uploadButtonText?: string
  dragDropText?: string
}

export function ImageUpload({
  userId,
  currentImageUrl,
  imageType,
  onUploadComplete,
  onUploadError,
  onDeleteComplete,
  className = '',
  disabled = false,
  uploadButtonText = 'Upload Image',
  dragDropText = 'Drag & drop an image here, or click to select'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCountRef = useRef(0)

  // Clear states after a delay
  const clearStates = useCallback(() => {
    setTimeout(() => {
      setError(null)
      setSuccess(false)
      if (previewUrl) {
        revokeFilePreview(previewUrl)
        setPreviewUrl(null)
      }
    }, 3000)
  }, [previewUrl])

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled || isUploading) return

    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    // Check if user is authenticated
    if (!userId) {
      setError('Please log in to upload images')
      onUploadError?.('Please log in to upload images')
      return
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      onUploadError?.(validation.error || 'Invalid file')
      return
    }

    // Create preview
    const preview = createFilePreview(file)
    setPreviewUrl(preview)
    setIsUploading(true)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload image
      const result: ImageUploadResult = await uploadVenueImage(
        file,
        userId,
        imageType
      )

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success && result.url) {
        setSuccess(true)
        onUploadComplete(result.url, result.metadata)
        clearStates()
      } else {
        setError(result.error || 'Upload failed')
        onUploadError?.(result.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed unexpectedly')
      onUploadError?.('Upload failed unexpectedly')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [userId, imageType, disabled, isUploading, onUploadComplete, onUploadError, clearStates])

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current--
    if (dragCountRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    dragCountRef.current = 0

    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [disabled, isUploading, handleFileSelect])

  // Handle delete current image
  const handleDelete = useCallback(async () => {
    if (!currentImageUrl || isUploading) return

    try {
      const success = await deleteVenueImage(currentImageUrl)
      if (success) {
        onDeleteComplete?.()
        setSuccess(true)
        clearStates()
      } else {
        setError('Failed to delete image')
      }
    } catch (err) {
      setError('Failed to delete image')
    }
  }, [currentImageUrl, isUploading, onDeleteComplete, clearStates])

  // Click to open file dialog
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, isUploading])

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Current/Preview Image */}
        {displayImageUrl && (
          <div className="relative">
            <img
              src={displayImageUrl}
              alt="Preview"
              className={`
                w-full h-48 object-cover rounded-lg
                ${imageType === 'avatar' ? 'aspect-square' : 'aspect-video'}
                ${isUploading ? 'opacity-50' : ''}
              `}
            />
            
            {/* Delete button for current image */}
            {currentImageUrl && !previewUrl && !isUploading && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <div className="text-sm font-medium">Uploading...</div>
                  <Progress value={uploadProgress} className="w-32 mt-2" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload placeholder */}
        {!displayImageUrl && (
          <div className={`p-8 text-center transition-all duration-200 ${isDragOver ? 'scale-105' : ''}`}>
            <div className="mx-auto mb-4">
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                  <div className="text-sm font-medium text-blue-600">Processing image...</div>
                </div>
              ) : (
                <div className={`relative transition-all duration-200 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}>
                  <div className={`p-4 rounded-full border-2 border-dashed transition-all duration-200 mx-auto w-fit ${
                    isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <Camera className="h-8 w-8" />
                  </div>
                  <Upload className={`h-4 w-4 absolute -bottom-1 -right-8 transition-all duration-200 ${
                    isDragOver ? 'text-blue-500' : 'text-blue-500'
                  }`} />
                </div>
              )}
            </div>
            
            <div className={`text-sm font-medium mb-2 transition-all duration-200 ${
              isDragOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {isDragOver ? 'Drop your image here!' : dragDropText}
            </div>
            
            <Button 
              variant={isDragOver ? "default" : "outline"} 
              size="sm" 
              disabled={disabled || isUploading}
              className={`transition-all duration-200 ${isDragOver ? 'scale-105' : ''}`}
            >
              {isUploading ? 'Uploading...' : uploadButtonText}
            </Button>
            
            <div className="text-xs text-gray-500 mt-3 space-y-1">
              <div>PNG, JPG, GIF, WebP up to 10MB</div>
              <div className="text-gray-400">
                {userId ? 'Automatically optimized for best quality' : 'Please log in to upload images'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload progress bar (when uploading without preview) */}
      {isUploading && !displayImageUrl && (
        <div className="mt-2">
          <Progress value={uploadProgress} />
          <div className="text-xs text-gray-500 mt-1 text-center">
            {uploadProgress}% uploaded
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      {success && (
        <Alert className="mt-2 border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Image {currentImageUrl ? 'updated' : 'uploaded'} successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 