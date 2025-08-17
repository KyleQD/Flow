'use server'

import { z } from 'zod'
import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ratelimit } from '@/lib/utils/rate-limit'

const action = createSafeActionClient()

const createOrgSchema = z.object({
  name: z.string().min(2).max(80)
})

export const createOrganizationAction = action(createOrgSchema, async ({ name }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)

  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, slug, created_by: user.user.id })
    .select('id, slug')
    .single()

  if (error) return { ok: false, error: 'create_failed' }

  // Add creator as owner
  await supabase
    .from('org_members')
    .insert({ org_id: data.id, user_id: user.user.id, role: 'owner', invited_by: user.user.id })

  revalidatePath('/dashboard')
  return { ok: true, orgId: data.id, slug: data.slug }
})

const inviteSchema = z.object({
  orgId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['owner','admin','production','finance'])
})

export const createInviteAction = action(inviteSchema, async ({ orgId, email, role }) => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return { ok: false, error: 'not_authenticated' }

  // Rate limit invites per user
  const { success } = await ratelimit.limit(`invite_${user.user.id}`)
  if (!success) return { ok: false, error: 'rate_limited' }

  const token = crypto.randomUUID().replace(/-/g, '')
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7d

  const { error } = await supabase
    .from('org_invites')
    .insert({ org_id: orgId, email, role, token, expires_at: expires.toISOString(), created_by: user.user.id })

  if (error) return { ok: false, error: 'invite_failed' }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tourify.live'
  const acceptUrl = `${site}/orgs/invite/accept?token=${token}`

  const from = process.env.EMAIL_FROM
  const sendgridKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_PROVIDER_API_KEY
  if (!from || !sendgridKey) return { ok: true } // silently succeed without email in dev

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendgridKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }], subject: 'You have been invited to an organization on Tourify' }],
      from: { email: from, name: 'Tourify' },
      content: [{ type: 'text/html', value: `<p>You have been invited as <b>${role}</b>.</p><p>Accept here: <a href="${acceptUrl}">${acceptUrl}</a></p>` }]
    })
  })
  if (!res.ok) return { ok: false, error: 'email_failed' }

  return { ok: true }
})


