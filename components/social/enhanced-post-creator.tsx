"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ImagePlus, 
  Send, 
  Video, 
  Music, 
  Calendar,
  MapPin,
  Smile,
  Hash,
  Mic,
  Camera,
  Zap,
  Sparkles
} from "lucide-react"

export default function EnhancedPostCreator() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video' | 'music' | 'event'>('text')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    
    setLoading(true)
    // Simulate post creation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setContent("")
    setLoading(false)
  }

  const postTypes = [
    { id: 'text', label: 'Text', icon: Hash, gradient: 'from-slate-500 to-slate-600' },
    { id: 'image', label: 'Photo', icon: Camera, gradient: 'from-pink-500 to-purple-500' },
    { id: 'video', label: 'Video', icon: Video, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'music', label: 'Music', icon: Music, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'event', label: 'Event', icon: Calendar, gradient: 'from-yellow-500 to-orange-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Post Type Selector */}
      <div className="flex flex-wrap gap-2">
        {postTypes.map((type) => (
          <Button
            key={type.id}
            variant="outline"
            size="sm"
            className={`relative overflow-hidden transition-all duration-300 ${
              selectedType === type.id
                ? `bg-gradient-to-r ${type.gradient} text-white border-0 shadow-lg`
                : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30 hover:border-slate-500/50'
            }`}
            onClick={() => setSelectedType(type.id as any)}
          >
            <type.icon className="h-4 w-4 mr-2" />
            {type.label}
            {selectedType === type.id && (
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
            )}
          </Button>
        ))}
      </div>

      {/* Main Composer */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-purple-400/30">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                U
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">Your Name</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs border-0">
                  <Zap className="h-3 w-3 mr-1" />
                  General
                </Badge>
              </div>
              <p className="text-sm text-slate-400">Share something amazing...</p>
            </div>
          </div>

          {/* Content Input */}
          <div className="relative">
            <Textarea
              placeholder={
                selectedType === 'text' ? "What's on your mind?" :
                selectedType === 'image' ? "Share a photo with your story..." :
                selectedType === 'video' ? "Share a video with your audience..." :
                selectedType === 'music' ? "Share your latest track or favorite song..." :
                "Create an event for your community..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-400/50 focus:ring-purple-400/20 resize-none transition-all duration-300"
              rows={4}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400">
              {content.length}/500
            </div>
          </div>

          {/* Media Upload Area */}
          {selectedType !== 'text' && (
            <div className="relative">
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 bg-gradient-to-br ${
                postTypes.find(t => t.id === selectedType)?.gradient
              }/5 border-slate-600/50 hover:border-purple-400/50`}>
                <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-r ${
                  postTypes.find(t => t.id === selectedType)?.gradient
                } w-fit`}>
                  {selectedType === 'image' && <Camera className="h-6 w-6 text-white" />}
                  {selectedType === 'video' && <Video className="h-6 w-6 text-white" />}
                  {selectedType === 'music' && <Music className="h-6 w-6 text-white" />}
                  {selectedType === 'event' && <Calendar className="h-6 w-6 text-white" />}
                </div>
                <p className="text-white font-medium mb-2">
                  {selectedType === 'image' && 'Upload Photos'}
                  {selectedType === 'video' && 'Upload Video'}
                  {selectedType === 'music' && 'Upload Music'}
                  {selectedType === 'event' && 'Event Details'}
                </p>
                <p className="text-slate-400 text-sm">
                  {selectedType === 'image' && 'Drag & drop images or click to browse'}
                  {selectedType === 'video' && 'Drag & drop video files or click to browse'}
                  {selectedType === 'music' && 'Upload your track or share streaming links'}
                  {selectedType === 'event' && 'Add event information and details'}
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-4 bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                >
                  Choose Files
                </Button>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Quick Actions */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                <Smile className="h-4 w-4 mr-1" />
                Emoji
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Location
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <Hash className="h-4 w-4 mr-1" />
                Tags
              </Button>
            </div>

            {/* Character Count & Post Button */}
            <div className="flex items-center space-x-3">
              <div className="text-xs text-slate-400">
                {content.length > 400 && (
                  <span className={content.length > 500 ? 'text-red-400' : 'text-yellow-400'}>
                    {500 - content.length} characters remaining
                  </span>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={loading || !content.trim() || content.length > 500}
                className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg transition-all duration-300 ${
                  loading ? 'animate-pulse' : 'hover:shadow-purple-500/25'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-white font-medium">Creating your post...</p>
              <p className="text-slate-400 text-sm">This may take a moment</p>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-200 mb-1">Pro Tips</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Use hashtags to increase discoverability</li>
              <li>• Tag locations to connect with local community</li>
              <li>• Share authentic content that resonates with your audience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 