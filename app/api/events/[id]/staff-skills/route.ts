import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

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

    const skills = await prisma.staffSkill.findMany({
      where: {
        staff: {
          eventId: params.id,
        },
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error("Error fetching staff skills:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff skills" },
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
    const { name, description, staffId } = body

    // Verify staff member belongs to the event
    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        eventId: params.id,
      },
    })

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found in event" },
        { status: 404 }
      )
    }

    const skill = await prisma.staffSkill.create({
      data: {
        name,
        description,
        staffId,
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(skill)
  } catch (error) {
    console.error("Error creating staff skill:", error)
    return NextResponse.json(
      { error: "Failed to create staff skill" },
      { status: 500 }
    )
  }
} 