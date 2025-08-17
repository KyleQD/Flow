'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'

const action = createSafeActionClient()

const createIncidentSchema = z.object({
  orgId: z.string().uuid(),
  eventId: z.string().uuid(),
  severity: z.enum(['info','minor','major','critical']).default('info'),
  title: z.string().min(3),
  notes: z.string().optional()
})

export const createIncidentAction = action(createIncidentSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }
  const { error } = await supabase
    .from('incidents')
    .insert({ org_id: input.orgId, event_id: input.eventId, severity: input.severity, title: input.title, notes: input.notes ?? null, reported_by: user.user.id })
  if (error) return { ok: false, error: 'create_failed' }
  return { ok: true }
})


