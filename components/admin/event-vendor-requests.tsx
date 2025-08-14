"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface EventVendorRequest {
  id: string
  event_id: string
  job_posting_template_id: string
  vendor_org_id?: string | null
  created_by: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string | null
  created_at?: string
}

interface Props {
  eventId: string
}

export function EventVendorRequests({ eventId }: Props) {
  const [requests, setRequests] = useState<EventVendorRequest[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [canApprove, setCanApprove] = useState<boolean>(false)

  async function load() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/vendor-requests`, { cache: 'no-store' })
      const data = await res.json()
      setRequests(Array.isArray(data?.requests) ? data.requests : [])
      // Load capabilities for this event
      const capsRes = await fetch('/api/admin/capabilities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entityType: 'Event', entityId: eventId })
      })
      const caps = await capsRes.json().catch(() => ({}))
      setCanApprove(Boolean(caps?.capabilities?.canAssignRoles))
    } catch {
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [eventId])

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    try {
      const res = await fetch(`/api/admin/vendor-requests/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(status === 'approved' ? 'Vendor request approved' : 'Vendor request rejected')
      load()
    } catch {
      toast.error('Failed to update request')
    }
  }

  function StatusBadge({ status }: { status: EventVendorRequest['status'] }) {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400'
    }
    return <Badge className={map[status]}>{status}</Badge>
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Vendor Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-slate-400 text-sm">Loading...</p>}
        {!isLoading && requests.length === 0 && (
          <p className="text-slate-500 text-sm">No vendor requests</p>
        )}
        {requests.map(r => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-800 p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                <span className="text-slate-100 text-sm">Job Template: {r.job_posting_template_id.slice(0, 8)}…</span>
              </div>
              {r.message && <p className="text-slate-400 text-xs">{r.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" disabled={!canApprove || r.status !== 'pending'} onClick={() => updateStatus(r.id, 'approved')}>Approve</Button>
              <Button size="sm" variant="ghost" disabled={!canApprove || r.status !== 'pending'} onClick={() => updateStatus(r.id, 'rejected')}>Reject</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


