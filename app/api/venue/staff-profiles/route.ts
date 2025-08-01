import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { EnhancedStaffProfilesService } from "@/lib/services/enhanced-staff-profiles.service"

const supabase = createServiceRoleClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venueId')

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    const staffProfiles = await EnhancedStaffProfilesService.getStaffProfiles(venueId)
    
    return NextResponse.json({
      success: true,
      data: staffProfiles
    })
  } catch (error) {
    console.error('Error fetching staff profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff profiles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { venueId, ...staffData } = body

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    const newStaff = await EnhancedStaffProfilesService.createStaffProfile({
      venue_id: venueId,
      ...staffData
    })

    return NextResponse.json({
      success: true,
      data: newStaff
    })
  } catch (error) {
    console.error('Error creating staff profile:', error)
    return NextResponse.json(
      { error: 'Failed to create staff profile' },
      { status: 500 }
    )
  }
} 