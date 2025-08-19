import { NextResponse } from 'next/server'

// Minimal placeholder venues endpoint for selectors
export async function GET() {
  try {
    // TODO: replace with Supabase query when venues table is ready
    const venues = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'Demo Venue A', city: 'Los Angeles', state: 'CA' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'Demo Venue B', city: 'San Francisco', state: 'CA' },
    ]
    return NextResponse.json({ venues })
  } catch (error: any) {
    return NextResponse.json({ venues: [] }, { status: 200 })
  }
}


