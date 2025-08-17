import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'missing_token' }, { status: 400 })
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { data: invite } = await supabase
    .from('org_invites')
    .select('id, org_id, role, expires_at, accepted_at')
    .eq('token', token)
    .maybeSingle()

  if (!invite) return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
  if (invite.accepted_at) return NextResponse.json({ error: 'already_accepted' }, { status: 400 })
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'expired' }, { status: 400 })

  await supabase.from('org_members').insert({ org_id: invite.org_id, user_id: user.user.id, role: invite.role, invited_by: user.user.id })
  await supabase.from('org_invites').update({ accepted_at: new Date().toISOString(), accepted_by: user.user.id }).eq('id', invite.id)
  return NextResponse.json({ ok: true })
}


