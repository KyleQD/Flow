import { NextRequest, NextResponse } from 'next/server'

// Stub rentals endpoint to satisfy hooks/use-rentals.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'agreements'

  if (type === 'clients') return NextResponse.json({ clients: [], total: 0 })
  if (type === 'agreements') return NextResponse.json({ agreements: [], total: 0 })
  if (type === 'analytics') return NextResponse.json({ analytics: [] })
  if (type === 'utilization') return NextResponse.json({ utilization: [] })
  return NextResponse.json({})
}

export async function POST() {
  return NextResponse.json({ success: true })
}

export async function PUT() {
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  return NextResponse.json({ success: true })
}


