'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'

const action = createSafeActionClient()

const createOfferSchema = z.object({
  eventId: z.string().uuid(),
  currency: z.string().min(3).max(4).default('USD'),
  terms: z.record(z.any()).default({})
})

export const createOfferAction = action(createOfferSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('offers')
    .insert({ event_id: input.eventId, currency: input.currency, terms: input.terms, created_by: user.user.id })
    .select('id')
    .single()

  if (error) return { ok: false, error: 'create_failed' }
  return { ok: true, offerId: data.id }
})

const addSignatureSchema = z.object({
  offerId: z.string().uuid(),
  signerEmail: z.string().email(),
  signerRole: z.string().min(3)
})

export const addSignatureAction = action(addSignatureSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase
    .from('signatures')
    .insert({ offer_id: input.offerId, signer_email: input.signerEmail, signer_role: input.signerRole })

  if (error) return { ok: false, error: 'create_failed' }
  return { ok: true }
})


