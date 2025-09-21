'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, MessageSquare, Hash, Link, Image, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

interface Forum {
  id: string
  slug: string
  name: string
  description: string
  icon_url?: string
}

export default function NewThreadPage() {
  const [forums, setForums] = useState<Forum[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedForum, setSelectedForum] = useState('')
  const [postType, setPostType] = useState<'text' | 'link' | 'media'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadForums()
  }, [user, router])

  const loadForums = async () => {
    try {
      const response = await fetch('/api/forums')
      const data = await response.json()
      if (data.success) {
        setForums(data.forums || [])
      }
    } catch (error) {
      console.error('Error loading forums:', error)
      toast.error('Failed to load forums')
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to start a conversation')
      return
    }

    if (!selectedForum || !title.trim()) {
      toast.error('Please select a forum and enter a title')
      return
    }

    if (postType === 'text' && !content.trim()) {
      toast.error('Please enter some content')
      return
    }

    if (postType === 'link' && !linkUrl.trim()) {
      toast.error('Please enter a link URL')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/forums/${selectedForum}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body: postType === 'text' ? content.trim() : null,
          url: postType === 'link' ? linkUrl.trim() : null,
          tags: tags
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Conversation started successfully!')
        router.push(`/forums/${selectedForum}`)
      } else {
        toast.error(data.error || 'Failed to start conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to start conversation')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <MessageSquare className="h-8 w-8" />
                Start a New Conversation
              </h1>
              <p className="text-gray-400 mt-1">Share your thoughts and start a discussion with the community</p>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="space-y-6">
              {/* Forum Selection */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-white">Choose a Forum</label>
                <Select value={selectedForum} onValueChange={setSelectedForum}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white h-12">
                    <SelectValue placeholder="Select a forum to post in" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {forums.map((forum) => (
                      <SelectItem key={forum.id} value={forum.slug} className="text-white hover:bg-slate-700">
                        <div className="flex items-center gap-3">
                          {forum.icon_url ? (
                            <img src={forum.icon_url} alt={forum.name} className="w-6 h-6 rounded" />
                          ) : (
                            <Hash className="w-6 h-6" />
                          )}
                          <div>
                            <div className="font-medium">{forum.name}</div>
                            <div className="text-sm text-gray-400">{forum.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Post Type Selection */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-white">Post Type</label>
                <Tabs value={postType} onValueChange={(value) => setPostType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-600 h-12">
                    <TabsTrigger value="text" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="link" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                      <Link className="h-5 w-5 mr-2" />
                      Link
                    </TabsTrigger>
                    <TabsTrigger value="media" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                      <Image className="h-5 w-5 mr-2" />
                      Media
                    </TabsTrigger>
                  </TabsList>

                  {/* Content based on post type */}
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Content *</label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts, ask questions, or start a discussion..."
                        className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 min-h-[200px]"
                        maxLength={2000}
                      />
                      <div className="text-xs text-gray-400 text-right">
                        {content.length}/2000
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="link" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Link URL *</label>
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 h-12"
                        type="url"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Description (optional)</label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a description or your thoughts about this link..."
                        className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 min-h-[120px]"
                        maxLength={500}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Media Upload</label>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center">
                        <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2 text-lg">Upload images, videos, or audio files</p>
                        <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Caption (optional)</label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a caption or description..."
                        className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 min-h-[120px]"
                        maxLength={500}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-white">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 h-12"
                  maxLength={200}
                />
                <div className="text-xs text-gray-400 text-right">
                  {title.length}/200
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-white">Tags (optional)</label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 h-12"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    maxLength={20}
                  />
                  <Button
                    onClick={addTag}
                    disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-6"
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {tags.length}/5 tags • Helps others discover your conversation
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-slate-600 text-gray-300 hover:bg-slate-800 h-12 px-8"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedForum || !title.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 px-8"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  Start Conversation
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
