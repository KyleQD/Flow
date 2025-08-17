"use client"

import { useState, useTransition } from 'react'
import { createEventAction } from '@/app/events/_actions/event-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function CreateEventPage() {
  const [title, setTitle] = useState("")
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [orgId, setOrgId] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const res = await createEventAction({ orgId, title, startAt, endAt, timezone: 'UTC' })
      if (res.data?.ok) window.location.href = '/events'
      else setMessage('Failed to create event')
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-white">Create Event</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Organization ID" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        <Button disabled={isPending || !title || !startAt || !endAt || !orgId} type="submit">{isPending ? 'Creating…' : 'Create'}</Button>
      </form>
      {message && <div className="text-red-400 text-sm">{message}</div>}
    </div>
  )
}


