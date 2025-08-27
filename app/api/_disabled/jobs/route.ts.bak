import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/supabase/auth"

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        questions: true,
        documents: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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
      where: { id: (session.user as any).id },
      select: { isPro: true }
    })

    if (!user?.isPro) {
      return NextResponse.json(
        { error: "Pro account required to post jobs" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, budget, location, questions, documents } = body

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget,
        location,
        userId: (session.user as any).id,
        questions: {
          create: questions.map((q: string) => ({
            text: q,
          })),
        },
        documents: {
          create: documents.map((d: string) => ({
            type: d,
          })),
        },
      },
      include: {
        questions: true,
        documents: true,
      },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    )
  }
} 