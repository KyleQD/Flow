import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')
    const type = searchParams.get('type') // 'members' or 'communications'

    if (!venueId) {
      return NextResponse.json(
        { success: false, error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    let data
    if (type === 'communications') {
      data = await AdminOnboardingStaffService.getTeamCommunications(venueId)
    } else {
      data = await AdminOnboardingStaffService.getStaffMembers(venueId)
    }

    return NextResponse.json({
      success: true,
      data,
      type: type || 'members'
    })
  } catch (error) {
    console.error('❌ [Staff API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch staff data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { venue_id, ...communicationData } = body

    if (!venue_id) {
      return NextResponse.json(
        { success: false, error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    const communication = await AdminOnboardingStaffService.sendTeamCommunication(venue_id, communicationData)

    return NextResponse.json({
      success: true,
      data: communication
    })
  } catch (error) {
    console.error('❌ [Staff API] Error sending communication:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send team communication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 