import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: forums, error } = await supabase
      .from('forums_v2')
      .select(`
        id,
        slug,
        title,
        description,
        subscribers_count,
        threads_count,
        created_at
      `)
      .eq('kind', 'public')
      .eq('is_archived', false)
      .order('subscribers_count', { ascending: false })

    if (error) {
      console.error('Forums fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch forums' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      forums: forums || []
    })
  } catch (error) {
    console.error('Forums API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}