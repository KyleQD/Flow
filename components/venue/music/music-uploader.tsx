"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Music,
  Upload,
  X,
  Plus,
  ImageIcon,
  Calendar,
  Tag,
  Globe,
  Users,
  Lock,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"

export function MusicUploader() {
  const { toast } = useToast()
  const [uploadType, setUploadType] = useState<"single" | "album" | "ep">("single")
  const [files, setFiles] = useState<File[]>([])
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [genre, setGenre] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [isExplicit, setIsExplicit] = useState(false)
  const [visibility, setVisibility] = useState<"public" | "connections" | "private">("public")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [trackList, setTrackList] = useState<
    Array<{
      file: File
      title: string
      trackNumber: number
      duration: string
      isExplicit: boolean
    }>
  >([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  // Handle audio file selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter((file) => file.type.startsWith("audio/"))

      if (selectedFiles.length === 0) {
        toast({
          title: "Invalid file type",
          description: "Please select audio files only (MP3, WAV, etc.)",
          variant: "destructive",
        })
        return
      }

      setFiles(selectedFiles)

      // Create initial track list
      const newTrackList = selectedFiles.map((file, index) => {
        return {
          file,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          trackNumber: index + 1,
          duration: "0:00", // Placeholder, would be calculated from actual file
          isExplicit: false,
        }
      })

      setTrackList(newTrackList)
    }
  }

  // Handle cover image selection
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      setCoverImage(file)
      const imageUrl = URL.createObjectURL(file)
      setCoverImagePreview(imageUrl)
    }
  }

  // Handle drag and drop for audio files
  const handleAudioDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleAudioDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("audio/"))

      if (droppedFiles.length === 0) {
        toast({
          title: "Invalid file type",
          description: "Please select audio files only (MP3, WAV, etc.)",
          variant: "destructive",
        })
        return
      }

      setFiles(droppedFiles)

      // Create initial track list
      const newTrackList = droppedFiles.map((file, index) => {
        return {
          file,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          trackNumber: index + 1,
          duration: "0:00", // Placeholder, would be calculated from actual file
          isExplicit: false,
        }
      })

      setTrackList(newTrackList)
    }
  }

  // Handle drag and drop for cover image
  const handleCoverDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      setCoverImage(file)
      const imageUrl = URL.createObjectURL(file)
      setCoverImagePreview(imageUrl)
    }
  }

  // Handle adding tags
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle key press for tags
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Update track information
  const updateTrackInfo = (index: number, field: string, value: any) => {
    const updatedTracks = [...trackList]
    updatedTracks[index] = {
      ...updatedTracks[index],
      [field]: value,
    }
    setTrackList(updatedTracks)
  }

  // Remove track
  const removeTrack = (index: number) => {
    const updatedTracks = [...trackList]
    updatedTracks.splice(index, 1)
    setTrackList(updatedTracks)

    const updatedFiles = [...files]
    updatedFiles.splice(index, 1)
    setFiles(updatedFiles)
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!artist.trim()) {
      newErrors.artist = "Artist name is required"
    }

    if (!releaseDate) {
      newErrors.releaseDate = "Release date is required"
    }

    if (!genre.trim()) {
      newErrors.genre = "Genre is required"
    }

    if (!coverImage) {
      newErrors.coverImage = "Cover image is required"
    }

    if (files.length === 0) {
      newErrors.files = "At least one audio file is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle upload
  const handleUpload = useCallback(() => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

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

        toast({
          title: "Upload Complete",
          description: `Your ${uploadType} has been uploaded successfully.`,
        })

        // Reset form after 2 seconds
        setTimeout(() => {
          setFiles([])
          setCoverImage(null)
          setCoverImagePreview(null)
          setTitle("")
          setArtist("")
          setReleaseDate("")
          setGenre("")
          setDescription("")
          setTags([])
          setIsExplicit(false)
          setTrackList([])
          setUploadProgress(0)
          setUploadComplete(false)
        }, 2000)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [
    title,
    artist,
    releaseDate,
    genre,
    description,
    tags,
    isExplicit,
    files,
    coverImage,
    trackList,
    uploadType,
    toast,
  ])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Type Selection */}
      <div className="space-y-2">
        <Label>What are you uploading?</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={uploadType === "single" ? "default" : "outline"}
            className={uploadType !== "single" ? "border-gray-700" : ""}
            onClick={() => setUploadType("single")}
          >
            <Music className="h-4 w-4 mr-2" />
            Single
          </Button>
          <Button
            variant={uploadType === "album" ? "default" : "outline"}
            className={uploadType !== "album" ? "border-gray-700" : ""}
            onClick={() => setUploadType("album")}
          >
            <Music className="h-4 w-4 mr-2" />
            Album
          </Button>
          <Button
            variant={uploadType === "ep" ? "default" : "outline"}
            className={uploadType !== "ep" ? "border-gray-700" : ""}
            onClick={() => setUploadType("ep")}
          >
            <Music className="h-4 w-4 mr-2" />
            EP
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className={errors.title ? "text-red-500" : ""}>
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`Enter ${uploadType} title`}
                      className={`bg-gray-800 border-gray-700 ${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artist" className={errors.artist ? "text-red-500" : ""}>
                      Artist Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="artist"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Enter artist name"
                      className={`bg-gray-800 border-gray-700 ${errors.artist ? "border-red-500" : ""}`}
                    />
                    {errors.artist && <p className="text-xs text-red-500">{errors.artist}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="releaseDate" className={errors.releaseDate ? "text-red-500" : ""}>
                      Release Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <Input
                        id="releaseDate"
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className={`bg-gray-800 border-gray-700 ${errors.releaseDate ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.releaseDate && <p className="text-xs text-red-500">{errors.releaseDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre" className={errors.genre ? "text-red-500" : ""}>
                      Genre <span className="text-red-500">*</span>
                    </Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className={`bg-gray-800 border-gray-700 ${errors.genre ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="hiphop">Hip Hop</SelectItem>
                        <SelectItem value="rnb">R&B</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="folk">Folk</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="blues">Blues</SelectItem>
                        <SelectItem value="reggae">Reggae</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.genre && <p className="text-xs text-red-500">{errors.genre}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`Enter a description for your ${uploadType}`}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center flex-1">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add tags (press Enter)"
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <Button type="button" size="sm" onClick={handleAddTag}>
                      Add
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
                            className="ml-1 text-gray-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id="isExplicit" checked={isExplicit} onCheckedChange={setIsExplicit} />
                    <Label htmlFor="isExplicit">Contains explicit content</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label>Visibility:</Label>
                    <Select
                      value={visibility}
                      onValueChange={(value: "public" | "connections" | "private") => setVisibility(value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="public" className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Public
                        </SelectItem>
                        <SelectItem value="connections" className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Connections
                        </SelectItem>
                        <SelectItem value="private" className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Private
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Track List */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Track List</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700"
                  onClick={() => audioFileInputRef.current?.click()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tracks
                </Button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  files.length > 0 ? "border-purple-500" : "border-gray-700"
                } ${errors.files ? "border-red-500" : ""}`}
                onDragOver={handleAudioDragOver}
                onDrop={handleAudioDrop}
                onClick={() => audioFileInputRef.current?.click()}
              >
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <h3 className="font-medium">Drag and drop audio files or click to upload</h3>
                    <p className="text-sm text-gray-400">Supports MP3, WAV, FLAC, and AAC</p>
                    {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="font-medium">{files.length} audio files selected</h3>
                    <p className="text-sm text-gray-400 mt-1">Click to add more or drag and drop additional files</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={audioFileInputRef}
                  className="hidden"
                  onChange={handleAudioFileChange}
                  accept="audio/*"
                  multiple
                />
              </div>

              {trackList.length > 0 && (
                <div className="space-y-4 mt-4">
                  {trackList.map((track, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center h-10 w-10 bg-gray-700 rounded-full">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={track.title}
                          onChange={(e) => updateTrackInfo(index, "title", e.target.value)}
                          placeholder="Track title"
                          className="bg-gray-700 border-gray-600"
                        />
                        <div className="flex items-center mt-2 text-sm text-gray-400">
                          <span>{formatFileSize(track.file.size)}</span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Switch
                              id={`track-explicit-${index}`}
                              checked={track.isExplicit}
                              onCheckedChange={(checked) => updateTrackInfo(index, "isExplicit", checked)}
                              className="scale-75"
                            />
                            <Label htmlFor={`track-explicit-${index}`} className="ml-1 text-xs">
                              Explicit
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white"
                        onClick={() => removeTrack(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Cover Art */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Cover Art</h3>

              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  coverImagePreview ? "border-purple-500" : "border-gray-700"
                } ${errors.coverImage ? "border-red-500" : ""}`}
                onDragOver={handleCoverDragOver}
                onDrop={handleCoverDrop}
                onClick={() => coverImageInputRef.current?.click()}
              >
                {!coverImagePreview ? (
                  <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer py-8">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                    <h3 className="font-medium">Upload Cover Art</h3>
                    <p className="text-sm text-gray-400">Recommended size: 3000 x 3000 pixels</p>
                    {errors.coverImage && <p className="text-sm text-red-500">{errors.coverImage}</p>}
                  </div>
                ) : (
                  <div className="relative">
                    <Image
                      src={coverImagePreview || "/placeholder.svg"}
                      alt="Cover Art Preview"
                      width={300}
                      height={300}
                      className="w-full h-auto rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCoverImage(null)
                        setCoverImagePreview(null)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={coverImageInputRef}
                  className="hidden"
                  onChange={handleCoverImageChange}
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Button */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Ready to Upload</h3>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-gray-400">Uploading... {uploadProgress}%</p>
                </div>
              )}

              {uploadComplete && (
                <div className="bg-green-900/20 text-green-400 p-3 rounded-md flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  <span>Upload complete!</span>
                </div>
              )}

              {!isUploading && !uploadComplete && (
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Make sure you have all the rights to distribute this music</span>
                  </div>

                  <Button className="w-full" onClick={handleUpload} disabled={isUploading || files.length === 0}>
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {uploadType === "single" ? "Single" : uploadType === "album" ? "Album" : "EP"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
