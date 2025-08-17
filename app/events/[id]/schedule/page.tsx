"use client"

import { useParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createScheduleAction, addScheduleItemsAction } from '@/app/events/_actions/schedule-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EventSchedulePage() {
  const params = useParams() as { id: string }
  const eventId = params.id
  const [date, setDate] = useState('')
  const [name, setName] = useState('Show Day')
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function create(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await createScheduleAction({ eventId, date, name })
      if (res.data?.ok) setScheduleId(res.data.scheduleId as string)
      else setMsg('Failed to create schedule')
    })
  }

  function addItems(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduleId) return
    setMsg(null)
    startTransition(async () => {
      const now = new Date()
      const start = now.toISOString()
      const end = new Date(now.getTime() + 60*60*1000).toISOString()
      const res = await addScheduleItemsAction({ scheduleId, items: [{ startAt: start, endAt: end, title: 'Soundcheck' }] })
      if (!res.data?.ok) setMsg('Failed to add items')
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Schedule</h1>
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button disabled={isPending || !date} type="submit">Create</Button>
      </form>
      <form onSubmit={addItems} className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Button disabled={isPending || !scheduleId} type="submit">Add Soundcheck</Button>
        {scheduleId && <div className="text-slate-300 text-sm">Schedule: {scheduleId}</div>}
      </form>
      {msg && <div className="text-red-400 text-sm">{msg}</div>}
    </div>
  )
}


