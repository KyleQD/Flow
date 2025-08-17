import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const username = new URL(req.url).searchParams.get('u')?.trim().toLowerCase()
  if (!username) return NextResponse.json({ ok: false, error: 'missing' }, { status: 400 })
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .maybeSingle()
  return NextResponse.json({ ok: true, available: !data })
}


