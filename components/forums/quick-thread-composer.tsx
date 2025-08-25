'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'

interface ForumOption {
  id: string
  label: string
  subLabel?: string
}

interface QuickThreadComposerProps {
  onCreated?: () => void
}

export function QuickThreadComposer({ onCreated }: QuickThreadComposerProps) {
  const [forums, setForums] = useState<ForumOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [forumValue, setForumValue] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [postType, setPostType] = useState<'text' | 'link'>('text')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadForums = async () => {
      try {
        const res = await fetch('/api/forums')
        const json = await res.json()
        const options: ForumOption[] = (json.forums || []).map((f: any) => ({
          id: f.slug,
          label: f.name,
          subLabel: f.description
        }))
        if (isMounted) setForums(options)
      } catch (e) {}
    }
    loadForums()
    return () => { isMounted = false }
  }, [])

  const canSubmit = useMemo(() => forumValue && title.trim().length > 0, [forumValue, title])

  async function handleSubmit() {
    if (!canSubmit || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/forums/${forumValue}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          body: postType === 'text' ? (body.trim() || null) : null,
          url: postType === 'link' ? (url.trim() || null) : null
        })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to create thread')
        setIsLoading(false)
        return
      }
      setTitle('')
      setBody('')
      setUrl('')
      if (onCreated) onCreated()
    } catch (e: any) {
      setError('Failed to create thread')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800/60 rounded-2xl">
      <CardContent className="p-4 md:p-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <Combobox
              items={forums}
              value={forumValue}
              onChange={(value) => setForumValue(value || '')}
              placeholder="Select forum"
            />
          </div>
          <div className="md:col-span-4">
            <Input
              placeholder="Start a conversation..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
        </div>
        
        {/* Post type toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPostType('text')}
            className={`px-3 py-1 rounded-lg text-sm ${postType === 'text' ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400'}`}
          >
            Text Post
          </button>
          <button
            type="button"
            onClick={() => setPostType('link')}
            className={`px-3 py-1 rounded-lg text-sm ${postType === 'link' ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400'}`}
          >
            Link Post
          </button>
        </div>

        {postType === 'text' ? (
          <Textarea
            placeholder="What's on your mind? Share your thoughts..."
            value={body}
            onChange={e => setBody(e.target.value)}
            className="min-h-[88px]"
          />
        ) : (
          <Input
            placeholder="Paste URL here (YouTube, SoundCloud, Spotify, etc.)"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        )}
        {error && (
          <div className="text-sm text-red-400">{error}</div>
        )}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {isLoading ? 'Posting…' : 'Post Thread'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


