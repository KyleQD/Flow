import { NextRequest, NextResponse } from 'next/server'

// Stub endpoint for travel coordination used by hooks/use-travel-coordination.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'groups'

  const empty: any[] = []
  const map: Record<string, any> = {
    groups: empty,
    group_members: empty,
    flights: empty,
    flight_passengers: empty,
    transportation: empty,
    transportation_passengers: empty,
    hotel_assignments: empty,
    timeline: empty,
    analytics: [],
    utilization: []
  }

  return NextResponse.json({ success: true, data: map[type] ?? empty })
}

export async function POST() {
  return NextResponse.json({ success: true, message: 'Travel coordination stub' })
}

export async function PUT() {
  return NextResponse.json({ success: true, message: 'Travel coordination stub' })
}

export async function DELETE() {
  return NextResponse.json({ success: true, message: 'Travel coordination stub' })
}


