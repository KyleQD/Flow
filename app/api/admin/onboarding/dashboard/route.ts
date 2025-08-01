import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    // Get basic stats
    const { data: candidates, error: candidatesError } = await supabase
      .from('staff_onboarding_candidates')
      .select('status, stage, created_at, updated_at, name, position')
      .eq('venue_id', venueId)

    if (candidatesError) throw candidatesError

    // Calculate stats
    const stats = {
      total: candidates?.length || 0,
      pending: candidates?.filter(c => c.status === 'pending').length || 0,
      in_progress: candidates?.filter(c => c.status === 'in_progress').length || 0,
      completed: candidates?.filter(c => c.status === 'completed').length || 0,
      approved: candidates?.filter(c => c.status === 'approved').length || 0,
      rejected: candidates?.filter(c => c.status === 'rejected').length || 0,
      average_progress: calculateAverageProgress(candidates || []),
      recent_activity: await getRecentActivity(venueId),
      top_performers: await getTopPerformers(venueId)
    }

    return NextResponse.json({ 
      success: true, 
      data: stats 
    })

  } catch (error) {
    console.error('❌ [Onboarding Dashboard API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

function calculateAverageProgress(candidates: any[]): number {
  if (candidates.length === 0) return 0

  const progressMap = {
    'pending': 0,
    'in_progress': 50,
    'completed': 80,
    'approved': 100,
    'rejected': 0
  }

  const totalProgress = candidates.reduce((sum, candidate) => {
    return sum + (progressMap[candidate.status as keyof typeof progressMap] || 0)
  }, 0)

  return Math.round(totalProgress / candidates.length)
}

async function getRecentActivity(venueId: string) {
  try {
    // Get recent candidates with their activities
    const { data: candidates, error } = await supabase
      .from('staff_onboarding_candidates')
      .select(`
        id,
        name,
        position,
        status,
        stage,
        created_at,
        updated_at
      `)
      .eq('venue_id', venueId)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return candidates?.map(candidate => {
      let type: 'invitation' | 'completion' | 'approval' | 'rejection' = 'invitation'
      
      if (candidate.status === 'approved') type = 'approval'
      else if (candidate.status === 'rejected') type = 'rejection'
      else if (candidate.status === 'completed') type = 'completion'

      return {
        id: candidate.id,
        type,
        candidate_name: candidate.name || 'Unknown',
        position: candidate.position || 'Unknown',
        timestamp: candidate.updated_at || candidate.created_at
      }
    }) || []

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

async function getTopPerformers(venueId: string) {
  try {
    // Get candidates who have completed onboarding
    const { data: candidates, error } = await supabase
      .from('staff_onboarding_candidates')
      .select(`
        id,
        name,
        position,
        status,
        created_at,
        updated_at
      `)
      .eq('venue_id', venueId)
      .in('status', ['completed', 'approved'])
      .order('updated_at', { ascending: false })
      .limit(5)

    if (error) throw error

    return candidates?.map(candidate => {
      const created = new Date(candidate.created_at)
      const updated = new Date(candidate.updated_at)
      const daysDiff = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: candidate.id,
        name: candidate.name || 'Unknown',
        position: candidate.position || 'Unknown',
        completion_rate: candidate.status === 'approved' ? 100 : 80,
        avg_time: daysDiff
      }
    }) || []

  } catch (error) {
    console.error('Error fetching top performers:', error)
    return []
  }
} 