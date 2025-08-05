import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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
    const { content } = body

    // Verify the user is a member of the group
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!group || group.members.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized to send messages in this group" },
        { status: 403 }
      )
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        groupId: params.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify the user is a member of the group
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!group || group.members.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized to view messages in this group" },
        { status: 403 }
      )
    }

    // Get messages for the group
    const messages = await prisma.message.findMany({
      where: {
        groupId: params.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
} 