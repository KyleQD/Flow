import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the layout to find the image path
    const layout = await prisma.venueLayout.findUnique({
      where: {
        id: params.layoutId,
        eventId: params.id,
      },
    })

    if (!layout) {
      return NextResponse.json(
        { error: "Layout not found" },
        { status: 404 }
      )
    }

    // Delete the image file
    const imagePath = join(process.cwd(), "public", layout.imageUrl)
    try {
      await unlink(imagePath)
    } catch (error) {
      console.error("Error deleting image file:", error)
    }

    // Delete the layout from the database
    await prisma.venueLayout.delete({
      where: {
        id: params.layoutId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting venue layout:", error)
    return NextResponse.json(
      { error: "Failed to delete venue layout" },
      { status: 500 }
    )
  }
} 