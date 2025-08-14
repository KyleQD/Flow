"use client"

import { useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function RbacRoleAssignment({ entityType, entityId, className }: RbacRoleAssignmentProps) {
  const [roles, setRoles] = useState<RbacRole[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [targetUserId, setTargetUserId] = useState<string>('')
  const [roleName, setRoleName] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  useEffect(function loadRoles() {
    let isActive = true
    async function run() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/admin/rbac/roles', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load roles')
        const data = await res.json()
        const list: RbacRole[] = Array.isArray(data?.roles) ? data.roles : []
        if (isActive) setRoles(list)
      } catch {
        if (isActive) setRoles([])
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    run()
    return () => { isActive = false }
  }, [])

  async function onAssign() {
    setMessage('')
    if (!targetUserId || !roleName) {
      setMessage('Select a role and provide a user id')
      return
    }
    try {
      const res = await fetch('/api/admin/rbac/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, entityType, entityId, roleName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to assign role')
      setMessage('Role assigned')
    } catch (e: any) {
      setMessage(e?.message || 'Failed to assign role')
    }
  }

  const sortedRoles = useMemo(() => roles.slice().sort((a, b) => a.name.localeCompare(b.name)), [roles])

  return (
    <div className={cn('grid gap-3 rounded-xl border p-4', className)}>
      <div className="grid gap-1">
        <Label htmlFor="user-id">User ID</Label>
        <Input id="user-id" value={targetUserId} onChange={e => setTargetUserId(e.target.value)} placeholder="UUID" />
      </div>
      <div className="grid gap-1">
        <Label>Role</Label>
        <Select value={roleName} onValueChange={setRoleName} disabled={isLoading || sortedRoles.length === 0}>
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? 'Loading roles...' : 'Select a role'} />
          </SelectTrigger>
          <SelectContent>
            {sortedRoles.map(r => (
              <SelectItem key={r.id} value={r.name}>{r.display_name || r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onAssign} disabled={!targetUserId || !roleName || isLoading}>Assign</Button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>
    </div>
  )
}

export interface RbacRoleAssignmentProps {
  entityType: string
  entityId: string
  className?: string
}

export interface RbacRole {
  id: string
  name: string
  display_name?: string | null
  scope_type: 'global' | 'entity'
  is_system?: boolean
  description?: string | null
}


