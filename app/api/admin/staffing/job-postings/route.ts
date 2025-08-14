import { NextResponse } from 'next/server'
import { createJobPosting, type CreateJobPostingInput } from '@/app/actions/staffing/create-job-posting'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateJobPostingInput>
    const result = await createJobPosting(body as CreateJobPostingInput)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.error === 'Forbidden' ? 403 : 400 })
    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


