import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Team Members API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user, supabase } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the user's venue profile
    const { data: venueProfile, error: venueError } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (venueError || !venueProfile) {
      console.log('[Admin Team Members API] No venue profile found for user:', user.id)
      return NextResponse.json({ teamMembers: [] })
    }

    // Fetch crew members from venue_crew_members table
    const { data: crewMembers, error: crewError } = await supabase
      .from('venue_crew_members')
      .select(`
        id,
        name,
        email,
        phone,
        avatar_url,
        specialty as role,
        is_available as status
      `)
      .eq('venue_id', venueProfile.id)
      .eq('is_available', true)
      .order('name')

    if (crewError) {
      console.error('[Admin Team Members API] Error fetching crew members:', crewError)
    }

    // Fetch team members from venue_team_members table
    const { data: teamMembers, error: teamError } = await supabase
      .from('venue_team_members')
      .select(`
        id,
        name,
        email,
        phone,
        avatar_url,
        role,
        status
      `)
      .eq('venue_id', venueProfile.id)
      .eq('status', 'active')
      .order('name')

    if (teamError) {
      console.error('[Admin Team Members API] Error fetching team members:', teamError)
    }

    // Combine and format the results
    const allTeamMembers = [
      ...(crewMembers || []).map((member: any) => ({
        ...member,
        status: member.status ? 'active' : 'inactive'
      })),
      ...(teamMembers || [])
    ]

    console.log(`[Admin Team Members API] Returning ${allTeamMembers.length} team members`)

    return NextResponse.json({
      teamMembers: allTeamMembers
    })

  } catch (error) {
    console.error('[Admin Team Members API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 