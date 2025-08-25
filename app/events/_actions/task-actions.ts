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

export const createTaskAction = action.schema(createTaskSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase
    .from('tasks')
    .insert({
      org_id: parsedInput.orgId,
      event_id: parsedInput.eventId,
      title: parsedInput.title,
      description: parsedInput.description ?? null,
      assignee_id: parsedInput.assigneeId ?? null,
      due_at: parsedInput.dueAt ?? null,
      priority: parsedInput.priority,
      created_by: user.user.id
    })

  if (error) return { ok: false, error: 'create_failed' }
  revalidatePath(`/events/${parsedInput.eventId}`)
  return { ok: true }
})


