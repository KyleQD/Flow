import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(req.url)
    const tourId = url.searchParams.get('tour_id')
    if (!tourId) return NextResponse.json({ error: 'tour_id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('tour_vendors')
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
    const { tour_id, vendor_account_id, vendor_name, service_type, contact } = body
    if (!tour_id || (!vendor_account_id && !vendor_name)) {
      return NextResponse.json({ error: 'tour_id and (vendor_account_id or vendor_name) required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tour_vendors')
      .insert({ tour_id, vendor_account_id: vendor_account_id ?? null, vendor_name: vendor_name ?? null, service_type: service_type ?? null, contact: contact ?? null })
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

    const { error } = await supabase.from('tour_vendors').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 400 })
  }
}


