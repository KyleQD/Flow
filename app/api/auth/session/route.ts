import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // In Next.js 15, we avoid using cookies() and headers() APIs 
    // which require await and cause issues with Supabase
    return NextResponse.json({
      message: "Session verification should be handled client-side",
      serverInfo: {
        time: new Date().toISOString(),
        info: "Due to Next.js 15 API changes, server-side session verification is disabled",
        note: "Use client-side authentication checks instead"
      }
    })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 