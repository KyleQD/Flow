import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const updateStatusSchema = z.object({
  candidate_id: z.string().uuid(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected', 'approved'])
})

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)

    // Update the candidate status
    const { data: candidate, error } = await supabase
      .from('staff_onboarding_candidates')
      .update({
        status: validatedData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.candidate_id)
      .select()
      .single()

    if (error) {
      console.error("Error updating candidate status:", error)
      return NextResponse.json(
        { error: "Failed to update candidate status" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: candidate 
    })
  } catch (error: any) {
    console.error("Error updating candidate status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update candidate status" },
      { status: 500 }
    )
  }
} 