import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

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

    const contacts = await prisma.emergencyContact.findMany({
      where: { eventId: params.id },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching emergency contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch emergency contacts" },
      { status: 500 }
    )
  }
}

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
    const { name, role, phone, email } = body

    const contact = await prisma.emergencyContact.create({
      data: {
        name,
        role,
        phone,
        email,
        eventId: params.id,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error creating emergency contact:", error)
    return NextResponse.json(
      { error: "Failed to create emergency contact" },
      { status: 500 }
    )
  }
} 