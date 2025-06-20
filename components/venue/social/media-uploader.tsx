"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MediaUploaderProps {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number // in bytes
  trigger?: React.ReactNode
  multiple?: boolean
}

export function MediaUploader({
  onUpload,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  trigger,
  multiple = false,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(multiple ? Array.from(files) : [files[0]])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(multiple ? Array.from(files) : [files[0]])
    }
  }

  const handleFiles = (files: File[]) => {
    setError(null)

    // Validate files
    const invalidFiles = files.filter((file) => {
      // Check file type
      if (accept !== "*" && !isFileTypeAccepted(file, accept)) {
        setError(`File type not accepted: ${file.type}`)
        return true
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024))
        setError(`File too large. Maximum size is ${maxSizeMB}MB.`)
        return true
      }

      return false
    })

    if (invalidFiles.length > 0) {
      return
    }

    // Simulate upload progress
    setIsUploading(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        setUploadProgress(0)
        setShowDialog(false)

        // Process each file
        files.forEach((file) => {
          onUpload(file)
        })

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }, 200)
  }

  const isFileTypeAccepted = (file: File, acceptString: string): boolean => {
    if (acceptString === "*") return true

    const acceptedTypes = acceptString.split(",").map((type) => type.trim())

    return acceptedTypes.some((type) => {
      // Handle wildcards like image/*
      if (type.endsWith("/*")) {
        const category = type.split("/")[0]
        return file.type.startsWith(`${category}/`)
      }

      return file.type === type
    })
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const triggerButton = trigger || (
    <Button
      variant="outline"
      className="border-dashed border-gray-600 text-gray-400 hover:text-white"
      onClick={() => setShowDialog(true)}
    >
      <Upload className="h-4 w-4 mr-2" /> Upload Media
    </Button>
  )

  return (
    <>
      {/* Trigger element */}
      {trigger ? <div onClick={() => setShowDialog(true)}>{triggerButton}</div> : triggerButton}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
      />

      {/* Upload dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-purple-500 bg-purple-900/20" : "border-gray-700 hover:border-gray-500"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-purple-500 animate-pulse" />
                </div>
                <p>Uploading...</p>
                <Progress value={uploadProgress} className="bg-gray-800" />
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="mb-2">Drag and drop your files here, or click to browse</p>
                <p className="text-sm text-gray-500">
                  {accept === "image/*"
                    ? "Supports: JPG, PNG, GIF, etc."
                    : accept === "video/*"
                      ? "Supports: MP4, WebM, etc."
                      : `Accepted formats: ${accept}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">Maximum size: {Math.round(maxSize / (1024 * 1024))}MB</p>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 p-2 bg-red-900/30 border border-red-800 rounded-md flex items-center text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
