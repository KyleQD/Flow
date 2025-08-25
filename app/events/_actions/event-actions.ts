'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const action = createSafeActionClient()

const createCalendarSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(2).max(80),
  venueId: z.string().uuid().optional(),
  color: z.string().optional()
})

export const createCalendarAction = action.schema(createCalendarSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('calendars')
    .insert({ org_id: parsedInput.orgId, venue_id: parsedInput.venueId ?? null, name: parsedInput.name, color: parsedInput.color ?? null })
    .select('id')
    .single()

  if (error) return { ok: false, error: 'create_failed' }
  revalidatePath('/calendar')
  return { ok: true, calendarId: data.id }
})

const createEventSchema = z.object({
  orgId: z.string().uuid(),
  title: z.string().min(3).max(120),
  startAt: z.string(),
  endAt: z.string(),
  timezone: z.string().default('UTC'),
  venueId: z.string().uuid().optional()
})

export const createEventAction = action.schema(createEventSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const slug = parsedInput.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)

  const { data, error } = await supabase
    .from('events_v2')
    .insert({
      org_id: parsedInput.orgId,
      venue_id: parsedInput.venueId ?? null,
      title: parsedInput.title,
      slug,
      status: 'inquiry',
      start_at: parsedInput.startAt,
      end_at: parsedInput.endAt,
      timezone: parsedInput.timezone,
      created_by: user.user.id
    })
    .select('id, slug')
    .single()

  if (error) return { ok: false, error: 'create_failed' }
  revalidatePath('/events')
  return { ok: true, eventId: data.id, slug: data.slug }
})

const updateStatusSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(['inquiry','hold','offer','confirmed','advancing','onsite','settled','archived'])
})

export const updateEventStatusAction = action.schema(updateStatusSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase
    .from('events_v2')
    .update({ status: parsedInput.status })
    .eq('id', parsedInput.eventId)

  if (error) return { ok: false, error: 'update_failed' }
  revalidatePath(`/events/${parsedInput.eventId}`)
  return { ok: true }
})

const createHoldSchema = z.object({
  orgId: z.string().uuid(),
  calendarId: z.string().uuid(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.enum(['soft','hard','confirmed']).default('soft'),
  note: z.string().optional()
})

export const createHoldAction = action.schema(createHoldSchema).action(async ({ parsedInput }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase
    .from('holds')
    .insert({
      org_id: parsedInput.orgId,
      calendar_id: parsedInput.calendarId,
      start_at: parsedInput.startAt,
      end_at: parsedInput.endAt,
      status: parsedInput.status,
      note: parsedInput.note ?? null,
      created_by: user.user.id
    })

  if (error) return { ok: false, error: 'create_failed' }
  revalidatePath('/calendar')
  return { ok: true }
})


