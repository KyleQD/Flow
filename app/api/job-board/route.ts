import { NextRequest, NextResponse } from 'next/server'
import { JobBoardService } from '@/lib/services/job-board.service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      location: searchParams.get('location') || undefined,
      department: searchParams.get('department') || undefined,
      employment_type: searchParams.get('employment_type') || undefined,
      experience_level: searchParams.get('experience_level') || undefined,
      remote: searchParams.get('remote') ? searchParams.get('remote') === 'true' : undefined,
      urgent: searchParams.get('urgent') ? searchParams.get('urgent') === 'true' : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined,
      organization_id: searchParams.get('organization_id') || undefined,
      created_by: searchParams.get('created_by') || undefined,
    }

    const jobs = await JobBoardService.getJobBoardPostings(filters)

    return NextResponse.json({ success: true, data: jobs })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch job board' },
      { status: 500 }
    )
  }
}


