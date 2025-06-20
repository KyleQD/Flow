import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"

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

    const layouts = await prisma.venueLayout.findMany({
      where: { eventId: params.id },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(layouts)
  } catch (error) {
    console.error("Error fetching venue layouts:", error)
    return NextResponse.json(
      { error: "Failed to fetch venue layouts" },
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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Save file to public directory
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`
    const path = join(process.cwd(), "public", "uploads", "layouts", fileName)
    await writeFile(path, buffer)

    const layout = await prisma.venueLayout.create({
      data: {
        title,
        description,
        imageUrl: `/uploads/layouts/${fileName}`,
        eventId: params.id,
      },
    })

    return NextResponse.json(layout)
  } catch (error) {
    console.error("Error creating venue layout:", error)
    return NextResponse.json(
      { error: "Failed to create venue layout" },
      { status: 500 }
    )
  }
} 