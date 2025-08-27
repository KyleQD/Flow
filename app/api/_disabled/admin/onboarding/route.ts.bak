import { NextRequest, NextResponse } from 'next/server'
import { AdminOnboardingService } from '@/lib/services/admin-onboarding.service'
import { authenticateApiRequest, checkAdminPermissions } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Onboarding API] GET request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'roles':
        const adminRoles = await AdminOnboardingService.getAdminRoles()
        return NextResponse.json({ roles: adminRoles })

      case 'steps':
        const onboardingSteps = await AdminOnboardingService.getOnboardingSteps()
        return NextResponse.json({ steps: onboardingSteps })

      case 'progress':
        const onboardingProgress = await AdminOnboardingService.getOnboardingProgress()
        return NextResponse.json({ progress: onboardingProgress })

      case 'status':
        const userOnboarding = await AdminOnboardingService.getUserOnboarding()
        const userNeedsOnboarding = await AdminOnboardingService.needsOnboarding()
        return NextResponse.json({ onboarding: userOnboarding, needsOnboarding: userNeedsOnboarding })

      case 'stats':
        const stats = await AdminOnboardingService.getOnboardingStats()
        return NextResponse.json({ stats })

      default:
        // Return all onboarding data
        const [roles, steps, progress, onboarding, needsOnboarding] = await Promise.all([
          AdminOnboardingService.getAdminRoles(),
          AdminOnboardingService.getOnboardingSteps(),
          AdminOnboardingService.getOnboardingProgress(),
          AdminOnboardingService.getUserOnboarding(),
          AdminOnboardingService.needsOnboarding()
        ])

        return NextResponse.json({
          roles,
          steps,
          progress,
          onboarding,
          needsOnboarding
        })
    }
  } catch (error) {
    console.error('[Admin Onboarding API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Onboarding API] POST request started')
    
    const authResult = await authenticateApiRequest(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    // Check admin permissions
    const hasAdminAccess = await checkAdminPermissions(user)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'start':
        const onboarding = await AdminOnboardingService.startOnboarding(data)
        return NextResponse.json({ 
          success: true, 
          onboarding,
          message: 'Onboarding started successfully'
        })

      case 'complete-step':
        const completed = await AdminOnboardingService.completeStep(data)
        return NextResponse.json({ 
          success: true, 
          completed,
          message: 'Step completed successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Admin Onboarding API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 