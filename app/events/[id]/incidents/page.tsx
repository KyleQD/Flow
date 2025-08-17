"use client"

import { useParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createIncidentAction } from '@/app/events/_actions/incident-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EventIncidentsPage() {
  const params = useParams() as { id: string }
  const eventId = params.id
  const [orgId, setOrgId] = useState('')
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('info')
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function create(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await createIncidentAction({ orgId, eventId, severity: severity as any, title })
      if (!res.data?.ok) setMsg('Failed to create incident')
      else setTitle('')
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Incidents</h1>
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input placeholder="Organization ID" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Severity (info|minor|major|critical)" value={severity} onChange={(e) => setSeverity(e.target.value)} />
        <Button disabled={isPending || !orgId || !title} type="submit">Create</Button>
      </form>
      {msg && <div className="text-red-400 text-sm">{msg}</div>}
    </div>
  )
}


