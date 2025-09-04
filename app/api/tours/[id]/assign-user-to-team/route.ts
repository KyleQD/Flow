import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, teamId } = await request.json()

    if (!userId || !teamId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the id from params
    const { id } = await params

    // Verify tour exists and user has access
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, created_by')
      .eq('id', id)
      .single()

    if (tourError || !tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    // Check if user has permission to manage this tour
    if (tour.created_by !== user.id) {
      // You might want to add additional permission checks here
      // For now, only tour creator can assign users
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify team exists
    const { data: team, error: teamError } = await supabase
      .from('tour_teams')
      .select('id')
      .eq('id', teamId)
      .eq('tour_id', id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Verify user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already assigned to this team
    const { data: existingAssignment, error: checkError } = await supabase
      .from('tour_team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (existingAssignment) {
      return NextResponse.json({ error: 'User is already assigned to this team' }, { status: 400 })
    }

    // Add user to team
    const { data: assignment, error: assignError } = await supabase
      .from('tour_team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        tour_id: id,
        assigned_by: user.id,
        assigned_at: new Date().toISOString()
      })
      .select()
      .single()

    if (assignError) {
      console.error('Error assigning user to team:', assignError)
      return NextResponse.json({ error: 'Failed to assign user to team' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        team_id: teamId,
        user_id: userId,
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name
        }
      }
    })

  } catch (error) {
    console.error('Error in assign-user-to-team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
