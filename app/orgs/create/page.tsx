"use client"

import { useState, useTransition } from 'react'
import { createOrganizationAction } from '@/app/orgs/_actions/org-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function CreateOrgPage() {
  const [name, setName] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const res = await createOrganizationAction({ name })
      if (res.data?.ok) {
        window.location.href = '/dashboard'
      } else setMessage('Failed to create organization')
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-white">Create Organization</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Organization name" />
        <Button disabled={isPending || !name.trim()} type="submit">{isPending ? 'Creating…' : 'Create'}</Button>
      </form>
      {message && <div className="text-red-400 text-sm">{message}</div>}
    </div>
  )
}


