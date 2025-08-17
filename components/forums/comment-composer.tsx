'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface CommentComposerProps {
  threadId: string
  parentCommentId?: string
  onPosted?: () => void
}

export function CommentComposer({ threadId, parentCommentId, onPosted }: CommentComposerProps) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (loading || !body.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/forums/threads/${threadId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), parent_comment_id: parentCommentId || null })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to post comment')
        setLoading(false)
        return
      }
      setBody('')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('forum:comment-posted', { detail: { threadId } }))
      }
      if (onPosted) onPosted()
    } catch (e) {
      setError('Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a comment..." className="min-h-[96px]" />
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={submit} disabled={loading || !body.trim()} size="sm">{loading ? 'Posting…' : 'Post comment'}</Button>
      </div>
    </div>
  )
}


