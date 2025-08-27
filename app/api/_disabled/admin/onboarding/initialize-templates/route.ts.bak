import { NextRequest, NextResponse } from "next/server"
import { OnboardingTemplatesService } from "@/lib/services/onboarding-templates.service"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

const initializeSchema = z.object({
  venue_id: z.string().uuid()
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { venue_id } = initializeSchema.parse(body)

    await OnboardingTemplatesService.initializeDefaultTemplates(venue_id)

    return NextResponse.json({ 
      success: true, 
      message: "Default onboarding templates initialized successfully" 
    })
  } catch (error: any) {
    console.error("Error initializing default templates:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initialize templates" },
      { status: 500 }
    )
  }
} 