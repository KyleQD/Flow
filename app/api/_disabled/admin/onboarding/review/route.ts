import { NextRequest, NextResponse } from "next/server"
import { EnhancedOnboardingService } from "@/lib/services/enhanced-onboarding.service"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

const reviewSchema = z.object({
  candidate_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  review_notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { candidate_id, action, review_notes } = reviewSchema.parse(body)

    const result = await EnhancedOnboardingService.reviewCandidate(
      candidate_id,
      action,
      review_notes,
      user.id
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error reviewing candidate:", error)
    return NextResponse.json(
      { error: error.message || "Failed to review candidate" },
      { status: 500 }
    )
  }
} 