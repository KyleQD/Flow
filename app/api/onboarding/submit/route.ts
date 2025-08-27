// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { EnhancedOnboardingService } from "@/lib/services/enhanced-onboarding.service"
import { getUserById } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserById("user") // This needs to be properly implemented
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