"use client"

import { useState, useEffect } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { 
  Upload,
  Music2,
  Play,
  Pause,
  Edit,
  Trash2,
  Download,
  Share2,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Users,
  Plus,
  Volume2
} from "lucide-react"
import Image from "next/image"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MusicTrack {
  id?: string
  title: string
  artist: string
  album?: string
  genre: string
  duration?: number
  file_url: string
  cover_art_url?: string
  description?: string
  lyrics?: string
  release_date?: string
  is_featured: boolean
  is_public: boolean
  play_count: number
  download_count: number
  tags: string[]
  created_at?: string
  updated_at?: string
}

export default function MusicPage() {
  const { user, profile } = useArtist()
  const supabase = createClientComponentClient()
  
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null)
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null)
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  
  // Uploader form state
  const [formData, setFormData] = useState<MusicTrack>({
    title: '',
    artist: profile?.artist_name || '',
    album: '',
    genre: '',
    description: '',
    lyrics: '',
    release_date: '',
    is_featured: false,
    is_public: true,
    play_count: 0,
    download_count: 0,
    tags: [],
    file_url: ''
  })
  
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (user) {
      loadTracks()
    }
  }, [user])

  useEffect(() => {
    if (editingTrack) {
      setFormData({
        ...editingTrack,
        artist: editingTrack.artist || profile?.artist_name || ''
      })
    } else {
      setFormData({
        title: '',
        artist: profile?.artist_name || '',
        album: '',
        genre: '',
        description: '',
        lyrics: '',
        release_date: '',
        is_featured: false,
        is_public: true,
        play_count: 0,
        download_count: 0,
        tags: [],
        file_url: ''
      })
      setMusicFile(null)
      setCoverFile(null)
    }
  }, [editingTrack, profile])

  const loadTracks = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      // For now, we'll use artist_works table with media_type = 'audio'
      // In the future, you could create a dedicated artist_music table
      const { data, error } = await supabase
        .from('artist_works')
        .select('*')
        .eq('user_id', user.id)
        .eq('media_type', 'audio')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our MusicTrack interface
      const transformedTracks = (data || []).map(work => ({
        id: work.id,
        title: work.title,
        artist: profile?.artist_name || 'Unknown Artist',
        genre: work.tags?.[0] || 'Unknown',
        file_url: work.media_url,
        cover_art_url: work.thumbnail_url,
        description: work.description,
        is_featured: work.is_featured,
        is_public: true, // Default for now
        play_count: 0, // We'll need to track this separately
        download_count: 0, // We'll need to track this separately
        tags: work.tags || [],
        duration: work.duration,
        created_at: work.created_at,
        updated_at: work.updated_at
      }))
      
      setTracks(transformedTracks)
    } catch (error) {
      console.error('Error loading tracks:', error)
      toast.error('Failed to load music tracks')
    } finally {
      setIsLoading(false)
    }
  }

  const uploadFiles = async () => {
    if (!musicFile || !user) return { fileUrl: '', coverUrl: '' }

    try {
      setUploadProgress(20)
      
      // Upload music file
      const musicFileExt = musicFile.name.split('.').pop()
      const musicFileName = `${user.id}/${Date.now()}-${musicFile.name}`
      
      const { error: musicUploadError } = await supabase.storage
        .from('artist-content')
        .upload(`music/${musicFileName}`, musicFile)

      if (musicUploadError) throw musicUploadError

      const { data: { publicUrl: musicUrl } } = supabase.storage
        .from('artist-content')
        .getPublicUrl(`music/${musicFileName}`)

      setUploadProgress(60)

      // Upload cover art if provided
      let coverUrl = ''
      if (coverFile) {
        const coverFileExt = coverFile.name.split('.').pop()
        const coverFileName = `${user.id}/${Date.now()}-cover.${coverFileExt}`
        
        const { error: coverUploadError } = await supabase.storage
          .from('artist-content')
          .upload(`covers/${coverFileName}`, coverFile)

        if (coverUploadError) throw coverUploadError

        const { data: { publicUrl } } = supabase.storage
          .from('artist-content')
          .getPublicUrl(`covers/${coverFileName}`)

        coverUrl = publicUrl
      }

      setUploadProgress(100)
      return { fileUrl: musicUrl, coverUrl }
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Failed to upload files')
      return { fileUrl: '', coverUrl: '' }
    }
  }

  const handleSaveTrack = async () => {
    if (!user || !formData.title.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    if (!editingTrack && !musicFile) {
      toast.error('Please select a music file')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      
      let fileUrl = formData.file_url
      let coverUrl = formData.cover_art_url

      // Upload files if this is a new track or files have changed
      if (!editingTrack || musicFile) {
        const uploadResult = await uploadFiles()
        if (uploadResult.fileUrl) {
          fileUrl = uploadResult.fileUrl
        }
        if (uploadResult.coverUrl) {
          coverUrl = uploadResult.coverUrl
        }
      }

      const trackData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        media_type: 'audio',
        media_url: fileUrl,
        thumbnail_url: coverUrl,
        tags: formData.tags,
        is_featured: formData.is_featured,
        duration: musicFile ? await getAudioDuration(musicFile) : formData.duration,
        updated_at: new Date().toISOString()
      }

      if (editingTrack?.id) {
        // Update existing track
        const { error } = await supabase
          .from('artist_works')
          .update(trackData)
          .eq('id', editingTrack.id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Track updated successfully!')
      } else {
        // Create new track
        const { data, error } = await supabase
          .from('artist_works')
          .insert(trackData)
          .select()
          .single()

        if (error) throw error
        toast.success('Track uploaded successfully!')
      }
      
      setShowUploader(false)
      setEditingTrack(null)
      await loadTracks()
    } catch (error) {
      console.error('Error saving track:', error)
      toast.error('Failed to save track')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration))
        URL.revokeObjectURL(audio.src)
      }
      audio.onerror = () => resolve(0)
    })
  }

  const handleDeleteTrack = async (trackId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('artist_works')
        .delete()
        .eq('id', trackId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setTracks(prev => prev.filter(track => track.id !== trackId))
      toast.success('Track deleted successfully')
    } catch (error) {
      console.error('Error deleting track:', error)
      toast.error('Failed to delete track')
    } finally {
      setDeleteTrackId(null)
    }
  }

  const handlePlayPause = (track: MusicTrack) => {
    if (currentPlaying === track.id) {
      // Pause current track
      audioElement?.pause()
      setCurrentPlaying(null)
    } else {
      // Play new track
      if (audioElement) {
        audioElement.pause()
      }
      const audio = new Audio(track.file_url)
      audio.play()
      setAudioElement(audio)
      setCurrentPlaying(track.id!)
      
      audio.onended = () => {
        setCurrentPlaying(null)
        setAudioElement(null)
      }
    }
  }

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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalStats = () => {
    return tracks.reduce((acc, track) => ({
      totalTracks: acc.totalTracks + 1,
      totalPlays: acc.totalPlays + track.play_count,
      totalDuration: acc.totalDuration + (track.duration || 0),
      featuredTracks: acc.featuredTracks + (track.is_featured ? 1 : 0)
    }), { totalTracks: 0, totalPlays: 0, totalDuration: 0, featuredTracks: 0 })
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Music Library</h1>
            <p className="text-gray-400">Upload and manage your music tracks</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setEditingTrack(null)
            setShowUploader(true)
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Track
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Tracks</p>
                <p className="text-2xl font-bold text-white">{stats.totalTracks}</p>
              </div>
              <Music2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Plays</p>
                <p className="text-2xl font-bold text-white">{stats.totalPlays.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Duration</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.totalDuration / 60)}m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-white">{stats.featuredTracks}</p>
              </div>
              <Volume2 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracks List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <Music2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tracks yet</h3>
            <p className="text-gray-400 mb-6">
              Start building your music library by uploading your first track.
            </p>
            <Button 
              onClick={() => {
                setEditingTrack(null)
                setShowUploader(true)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Track
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => (
            <Card key={track.id} className="bg-slate-900/50 border-slate-700/50 group hover:border-purple-500/50 transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Cover Art */}
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    {track.cover_art_url ? (
                      <Image
                        src={track.cover_art_url}
                        alt={track.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Music2 className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white truncate">
                          {track.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {track.artist} • {track.genre} • {formatDuration(track.duration)}
                        </p>
                        {track.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {track.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs border-purple-500/30 text-purple-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayPause(track)}
                          className="text-gray-400 hover:text-white"
                        >
                          {currentPlaying === track.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingTrack(track)
                                setShowUploader(true)
                              }}
                              className="text-gray-300 hover:text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem 
                              onClick={() => setDeleteTrackId(track.id!)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload/Edit Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTrack ? 'Edit Track' : 'Upload New Track'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editingTrack && (
                  <div className="space-y-2">
                    <Label htmlFor="music-file" className="text-gray-300">Music File *</Label>
                    <Input
                      id="music-file"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="cover-file" className="text-gray-300">Cover Art</Label>
                  <Input
                    id="cover-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Upload Progress</Label>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Track Details */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Track Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="artist" className="text-gray-300">Artist</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="Artist name..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Track description..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                    <Label htmlFor="featured" className="text-gray-300">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                    />
                    <Label htmlFor="public" className="text-gray-300">Public</Label>
                  </div>
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
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowUploader(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrack} disabled={isUploading} className="bg-purple-600 hover:bg-purple-700">
              {isUploading ? 'Uploading...' : editingTrack ? 'Update' : 'Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTrackId} onOpenChange={() => setDeleteTrackId(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Track</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this track? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTrackId && handleDeleteTrack(deleteTrackId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 