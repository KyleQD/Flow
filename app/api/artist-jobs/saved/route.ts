import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock saved jobs for now until database migration is run
    return NextResponse.json({
      success: true,
      data: []
    })
  } catch (error) {
    console.error('Error in GET /api/artist-jobs/saved:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch saved jobs'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Return mock response for now until database migration is run
    return NextResponse.json({
      success: false,
      error: 'Job save/unsave not yet implemented - please run database migration first'
    }, { status: 501 })
  } catch (error) {
    console.error('Error in POST /api/artist-jobs/saved:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save/unsave job'
      },
      { status: 500 }
    )
  }
} 