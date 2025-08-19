import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateApiRequest(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = auth
    const hasAdmin = await checkAdminPermissions(user)
    if (!hasAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url = new URL(req.url)
    const tourId = url.searchParams.get('tour_id')
    if (!tourId) return NextResponse.json({ error: 'tour_id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('tour_artists')
      .select('*')
      .eq('tour_id', tourId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const { tour_id, artist_user_id, artist_name, role } = body
    if (!tour_id || (!artist_user_id && !artist_name)) {
      return NextResponse.json({ error: 'tour_id and (artist_user_id or artist_name) required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tour_artists')
      .insert({ tour_id, artist_user_id: artist_user_id ?? null, artist_name: artist_name ?? null, role: role ?? null })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase
      .from('tour_artists')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}


