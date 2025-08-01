import { NextRequest, NextResponse } from "next/server"
import { EnhancedOnboardingService } from "@/lib/services/enhanced-onboarding.service"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 })
    }

    const candidates = await EnhancedOnboardingService.getOnboardingCandidates(venueId)
    const stats = await EnhancedOnboardingService.getOnboardingStats(venueId)

    return NextResponse.json({ 
      success: true, 
      data: { candidates, stats } 
    })
  } catch (error: any) {
    console.error("Error fetching onboarding candidates:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch candidates" },
      { status: 500 }
    )
  }
} 