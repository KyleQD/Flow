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

    // Check if user is pro
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true }
    })

    if (!user?.isPro) {
      return NextResponse.json(
        { error: "Pro account required to apply for jobs" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { answers, uploads } = body

    // Create the application
    const application = await prisma.application.create({
      data: {
        jobId: params.id,
        userId: session.user.id,
        answers: {
          create: answers.map((answer: { questionId: string; text: string }) => ({
            text: answer.text,
            questionId: answer.questionId,
          })),
        },
        uploads: {
          create: uploads.map((upload: { documentId: string; url: string }) => ({
            url: upload.url,
            documentId: upload.documentId,
          })),
        },
      },
      include: {
        answers: true,
        uploads: true,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
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

    // Check if user is pro
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true }
    })

    if (!user?.isPro) {
      return NextResponse.json(
        { error: "Pro account required to view applications" },
        { status: 403 }
      )
    }

    // Get all applications for this job
    const applications = await prisma.application.findMany({
      where: {
        jobId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
        uploads: {
          include: {
            document: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
} 