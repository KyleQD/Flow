import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, supabase } = auth

  const body = await request.json().catch(() => null)
  const { endorsed_id, skill } = body || {}
  if (!endorsed_id || !skill) return NextResponse.json({ error: 'Missing endorsed_id or skill' }, { status: 400 })
  if (endorsed_id === user.id) return NextResponse.json({ error: 'Cannot endorse yourself' }, { status: 400 })

  const { error } = await supabase
    .from('skill_endorsements')
    .insert({ endorsed_id, endorser_id: user.id, skill })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, supabase } = auth
  const { searchParams } = new URL(request.url)
  const endorsed_id = searchParams.get('endorsed_id')
  const skill = searchParams.get('skill')
  if (!endorsed_id || !skill) return NextResponse.json({ error: 'Missing endorsed_id or skill' }, { status: 400 })

  const { error } = await supabase
    .from('skill_endorsements')
    .delete()
    .eq('endorser_id', user.id)
    .eq('endorsed_id', endorsed_id)
    .eq('skill', skill)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endorsed_id = searchParams.get('endorsed_id')
  if (!endorsed_id) return NextResponse.json({ error: 'Missing endorsed_id' }, { status: 400 })

  // Use service or anon client via API auth wrapper
  const auth = await authenticateApiRequest(request)
  const supabase = auth?.supabase || (await (await import('@/lib/supabase/server')).createClient())

  const { data, error } = await supabase
    .from('skill_endorsements')
    .select('endorser_id, skill, created_at')
    .eq('endorsed_id', endorsed_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ endorsements: data })
}


