"use client"

import { useParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createOfferAction, addSignatureAction } from '@/app/events/_actions/offer-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EventOffersPage() {
  const params = useParams() as { id: string }
  const eventId = params.id
  const [currency, setCurrency] = useState('USD')
  const [signerEmail, setSignerEmail] = useState('')
  const [signerRole, setSignerRole] = useState('agent')
  const [offerId, setOfferId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function createOffer(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const res = await createOfferAction({ eventId, currency, terms: {} })
      if (res.data?.ok) setOfferId(res.data.offerId as string)
      else setMsg('Failed to create offer')
    })
  }

  function addSignature(e: React.FormEvent) {
    e.preventDefault()
    if (!offerId) return
    setMsg(null)
    startTransition(async () => {
      const res = await addSignatureAction({ offerId, signerEmail, signerRole })
      if (!res.data?.ok) setMsg('Failed to add signature')
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Offers</h1>
      <form onSubmit={createOffer} className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
        <Button disabled={isPending} type="submit">Create Offer</Button>
        {offerId && <div className="text-slate-300 text-sm">Offer: {offerId}</div>}
      </form>

      <form onSubmit={addSignature} className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input placeholder="Signer Email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} />
        <Input placeholder="Signer Role" value={signerRole} onChange={(e) => setSignerRole(e.target.value)} />
        <Button disabled={isPending || !offerId} type="submit">Add Signature</Button>
      </form>

      {msg && <div className="text-red-400 text-sm">{msg}</div>}
    </div>
  )
}


