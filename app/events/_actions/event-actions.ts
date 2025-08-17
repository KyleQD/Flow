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

export const createCalendarAction = action(createCalendarSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('calendars')
    .insert({ org_id: input.orgId, venue_id: input.venueId ?? null, name: input.name, color: input.color ?? null })
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

export const createEventAction = action(createEventSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)

  const { data, error } = await supabase
    .from('events_v2')
    .insert({
      org_id: input.orgId,
      venue_id: input.venueId ?? null,
      title: input.title,
      slug,
      status: 'inquiry',
      start_at: input.startAt,
      end_at: input.endAt,
      timezone: input.timezone,
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

export const updateEventStatusAction = action(updateStatusSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase
    .from('events_v2')
    .update({ status: input.status })
    .eq('id', input.eventId)

  if (error) return { ok: false, error: 'update_failed' }
  revalidatePath(`/events/${input.eventId}`)
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

export const createHoldAction = action(createHoldSchema, async (input) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase
    .from('holds')
    .insert({
      org_id: input.orgId,
      calendar_id: input.calendarId,
      start_at: input.startAt,
      end_at: input.endAt,
      status: input.status,
      note: input.note ?? null,
      created_by: user.user.id
    })

  if (error) return { ok: false, error: 'create_failed' }
  revalidatePath('/calendar')
  return { ok: true }
})


