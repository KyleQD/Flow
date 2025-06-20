"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, X, FileText, ImageIcon, Film, Music, Tag, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { mockProfessions } from "@/lib/mock-data"
import type { ProfessionAssignment } from "@/lib/mock-data"
import Image from "next/image"

interface ContentUploaderProps {
  userId: string
  userProfessions?: ProfessionAssignment[]
  onUploadComplete?: (contentItem: any) => void
}

export default function ContentUploader({ userId, userProfessions = [], onUploadComplete }: ContentUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [selectedProfessionId, setSelectedProfessionId] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(selectedFiles)

      // Create previews
      const newPreviews = selectedFiles.map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file)
        } else if (file.type.startsWith("video/")) {
          return "/placeholder.svg?height=200&width=300&text=Video+Preview"
        } else if (file.type.startsWith("audio/")) {
          return "/placeholder.svg?height=200&width=300&text=Audio+File"
        } else {
          return "/placeholder.svg?height=200&width=300&text=Document"
        }
      })

      setPreviews(newPreviews)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      setFiles(droppedFiles)

      // Create previews
      const newPreviews = droppedFiles.map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file)
        } else if (file.type.startsWith("video/")) {
          return "/placeholder.svg?height=200&width=300&text=Video+Preview"
        } else if (file.type.startsWith("audio/")) {
          return "/placeholder.svg?height=200&width=300&text=Audio+File"
        } else {
          return "/placeholder.svg?height=200&width=300&text=Document"
        }
      })

      setPreviews(newPreviews)
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleUpload = useCallback(() => {
    if (files.length === 0 || !title.trim()) return

    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        setUploadComplete(true)

        // Create mock content item
        const contentType = files[0].type.startsWith("image/")
          ? "image"
          : files[0].type.startsWith("video/")
            ? "video"
            : files[0].type.startsWith("audio/")
              ? "audio"
              : "document"

        const newContentItem = {
          id: `content-${Date.now()}`,
          userId,
          title,
          description,
          contentType,
          url: previews[0],
          thumbnailUrl: previews[0],
          tags,
          professionId: selectedProfessionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic,
          likes: 0,
          views: 0,
          comments: 0,
        }

        if (onUploadComplete) {
          onUploadComplete(newContentItem)
        }

        // Reset form after successful upload
        setTimeout(() => {
          setFiles([])
          setPreviews([])
          setTitle("")
          setDescription("")
          setTags([])
          setSelectedProfessionId("")
          setUploadProgress(0)
          setUploadComplete(false)
        }, 2000)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [files, title, description, tags, selectedProfessionId, isPublic, userId, previews, onUploadComplete])

  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6" />
    } else if (file.type.startsWith("video/")) {
      return <Film className="h-6 w-6" />
    } else if (file.type.startsWith("audio/")) {
      return <Music className="h-6 w-6" />
    } else {
      return <FileText className="h-6 w-6" />
    }
  }

  // Get available professions for the user
  const availableProfessions =
    userProfessions.length > 0
      ? userProfessions
          .map((up) => {
            const profession = mockProfessions.find((p) => p.id === up.professionId)
            return profession
          })
          .filter(Boolean)
      : mockProfessions

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          files.length > 0 ? "border-primary" : "border-muted-foreground"
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium">Drag and drop files or click to upload</h3>
            <p className="text-sm text-muted-foreground">Support for images, videos, audio, and documents</p>
          </div>
        ) : (
          <div className="space-y-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                {files[index].type.startsWith("image/") ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt={files[index].name}
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                    {getFileTypeIcon(files[index])}
                    <span className="ml-2">{files[index].name}</span>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-background rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFiles([])
                    setPreviews([])
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your content"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your content"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tags (press Enter)"
            />
            <Button type="button" size="sm" onClick={handleAddTag}>
              <Tag className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="profession" className="block text-sm font-medium mb-1">
            Associated Profession
          </label>
          <select
            id="profession"
            value={selectedProfessionId}
            onChange={(e) => setSelectedProfessionId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a profession</option>
            {availableProfessions.map((profession) => (
              <option key={profession?.id} value={profession?.id}>
                {profession?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isPublic" className="text-sm">
            Make this content public
          </label>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {uploadComplete && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <span>Upload complete!</span>
        </div>
      )}

      <Button
        type="button"
        className="w-full"
        onClick={handleUpload}
        disabled={files.length === 0 || !title.trim() || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </>
        )}
      </Button>
    </div>
  )
}
