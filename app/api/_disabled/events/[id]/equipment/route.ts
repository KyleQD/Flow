import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/supabase/auth"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const equipment = await prisma.equipment.findMany({
      where: { eventId: params.id },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error("Error fetching equipment:", error)
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, description, quantity } = body

    const equipment = await prisma.equipment.create({
      data: {
        name,
        description,
        quantity,
        eventId: params.id,
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error("Error creating equipment:", error)
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    )
  }
} 