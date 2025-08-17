'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'

const action = createSafeActionClient()

const createDocSchema = z.object({
  eventId: z.string().uuid(),
  kind: z.enum(['coi','permit','tax','licensing','nda']),
  party: z.string().min(3),
  dueAt: z.string().optional()
})

export const createRequiredDocAction = action(createDocSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }
  const { error } = await supabase
    .from('required_docs')
    .insert({ event_id: input.eventId, kind: input.kind, party: input.party, due_at: input.dueAt ?? null })
  if (error) return { ok: false, error: 'create_failed' }
  return { ok: true }
})

const markUploadedSchema = z.object({
  docId: z.string().uuid(),
  fileUrl: z.string().url()
})

export const markDocUploadedAction = action(markUploadedSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }
  const { error } = await supabase
    .from('required_docs')
    .update({ status: 'uploaded', file_url: input.fileUrl })
    .eq('id', input.docId)
  if (error) return { ok: false, error: 'update_failed' }
  return { ok: true }
})


