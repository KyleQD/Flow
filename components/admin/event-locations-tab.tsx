"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Trash2, MapPin, Star, Plus } from 'lucide-react'

interface EventLocationRow {
  event_id: string
  location_id: string
  location_type: string
  is_primary: boolean
  locations?: {
    id: string
    location_type: string
    name: string
    address?: string | null
  }
}

export function EventLocationsTab({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<EventLocationRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newLocationType, setNewLocationType] = useState<string>('Venue')
  const [newLocationName, setNewLocationName] = useState<string>('')
  const [newLocationAddress, setNewLocationAddress] = useState<string>('')
  const [isPrimary, setIsPrimary] = useState<boolean>(false)

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/events/${eventId}/locations`, { cache: 'no-store' })
        const data = await res.json()
        if (active) setRows(Array.isArray(data?.locations) ? data.locations : [])
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [eventId])

  async function addLocation() {
    if (!newLocationName) return
    // create location then link
    const createRes = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationType: newLocationType, name: newLocationName, address: newLocationAddress || null })
    })
    const created = await createRes.json()
    if (!createRes.ok) return
    const locationId = created?.location?.id
    if (!locationId) return

    const linkRes = await fetch(`/api/events/${eventId}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId, locationType: newLocationType, isPrimary })
    })
    const linked = await linkRes.json()
    if (linkRes.ok && linked?.location) setRows(prev => [linked.location, ...prev])
    setNewLocationName('')
    setNewLocationAddress('')
    setIsPrimary(false)
  }

  async function removeLocation(locationId: string) {
    const res = await fetch(`/api/events/${eventId}/locations?locationId=${locationId}`, { method: 'DELETE' })
    if (res.ok) setRows(prev => prev.filter(r => r.location_id !== locationId))
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white">Locations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Label className="text-slate-300">Location Type</Label>
            <Select value={newLocationType} onValueChange={setNewLocationType}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Venue">Venue</SelectItem>
                <SelectItem value="PublicLocation">Public Location</SelectItem>
                <SelectItem value="PrivateLocation">Private Location</SelectItem>
                <SelectItem value="VirtualLocation">Virtual Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-slate-300">Name</Label>
            <Input value={newLocationName} onChange={e => setNewLocationName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">Primary</Label>
            <Button variant={isPrimary ? 'default' : 'outline'} onClick={() => setIsPrimary(v => !v)} className="w-full">
              <Star className="h-4 w-4 mr-2" /> {isPrimary ? 'Primary' : 'Set Primary'}
            </Button>
          </div>
          <div className="md:col-span-5">
            <Label className="text-slate-300">Address (optional)</Label>
            <Input value={newLocationAddress} onChange={e => setNewLocationAddress(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div className="md:col-span-5">
            <Button onClick={addLocation} disabled={!newLocationName || isLoading} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" /> Add Location
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.location_id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    {row.locations?.name || row.location_id}
                    {row.is_primary ? <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full">Primary</span> : null}
                  </div>
                  <div className="text-sm text-slate-400">{row.locations?.address || row.location_type}</div>
                </div>
              </div>
              <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => removeLocation(row.location_id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </Button>
            </div>
          ))}
          {rows.length === 0 ? (
            <div className="text-sm text-slate-400">No locations added yet.</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}


