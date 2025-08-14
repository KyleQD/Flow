"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Trash2 } from 'lucide-react'

interface Agency { id: string; name: string; description?: string | null }
interface AgencyStaff { user_id: string }

export function StaffingAgencyManager() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [staff, setStaff] = useState<AgencyStaff[]>([])
  const [newUserId, setNewUserId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const res = await fetch('/api/agencies/staffing', { cache: 'no-store' })
      const data = await res.json()
      if (active) setAgencies(Array.isArray(data?.agencies) ? data.agencies : [])
    }
    load()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selectedAgencyId) return
    let active = true
    async function load() {
      const res = await fetch(`/api/agencies/staffing/${selectedAgencyId}/staff`, { cache: 'no-store' })
      const data = await res.json()
      if (active) setStaff(Array.isArray(data?.staff) ? data.staff : [])
    }
    load()
    return () => { active = false }
  }, [selectedAgencyId])

  async function createAgency() {
    if (!newName) return
    setLoading(true)
    try {
      const res = await fetch('/api/agencies/staffing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDescription || null })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create agency')
      setAgencies(prev => [data.agency, ...prev])
      setSelectedAgencyId(data.agency.id)
      setNewName('')
      setNewDescription('')
    } finally {
      setLoading(false)
    }
  }

  async function addStaff() {
    if (!selectedAgencyId || !newUserId) return
    const res = await fetch(`/api/agencies/staffing/${selectedAgencyId}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: newUserId })
    })
    if (res.ok) setStaff(prev => [{ user_id: newUserId }, ...prev])
    setNewUserId('')
  }

  async function removeStaff(userId: string) {
    const res = await fetch(`/api/agencies/staffing/${selectedAgencyId}/staff?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
    if (res.ok) setStaff(prev => prev.filter(s => s.user_id !== userId))
  }

  const selectedAgency = useMemo(() => agencies.find(a => a.id === selectedAgencyId) || null, [agencies, selectedAgencyId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Create Staffing Agency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-slate-300">Name</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300">Description</Label>
            <Input value={newDescription} onChange={e => setNewDescription(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <Button onClick={createAgency} disabled={!newName || loading} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" /> Create
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Agencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300">Select Agency</Label>
              <Select value={selectedAgencyId} onValueChange={setSelectedAgencyId}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Choose an agency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {agencies.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedAgency ? (
              <div className="flex items-end"><Badge className="rounded-full">Selected: {selectedAgency.name}</Badge></div>
            ) : null}
          </div>

          <Separator className="bg-slate-700" />

          {selectedAgency ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-slate-300">Add Staff (User ID)</Label>
                  <Input value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="User UUID" className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="flex items-end">
                  <Button onClick={addStaff} disabled={!newUserId} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Users className="h-4 w-4 mr-2" /> Add Staff
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {staff.map(s => (
                  <div key={s.user_id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                    <div className="text-white font-medium">{s.user_id}</div>
                    <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => removeStaff(s.user_id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                ))}
                {staff.length === 0 ? <div className="text-sm text-slate-400">No staff linked.</div> : null}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Select an agency to manage staff.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


