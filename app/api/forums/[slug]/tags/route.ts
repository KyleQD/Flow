import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    
    // First find the forum by slug
    const { data: forum, error: forumError } = await supabase
      .from('forums_v2')
      .select('id')
      .eq('slug', params.slug)
      .single()
      
    if (forumError || !forum) {
      return NextResponse.json(
        { error: 'Forum not found' },
        { status: 404 }
      )
    }
    
    // Then get the tags for that forum
    const { data: tags, error } = await supabase
      .from('forum_tags')
      .select(`
        id,
        slug,
        label,
        color
      `)
      .eq('forum_id', forum.id)
      .order('label')

    if (error) {
      console.error('Forum tags fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch forum tags' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tags: tags || []
    })
  } catch (error) {
    console.error('Forum tags API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
