import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [Test API] Received job posting request')
    
    const body = await request.json()
    const { venue_id, ...jobData } = body

    console.log('🧪 [Test API] Venue ID:', venue_id)
    console.log('🧪 [Test API] Job data:', jobData)

    if (!venue_id) {
      return NextResponse.json(
        { success: false, error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    // For testing, we'll create a mock job posting without authentication
    const mockJobPosting = {
      id: `test-job-${Date.now()}`,
      venue_id: venue_id,
      created_by: 'test-user',
      ...jobData,
      number_of_positions: jobData.number_of_positions || 1,
      status: 'draft',
      applications_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('✅ [Test API] Mock job posting created successfully:', mockJobPosting)

    return NextResponse.json({
      success: true,
      data: mockJobPosting
    })
  } catch (error) {
    console.error('❌ [Test API] Error creating job posting:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create job posting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 