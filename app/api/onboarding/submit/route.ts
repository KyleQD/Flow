import { NextRequest, NextResponse } from "next/server"
import { EnhancedOnboardingService } from "@/lib/services/enhanced-onboarding.service"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = await EnhancedOnboardingService.submitOnboardingResponses(body)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error submitting onboarding responses:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit onboarding" },
      { status: 500 }
    )
  }
} 