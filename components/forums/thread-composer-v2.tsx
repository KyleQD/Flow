'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { 
  Type, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Share2,
  Tag,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createThreadAction } from '@/app/forums/_actions/thread-actions'
import { toast } from 'sonner'

interface ForumOption {
  id: string
  label: string
  subLabel?: string
}

interface TagOption {
  id: string
  label: string
  color?: string
}

interface ThreadComposerProps {
  forumId?: string
  onSuccess?: (threadId: string) => void
  onCancel?: () => void
  className?: string
}

export function ThreadComposerV2({
  forumId,
  onSuccess,
  onCancel,
  className
}: ThreadComposerProps) {
  const [isPending, startTransition] = useTransition()
  const [forums, setForums] = useState<ForumOption[]>([])
  const [tags, setTags] = useState<TagOption[]>([])
  
  // Form state
  const [selectedForum, setSelectedForum] = useState(forumId || '')
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<'text' | 'link' | 'media' | 'crosspost'>('text')
  const [contentMd, setContentMd] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Load forums and tags
  useState(() => {
    async function loadData() {
      try {
        // Load forums
        const forumsRes = await fetch('/api/forums')
        if (forumsRes.ok) {
          const forumsData = await forumsRes.json()
          const forumOptions = (forumsData.forums || []).map((f: any) => ({
            id: f.id,
            label: f.title,
            subLabel: f.description
          }))
          setForums(forumOptions)
        }

        // Load tags for selected forum
        if (selectedForum) {
          const tagsRes = await fetch(`/api/forums/${selectedForum}/tags`)
          if (tagsRes.ok) {
            const tagsData = await tagsRes.json()
            const tagOptions = (tagsData.tags || []).map((t: any) => ({
              id: t.id,
              label: t.label,
              color: t.color
            }))
            setTags(tagOptions)
          }
        }
      } catch (error) {
        console.error('Failed to load forum data:', error)
      }
    }
    loadData()
  })

  function handleSubmit() {
    if (!selectedForum) {
      toast.error('Please select a forum')
      return
    }

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (kind === 'text' && !contentMd.trim()) {
      toast.error('Please enter some content')
      return
    }

    if ((kind === 'link' || kind === 'media') && !linkUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    startTransition(async () => {
      const result = await createThreadAction({
        forumId: selectedForum,
        title: title.trim(),
        kind,
        contentMd: kind === 'text' ? contentMd.trim() : undefined,
        linkUrl: (kind === 'link' || kind === 'media') ? linkUrl.trim() : undefined,
        tagIds: selectedTags
      })

      if (result.data?.ok) {
        toast.success('Thread created successfully!')
        onSuccess?.(result.data.threadId)
        // Reset form
        setTitle('')
        setContentMd('')
        setLinkUrl('')
        setSelectedTags([])
        setKind('text')
      } else {
        const errorMessage = result.data?.error === 'not_authenticated'
          ? 'Please sign in to create a thread'
          : 'Failed to create thread. Please try again.'
        toast.error(errorMessage)
      }
    })
  }

  function addTag(tagId: string) {
    if (!selectedTags.includes(tagId) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  function removeTag(tagId: string) {
    setSelectedTags(selectedTags.filter(id => id !== tagId))
  }

  const getTabIcon = (tabKind: string) => {
    switch (tabKind) {
      case 'text': return <Type className="h-4 w-4" />
      case 'link': return <LinkIcon className="h-4 w-4" />
      case 'media': return <ImageIcon className="h-4 w-4" />
      case 'crosspost': return <Share2 className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Card className={cn('bg-slate-900/60 border-slate-800/60', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Create a Thread</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Forum selection */}
        {!forumId && (
          <div className="space-y-2">
            <Label>Choose a community</Label>
            <Combobox
              items={forums}
              value={selectedForum}
              onChange={(value) => setSelectedForum(value || '')}
              placeholder="Select a forum..."
              className="w-full"
            />
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="An interesting title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={180}
          />
          <div className="text-xs text-slate-400 text-right">
            {title.length}/180
          </div>
        </div>

        {/* Post type tabs */}
        <Tabs value={kind} onValueChange={(value) => setKind(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              {getTabIcon('text')}
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              {getTabIcon('link')}
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              {getTabIcon('media')}
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="crosspost" className="flex items-center gap-2">
              {getTabIcon('crosspost')}
              <span className="hidden sm:inline">Cross-post</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <div className="space-y-2">
              <Label>Text (Markdown supported)</Label>
              <Textarea
                placeholder="What are your thoughts?"
                value={contentMd}
                onChange={(e) => setContentMd(e.target.value)}
                className="min-h-[120px]"
                maxLength={20000}
              />
              <div className="text-xs text-slate-400 text-right">
                {contentMd.length}/20,000
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Add some context..."
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={1000}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Media URL</Label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or image URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Tell us about this media..."
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={1000}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crosspost" className="mt-4">
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-sm text-slate-300 mb-2">
                  Cross-posting allows you to share content from other parts of the platform
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Browse Content
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Additional thoughts (optional)</Label>
                <Textarea
                  placeholder="Add your perspective..."
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={1000}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tags */}
        {selectedForum && tags.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags (optional)
            </Label>
            
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId)
                  return tag ? (
                    <Badge
                      key={tagId}
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        borderColor: tag.color ? `${tag.color}50` : undefined,
                        color: tag.color || undefined
                      }}
                    >
                      {tag.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tagId)}
                        className="h-auto p-0 ml-1 text-current hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null
                })}
              </div>
            )}

            {/* Available tags */}
            <div className="flex flex-wrap gap-2">
              {tags
                .filter(tag => !selectedTags.includes(tag.id))
                .slice(0, 10)
                .map(tag => (
                  <Button
                    key={tag.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag.id)}
                    disabled={selectedTags.length >= 5}
                    className="text-xs h-6"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}10` : undefined,
                      borderColor: tag.color ? `${tag.color}30` : undefined,
                      color: tag.color || undefined
                    }}
                  >
                    {tag.label}
                  </Button>
                ))}
            </div>
            
            {selectedTags.length >= 5 && (
              <div className="text-xs text-slate-400">
                Maximum 5 tags allowed
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isPending || !selectedForum || !title.trim()}
          >
            {isPending ? 'Creating...' : 'Create Thread'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
