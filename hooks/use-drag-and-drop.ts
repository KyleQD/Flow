import { useState, useCallback, useRef, useEffect } from 'react'
import { MediaFile, MediaType, detectMediaType, validateMediaFile } from '@/lib/utils/enhanced-media-upload'

interface DragAndDropOptions {
  onFilesSelected?: (files: MediaFile[]) => void
  onDragEnter?: () => void
  onDragLeave?: () => void
  onDrop?: (files: MediaFile[]) => void
  maxFiles?: number
  allowedTypes?: MediaType[]
  maxFileSize?: number
}

interface DragAndDropState {
  isDragOver: boolean
  isDragValid: boolean
  dragCounter: number
  errorMessage: string | null
}

export function useDragAndDrop(options: DragAndDropOptions) {
  const {
    onFilesSelected,
    onDragEnter,
    onDragLeave,
    onDrop,
    maxFiles = 10,
    allowedTypes = ['image', 'video', 'audio', 'document'],
    maxFileSize
  } = options

  const [state, setState] = useState<DragAndDropState>({
    isDragOver: false,
    isDragValid: true,
    dragCounter: 0,
    errorMessage: null
  })

  const dragCounterRef = useRef(0)

  // Validate dragged files
  const validateDraggedFiles = useCallback((files: FileList): { valid: File[], invalid: { file: File, error: string }[] } => {
    const valid: File[] = []
    const invalid: { file: File, error: string }[] = []

    Array.from(files).forEach(file => {
      try {
        const detectedType = detectMediaType(file)
        
        // Check if file type is allowed
        if (!allowedTypes.includes(detectedType)) {
          invalid.push({ 
            file, 
            error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` 
          })
          return
        }

        // Validate file
        validateMediaFile(file, detectedType)
        valid.push(file)
      } catch (error) {
        invalid.push({ 
          file, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })

    return { valid, invalid }
  }, [allowedTypes])

  // Convert files to MediaFile objects
  const convertToMediaFiles = useCallback((files: File[]): MediaFile[] => {
    return files.map((file, index) => ({
      id: `drag-${Date.now()}-${index}`,
      file,
      type: detectMediaType(file),
      fileSize: file.size,
      altText: file.name
    }))
  }, [])

  // Handle drag enter
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounterRef.current++
    
    if (dragCounterRef.current === 1) {
      const { valid, invalid } = validateDraggedFiles(e.dataTransfer.files)
      
      setState(prev => ({
        ...prev,
        isDragOver: true,
        isDragValid: valid.length > 0,
        errorMessage: invalid.length > 0 ? `${invalid.length} file(s) cannot be uploaded` : null
      }))
      
      onDragEnter?.()
    }
  }, [validateDraggedFiles, onDragEnter])

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounterRef.current--
    
    if (dragCounterRef.current === 0) {
      setState(prev => ({
        ...prev,
        isDragOver: false,
        isDragValid: true,
        errorMessage: null
      }))
      
      onDragLeave?.()
    }
  }, [onDragLeave])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounterRef.current = 0
    
    const { valid, invalid } = validateDraggedFiles(e.dataTransfer.files)
    
    if (valid.length === 0) {
      setState(prev => ({
        ...prev,
        isDragOver: false,
        isDragValid: true,
        errorMessage: 'No valid files to upload'
      }))
      return
    }

    // Check file count limit
    if (valid.length > maxFiles) {
      setState(prev => ({
        ...prev,
        isDragOver: false,
        isDragValid: true,
        errorMessage: `Maximum ${maxFiles} files allowed`
      }))
      return
    }

    const mediaFiles = convertToMediaFiles(valid)
    
    setState(prev => ({
      ...prev,
      isDragOver: false,
      isDragValid: true,
      errorMessage: null
    }))

    onFilesSelected?.(mediaFiles)
    onDrop?.(mediaFiles)
  }, [validateDraggedFiles, convertToMediaFiles, maxFiles, onFilesSelected, onDrop])

  // Handle paste events
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files: File[] = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }

    if (files.length > 0) {
      const { valid } = validateDraggedFiles(new DataTransfer().files)
      if (valid.length > 0) {
        const mediaFiles = convertToMediaFiles(valid)
        onFilesSelected?.(mediaFiles)
      }
    }
  }, [validateDraggedFiles, convertToMediaFiles, onFilesSelected])

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  // Reset drag state when component unmounts
  useEffect(() => {
    return () => {
      dragCounterRef.current = 0
    }
  }, [])

  return {
    ...state,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    },
    clearError: () => setState(prev => ({ ...prev, errorMessage: null }))
  }
} 