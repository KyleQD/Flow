import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, contentType, action, metadata } = body

    if (!contentId || !contentType || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[Engagement API] Tracking:', { userId: user.id, contentId, contentType, action })

    // Track the engagement event
    const { data: engagement, error } = await supabase
      .from('content_engagement')
      .insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        action: action, // 'view', 'like', 'share', 'bookmark', 'follow'
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[Engagement API] Error tracking engagement:', error)
      return NextResponse.json({ error: 'Failed to track engagement' }, { status: 500 })
    }

    // Update content engagement counts if needed
    if (action === 'like' || action === 'share' || action === 'view') {
      await updateContentEngagementCounts(contentId, contentType, action, supabase)
    }

    return NextResponse.json({
      success: true,
      engagement
    })

  } catch (error) {
    console.error('[Engagement API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateContentEngagementCounts(
  contentId: string, 
  contentType: string, 
  action: string, 
  supabase: any
) {
  try {
    // This would update engagement counts in the respective content tables
    // For now, we'll just log the action
    console.log(`[Engagement API] Updating ${contentType} ${contentId} ${action} count`)
    
    // In a real implementation, you would:
    // 1. Update the specific content table (artist_music, events, posts, etc.)
    // 2. Increment the appropriate engagement counter
    // 3. Update the content's relevance score based on engagement
    
  } catch (error) {
    console.error('[Engagement API] Error updating engagement counts:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')
    const contentType = searchParams.get('contentType')

    if (!contentId || !contentType) {
      return NextResponse.json({ error: 'Missing contentId or contentType' }, { status: 400 })
    }

    // Get user's engagement with this content
    const { data: engagement } = await supabase
      .from('content_engagement')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      engagement: engagement || []
    })

  } catch (error) {
    console.error('[Engagement API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 