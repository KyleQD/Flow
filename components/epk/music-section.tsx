"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Upload, Music, Play, Pause, MoreHorizontal, 
  X, GripVertical, ExternalLink, TrendingUp, Circle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Track {
  id: string
  title: string
  url: string
  releaseDate: string
  streams: number
  coverArt: string
  platform: string
  featured?: boolean
}

interface MusicSectionProps {
  tracks: Track[]
  onTracksChange: (tracks: Track[]) => void
}

function TrackCard({ track, onEdit, onRemove, onToggleFeatured }: {
  track: Track
  onEdit: (track: Track) => void
  onRemove: (id: string) => void
  onToggleFeatured: (id: string) => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify': return <Circle className="h-4 w-4 text-green-500" />
      case 'apple': return <Circle className="h-4 w-4 text-gray-500" />
      case 'youtube': return <Circle className="h-4 w-4 text-red-500" />
      case 'soundcloud': return <Circle className="h-4 w-4 text-orange-500" />
      default: return <Music className="h-4 w-4" />
    }
  }

  return (
    <Card className="group relative rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a] hover:shadow-2xl transition-all">
      {track.featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-purple-600 text-white">Featured</Badge>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <button className="opacity-0 group-hover:opacity-100 transition cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          
          {/* Cover Art */}
          <div className="relative w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            {track.coverArt ? (
              <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <Music className="h-6 w-6 text-gray-500" />
            )}
            
            {/* Play Button Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-1" />
              )}
            </button>
          </div>
          
          {/* Track Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{track.title}</h3>
              {getPlatformIcon(track.platform)}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Released {track.releaseDate}</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{track.streams.toLocaleString()} streams</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleFeatured(track.id)}
              className={track.featured ? "text-purple-400" : "text-gray-400"}
            >
              Featured
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(track)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onRemove(track.id)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AddTrackModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean
  onClose: () => void
  onAdd: (track: Omit<Track, 'id'>) => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    releaseDate: '',
    streams: 0,
    coverArt: '',
    platform: 'spotify'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({
      title: '',
      url: '',
      releaseDate: '',
      streams: 0,
      coverArt: '',
      platform: 'spotify'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
        <CardHeader>
          <CardTitle className="text-white">Add New Track</CardTitle>
          <CardDescription className="text-gray-400">
            Add a track from your streaming platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white">Track Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter track title"
                className="bg-[#23263a] border-0 text-white"
                required
              />
            </div>
            
            <div>
              <Label className="text-white">Platform URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://open.spotify.com/track/..."
                className="bg-[#23263a] border-0 text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Release Date</Label>
                <Input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="bg-[#23263a] border-0 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Stream Count</Label>
                <Input
                  type="number"
                  value={formData.streams}
                  onChange={(e) => setFormData({ ...formData, streams: Number(e.target.value) })}
                  className="bg-[#23263a] border-0 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-white">Cover Art URL</Label>
              <Input
                value={formData.coverArt}
                onChange={(e) => setFormData({ ...formData, coverArt: e.target.value })}
                placeholder="https://..."
                className="bg-[#23263a] border-0 text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-700 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
              >
                Add Track
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MusicSection({ tracks, onTracksChange }: MusicSectionProps) {
  const { toast } = useToast()
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddTrack = (trackData: Omit<Track, 'id'>) => {
    const newTrack: Track = {
      ...trackData,
      id: Date.now().toString(),
    }
    onTracksChange([...tracks, newTrack])
    toast({
      title: "Track added",
      description: "Your track has been added to your EPK.",
    })
  }

  const handleRemoveTrack = (id: string) => {
    onTracksChange(tracks.filter(track => track.id !== id))
    toast({
      title: "Track removed",
      description: "The track has been removed from your EPK.",
    })
  }

  const handleToggleFeatured = (id: string) => {
    onTracksChange(tracks.map(track => 
      track.id === id ? { ...track, featured: !track.featured } : track
    ))
  }

  const handleEditTrack = (track: Track) => {
    // TODO: Implement edit functionality
    toast({
      title: "Edit functionality",
      description: "Track editing will be available soon.",
    })
  }

  const handleStreamingImport = (platform: string) => {
    // TODO: Implement streaming platform import
    toast({
      title: `${platform} Import`,
      description: "Streaming platform import will be available soon.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Music</h2>
          <p className="text-gray-400">Showcase your latest tracks and releases</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Track
        </Button>
      </div>

      {/* Import Options */}
      <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-500" />
            Quick Import
          </CardTitle>
          <CardDescription className="text-gray-400">
            Import tracks directly from your streaming platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => handleStreamingImport('Spotify')}
              className="bg-[#23263a] border-0 text-white hover:bg-green-600/80 transition"
            >
              <Circle className="h-4 w-4 mr-2 text-green-500" />
              Spotify
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStreamingImport('Apple Music')}
              className="bg-[#23263a] border-0 text-white hover:bg-gray-600/80 transition"
            >
              <Circle className="h-4 w-4 mr-2 text-gray-500" />
              Apple Music
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStreamingImport('YouTube')}
              className="bg-[#23263a] border-0 text-white hover:bg-red-600/80 transition"
            >
              <Circle className="h-4 w-4 mr-2 text-red-500" />
              YouTube
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStreamingImport('SoundCloud')}
              className="bg-[#23263a] border-0 text-white hover:bg-orange-600/80 transition"
            >
              <Circle className="h-4 w-4 mr-2 text-orange-500" />
              SoundCloud
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracks List */}
      <div className="space-y-4">
        {tracks.length === 0 ? (
          <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
            <CardContent className="py-20 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-white mb-2">No tracks added yet</h3>
              <p className="text-gray-400 mb-6">Start building your music collection for your EPK</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Track
              </Button>
            </CardContent>
          </Card>
        ) : (
          tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onEdit={handleEditTrack}
              onRemove={handleRemoveTrack}
              onToggleFeatured={handleToggleFeatured}
            />
          ))
        )}
      </div>

      <AddTrackModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTrack}
      />
    </div>
  )
} 