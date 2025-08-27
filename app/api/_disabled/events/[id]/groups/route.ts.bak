import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/supabase/auth"

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
    const { name, description, memberIds } = body

    // Verify the user has permission to create groups for this event
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        staff: {
          where: {
            userId: (session.user as any).id,
          },
        },
      },
    })

    if (!event || event.staff.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized to create groups for this event" },
        { status: 403 }
      )
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        name,
        description,
        eventId: params.id,
        members: {
          create: [
            // Add the creator as an admin
            {
              userId: (session.user as any).id,
              role: "admin",
            },
            // Add the selected members
            ...memberIds.map((userId: string) => ({
              userId,
              role: "member",
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
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

    return NextResponse.json(group)
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    )
  }
}

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

    // Get all groups for this event that the user is a member of
    const groups = await prisma.group.findMany({
      where: {
        eventId: params.id,
        members: {
          some: {
            userId: (session.user as any).id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
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

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    )
  }
} 