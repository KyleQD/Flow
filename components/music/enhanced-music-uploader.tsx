"use client"

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Upload,
  Music2,
  X,
  FileAudio,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  Volume2
} from 'lucide-react'
import Image from 'next/image'

interface EnhancedMusicUploaderProps {
  onUploadComplete: (trackData: any) => void
  onCancel: () => void
  isUploading?: boolean
}

interface UploadFile {
  file: File
  preview?: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export function EnhancedMusicUploader({ onUploadComplete, onCancel, isUploading = false }: EnhancedMusicUploaderProps) {
  const [musicFile, setMusicFile] = useState<UploadFile | null>(null)
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    type: 'single' as 'single' | 'album' | 'ep' | 'mixtape',
    release_date: '',
    is_public: true,
    is_featured: false,
    tags: [] as string[],
    lyrics: '',
    spotify_url: '',
    apple_music_url: '',
    soundcloud_url: '',
    youtube_url: ''
  })
  const [newTag, setNewTag] = useState('')
  const [shareAsPost, setShareAsPost] = useState(false)
  const [postContent, setPostContent] = useState('')

  // Music file dropzone
  const onMusicDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate audio file
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select a valid audio file')
        return
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('File size must be less than 100MB')
        return
      }

      setMusicFile({
        file,
        progress: 0,
        status: 'uploading'
      })
    }
  }, [])

  const { getRootProps: getMusicRootProps, getInputProps: getMusicInputProps, isDragActive: isMusicDragActive } = useDropzone({
    onDrop: onMusicDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg']
    },
    maxFiles: 1,
    disabled: !!musicFile
  })

  // Cover art dropzone
  const onCoverDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB')
        return
      }

      const preview = URL.createObjectURL(file)
      setCoverFile({
        file,
        preview,
        progress: 0,
        status: 'uploading'
      })
    }
  }, [])

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: !!coverFile
  })

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async () => {
    if (!musicFile?.file || !formData.title.trim()) {
      toast.error('Please provide a music file and title')
      return
    }

    try {
      // Prepare track data
      const trackData = {
        ...formData,
        musicFile: musicFile.file,
        coverFile: coverFile?.file,
        shareAsPost,
        postContent
      }

      onUploadComplete(trackData)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload track')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Music File Upload */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music2 className="h-5 w-5 text-purple-400" />
              Music File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!musicFile ? (
              <div
                {...getMusicRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isMusicDragActive 
                    ? 'border-purple-400 bg-purple-400/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input {...getMusicInputProps()} />
                <FileAudio className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  {isMusicDragActive ? 'Drop your music file here' : 'Drag & drop your music file'}
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  MP3, WAV, FLAC, AAC, M4A, OGG (max 100MB)
                </p>
                <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileAudio className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">{musicFile.file.name}</p>
                      <p className="text-slate-400 text-sm">
                        {formatFileSize(musicFile.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMusicFile(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {musicFile.status === 'uploading' && (
                  <div className="space-y-2">
                    <Progress value={musicFile.progress} className="w-full" />
                    <p className="text-slate-400 text-sm">
                      Uploading... {musicFile.progress}%
                    </p>
                  </div>
                )}
                
                {musicFile.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Upload complete</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cover Art Upload */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-400" />
              Cover Art (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!coverFile ? (
              <div
                {...getCoverRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isCoverDragActive 
                    ? 'border-purple-400 bg-purple-400/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input {...getCoverInputProps()} />
                <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  {isCoverDragActive ? 'Drop your cover art here' : 'Drag & drop cover art'}
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  JPG, PNG, GIF, WebP (max 10MB)
                </p>
                <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-700">
                      {coverFile.preview && (
                        <Image
                          src={coverFile.preview}
                          alt="Cover preview"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{coverFile.file.name}</p>
                      <p className="text-slate-400 text-sm">
                        {formatFileSize(coverFile.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCoverFile(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Track Details Form */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Track Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Track title..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-300">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'single' | 'album' | 'ep' | 'mixtape') => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="mixtape">Mixtape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre" className="text-gray-300">Genre</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="Genre..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_date" className="text-gray-300">Release Date</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date}
                onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Track description..."
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-gray-300">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="bg-slate-800 border-slate-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="public" className="text-gray-300">Public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="featured" className="text-gray-300">Featured</Label>
            </div>
          </div>

          {/* Share as Post */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="share-post"
                checked={shareAsPost}
                onCheckedChange={setShareAsPost}
              />
              <Label htmlFor="share-post" className="text-gray-300">Share as Post</Label>
            </div>
            {shareAsPost && (
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write a post about your new track..."
                className="bg-slate-800 border-slate-700 text-white"
                rows={3}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isUploading || !musicFile?.file || !formData.title.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isUploading ? 'Uploading...' : 'Upload Track'}
        </Button>
      </div>
    </div>
  )
} 