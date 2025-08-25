'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const action = createSafeActionClient()

const createScheduleSchema = z.object({
  eventId: z.string().uuid(),
  date: z.string(),
  name: z.string().min(2)
})

export const createScheduleAction = action.schema(createScheduleSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }
  const { data, error } = await supabase
    .from('schedules')
    .insert({ event_id: parsedInput.eventId, date: parsedInput.date, name: parsedInput.name })
    .select('id')
    .single()
  if (error) return { ok: false, error: 'create_failed' }
  revalidatePath(`/events/${parsedInput.eventId}/schedule`)
  return { ok: true, scheduleId: data.id }
})

const addItemsSchema = z.object({
  scheduleId: z.string().uuid(),
  items: z.array(z.object({
    startAt: z.string(),
    endAt: z.string(),
    title: z.string().min(2),
    location: z.string().optional(),
    notes: z.string().optional()
  })).min(1)
})

export const addScheduleItemsAction = action.schema(addItemsSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }
  const rows = parsedInput.items.map(i => ({
    schedule_id: parsedInput.scheduleId,
    start_at: i.startAt,
    end_at: i.endAt,
    title: i.title,
    location: i.location ?? null,
    notes: i.notes ?? null
  }))
  const { error } = await supabase.from('schedule_items').insert(rows)
  if (error) return { ok: false, error: 'create_failed' }
  return { ok: true }
})


