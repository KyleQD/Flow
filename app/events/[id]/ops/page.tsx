"use client"

import { useParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { createTaskAction } from '@/app/events/_actions/task-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EventOpsPage() {
  const params = useParams() as { id: string }
  const eventId = params.id
  const [orgId, setOrgId] = useState("")
  const [title, setTitle] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function addTask(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await createTaskAction({ orgId, eventId, title, dueAt })
      if (!res.data?.ok) setMsg('Failed to create task')
      else setTitle("")
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Event Ops</h1>
      <div className="space-y-3">
        <h2 className="text-white font-medium">Quick Task</h2>
        <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input placeholder="Organization ID" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          <Button disabled={isPending || !orgId || !eventId || !title} type="submit">Add</Button>
        </form>
      </div>
      {msg && <div className="text-red-400 text-sm">{msg}</div>}
    </div>
  )
}


