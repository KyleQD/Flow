"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Send, Globe, Users, Lock, Loader2 } from 'lucide-react'

export function QuickPostCreator() {
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please write something to post!",
        variant: "destructive"
      })
      return
    }

    if (content.length > 2000) {
      toast({
        title: "Content Too Long",
        description: "Posts must be under 2000 characters.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          type: 'text',
          visibility: visibility
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      const data = await response.json()
      
      toast({
        title: "Post Created! 🎉",
        description: "Your post has been published successfully.",
        className: "bg-green-500 text-white"
      })
      
      setContent('')
      setVisibility('public')
      
      // Refresh the page to show the new post count
      window.location.reload()
      
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Failed to Create Post",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case 'private':
        return <Lock className="h-4 w-4" />
      case 'followers':
        return <Users className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Send className="h-5 w-5 text-purple-400" />
          Quick Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening? Share your thoughts..."
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/50 resize-none"
            rows={3}
            disabled={isSubmitting}
            maxLength={2000}
          />
          
          <div className="flex items-center justify-between">
            <Select value={visibility} onValueChange={setVisibility} disabled={isSubmitting}>
              <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white focus:border-purple-500 focus:ring-purple-500/50">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getVisibilityIcon(visibility)}
                    <span className="capitalize">{visibility}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="public" className="hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="followers" className="hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Followers
                  </div>
                </SelectItem>
                <SelectItem value="private" className="hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Private
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {content.length}/2000
              </span>
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
      </CardContent>
    </Card>
  )
} 