"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Users, UserPlus, Trash2 } from 'lucide-react'

interface Row {
  event_id: string
  participant_type: string
  participant_id: string
  role?: string | null
}

export function EventParticipantsTab({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [participantType, setParticipantType] = useState<string>('Individual')
  const [participantId, setParticipantId] = useState<string>('')
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/events/${eventId}/participants`, { cache: 'no-store' })
        const data = await res.json()
        if (active) setRows(Array.isArray(data?.participants) ? data.participants : [])
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [eventId])

  async function addParticipant() {
    if (!participantId) return
    const res = await fetch(`/api/events/${eventId}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantType, participantId, role: role || null })
    })
    const data = await res.json()
    if (res.ok && data?.participant) setRows(prev => [data.participant, ...prev])
    setParticipantId('')
    setRole('')
  }

  async function removeParticipant(type: string, id: string) {
    const res = await fetch(`/api/events/${eventId}/participants?participantType=${encodeURIComponent(type)}&participantId=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) setRows(prev => prev.filter(r => !(r.participant_type === type && r.participant_id === id)))
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white">Participants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-slate-300">Type</Label>
            <Select value={participantType} onValueChange={setParticipantType}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Artist">Artist</SelectItem>
                <SelectItem value="PerformanceAgency">Performance Agency</SelectItem>
                <SelectItem value="StaffingAgency">Staffing Agency</SelectItem>
                <SelectItem value="ProductionCompany">Production Company</SelectItem>
                <SelectItem value="Promoter">Promoter</SelectItem>
                <SelectItem value="RentalCompany">Rental Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-slate-300">Participant ID</Label>
            <Input value={participantId} onChange={e => setParticipantId(e.target.value)} placeholder="UUID" className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div className="md:col-span-1">
            <Label className="text-slate-300">Role (optional)</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., Headliner" className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">&nbsp;</Label>
            <Button onClick={addParticipant} disabled={!participantId || isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
              <UserPlus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        <div className="space-y-3">
          {rows.map(row => (
            <div key={`${row.participant_type}:${row.participant_id}`} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">{row.participant_type}</div>
                  <div className="text-sm text-slate-400">{row.participant_id}{row.role ? ` • ${row.role}` : ''}</div>
                </div>
              </div>
              <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => removeParticipant(row.participant_type, row.participant_id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </Button>
            </div>
          ))}
          {rows.length === 0 ? (
            <div className="text-sm text-slate-400">No participants added yet.</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}


