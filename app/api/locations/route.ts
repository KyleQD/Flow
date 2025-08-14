import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

export const POST = withAuth(async (request: NextRequest, { supabase, user }) => {
  try {
    const body = await request.json()
    const { locationType, name, address, coordinates, meta } = body || {}
    if (!locationType || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // No strict permission scope here because Locations can be public catalog entries.
    // RLS on `locations` is currently open for select; inserts are allowed for authenticated users.
    const { data, error } = await supabase
      .from('locations')
      .insert({
        location_type: locationType,
        name,
        address: address ?? null,
        coordinates: coordinates ?? null,
        meta: meta ?? null
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ location: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create location' }, { status: 500 })
  }
})


