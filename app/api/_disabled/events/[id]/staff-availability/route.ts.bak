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

    const availability = await prisma.schedule.findMany({
      where: { eventId: params.id },
      include: {
        staff: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Error fetching staff availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff availability" },
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
    const { staffId, startTime, endTime, status } = body

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

    const availability = await prisma.schedule.create({
      data: {
        title: "Availability",
        description: status ?? null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: null,
        eventId: params.id,
        staffId,
      },
      include: {
        staff: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Error creating staff availability:", error)
    return NextResponse.json(
      { error: "Failed to create staff availability" },
      { status: 500 }
    )
  }
} 