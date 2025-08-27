import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/supabase/auth"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; skillId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify skill belongs to staff in the event
    const skill = await prisma.staffSkill.findFirst({
      where: {
        id: params.skillId,
        staff: {
          eventId: params.id,
        },
      },
    })

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found in event" },
        { status: 404 }
      )
    }

    await prisma.staffSkill.delete({
      where: {
        id: params.skillId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting staff skill:", error)
    return NextResponse.json(
      { error: "Failed to delete staff skill" },
      { status: 500 }
    )
  }
} 