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
    const { eventId, role } = body

    // Get the application with user details
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Verify the user has permission to hire for this job
    const sessionUserId = (session.user as any).id
    if (!sessionUserId || application.job.userId !== sessionUserId) {
      return NextResponse.json(
        { error: "Unauthorized to hire for this job" },
        { status: 403 }
      )
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: {
        status: "accepted",
        eventId,
        role,
      },
    })

    // Create a staff member for the event with the hiring user's information
    const staff = await prisma.staff.create({
      data: {
        userId: application.userId,
        eventId,
        role,
        hiredById: sessionUserId, // Track who hired this staff member
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        hiredBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      application: updatedApplication, 
      staff,
      message: "Successfully hired applicant and added to event staff"
    })
  } catch (error) {
    console.error("Error hiring applicant:", error)
    return NextResponse.json(
      { error: "Failed to hire applicant" },
      { status: 500 }
    )
  }
} 