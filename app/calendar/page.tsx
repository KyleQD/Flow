"use client"

import { useEffect, useState, useTransition } from 'react'
import { createCalendarAction, createHoldAction } from '@/app/events/_actions/event-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function CalendarPage() {
  const [orgId, setOrgId] = useState("")
  const [calendarId, setCalendarId] = useState("")
  const [calName, setCalName] = useState("")
  const [holdStart, setHoldStart] = useState("")
  const [holdEnd, setHoldEnd] = useState("")
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function createCalendar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await createCalendarAction({ orgId, name: calName })
      if (res.data?.ok) setCalendarId(res.data.calendarId as string)
      else setMsg('Failed to create calendar')
    })
  }

  function addHold(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await createHoldAction({ orgId, calendarId, startAt: holdStart, endAt: holdEnd, status: 'soft' })
      if (!res.data?.ok) setMsg('Failed to create hold')
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Calendar & Holds</h1>

      <div className="space-y-3">
        <h2 className="text-white font-medium">Create Calendar</h2>
        <form onSubmit={createCalendar} className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input placeholder="Organization ID" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
          <Input placeholder="Calendar name" value={calName} onChange={(e) => setCalName(e.target.value)} />
          <Button disabled={isPending || !orgId || !calName} type="submit">Create</Button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-white font-medium">Create Hold</h2>
        <form onSubmit={addHold} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input placeholder="Calendar ID" value={calendarId} onChange={(e) => setCalendarId(e.target.value)} />
          <Input type="datetime-local" value={holdStart} onChange={(e) => setHoldStart(e.target.value)} />
          <Input type="datetime-local" value={holdEnd} onChange={(e) => setHoldEnd(e.target.value)} />
          <Button disabled={isPending || !calendarId || !holdStart || !holdEnd} type="submit">Add Hold</Button>
        </form>
      </div>

      {msg && <div className="text-red-400 text-sm">{msg}</div>}
    </div>
  )
}


