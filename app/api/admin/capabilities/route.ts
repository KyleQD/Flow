import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCapabilities } from '@/lib/services/capabilities'

const schema = z.object({ entityType: z.string(), entityId: z.string().uuid() })

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json())
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const caps = await getCapabilities({ userId: user.id, entityType: input.entityType, entityId: input.entityId })
    return NextResponse.json({ capabilities: caps })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}


