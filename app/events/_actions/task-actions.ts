'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const action = createSafeActionClient()

const createTaskSchema = z.object({
  orgId: z.string().uuid(),
  eventId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  dueAt: z.string().optional(),
  priority: z.enum(['low','medium','high','critical']).default('medium')
})

export const createTaskAction = action(createTaskSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase
    .from('tasks')
    .insert({
      org_id: input.orgId,
      event_id: input.eventId,
      title: input.title,
      description: input.description ?? null,
      assignee_id: input.assigneeId ?? null,
      due_at: input.dueAt ?? null,
      priority: input.priority,
      created_by: user.user.id
    })

  if (error) return { ok: false, error: 'create_failed' }
  revalidatePath(`/events/${input.eventId}`)
  return { ok: true }
})


