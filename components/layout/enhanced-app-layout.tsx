"use client"

import { ReactNode, useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/role-based-auth'
import { usePlatformStatus } from '@/hooks/use-platform-sync'
import { BrandLoadingScreen } from '@/components/ui/brand-loading-screen'
import { AppLayout } from './app-layout'

// =============================================================================
// ENHANCED APP LAYOUT WITH BRAND LOADING
// =============================================================================

interface EnhancedAppLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  className?: string
  fullWidth?: boolean
  noHeader?: boolean
  noPadding?: boolean
  // Loading customization
  loadingVariant?: 'glow' | 'pulse' | 'rotate' | 'particles' | 'waves' | 'orbit' | 'breathe'
  customLogo?: string
  showInitialLoading?: boolean
  initialLoadingDuration?: number
}

export function EnhancedAppLayout({
  children,
  loadingVariant = 'glow',
  customLogo,
  showInitialLoading = true,
  initialLoadingDuration = 2000,
  ...layoutProps
}: EnhancedAppLayoutProps) {
  const { user, isLoading: authLoading } = useAuth()
  const { isConnected } = usePlatformStatus()
  const [showBrandLoading, setShowBrandLoading] = useState(showInitialLoading)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // =============================================================================
  // INITIAL LOADING SIMULATION
  // =============================================================================

  useEffect(() => {
    if (!showInitialLoading || !showBrandLoading) return

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          setShowBrandLoading(false)
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 8 + 2 // Random progress between 2-10% per tick
      })
    }, initialLoadingDuration / 50) // 50 ticks over the duration

    return () => clearInterval(interval)
  }, [showInitialLoading, showBrandLoading, initialLoadingDuration])

  // =============================================================================
  // LOADING PHASES
  // =============================================================================

  const getLoadingMessage = () => {
    if (loadingProgress < 30) return 'Initializing Tourify...'
    if (loadingProgress < 60) return 'Loading your workspace...'
    if (loadingProgress < 90) return 'Preparing your dashboard...'
    return 'Almost ready!'
  }

  const getLoadingSubMessage = () => {
    if (loadingProgress < 30) return 'Starting up your tour management platform'
    if (loadingProgress < 60) return 'Gathering your tours, events, and team data'
    if (loadingProgress < 90) return 'Setting up your personalized experience'
    return 'Welcome back to Tourify!'
  }

  // =============================================================================
  // LOADING STATES
  // =============================================================================

  // Show brand loading screen during initial load
  if (showBrandLoading) {
    return (
      <BrandLoadingScreen
        variant={loadingVariant}
        logoSrc={customLogo}
        message={getLoadingMessage()}
        subMessage={getLoadingSubMessage()}
        showProgress={true}
        progress={loadingProgress}
        fullScreen={true}
        onComplete={() => setShowBrandLoading(false)}
      />
    )
  }

  // Show auth loading (simpler loading for subsequent loads)
  if (authLoading) {
    return (
      <BrandLoadingScreen
        variant="pulse"
        logoSrc={customLogo}
        message="Verifying your access..."
        subMessage="Please wait while we confirm your permissions"
        fullScreen={true}
      />
    )
  }

  // Show connection loading if disconnected
  if (!isConnected) {
    return (
      <BrandLoadingScreen
        variant="waves"
        logoSrc={customLogo}
        message="Connecting to server..."
        subMessage="Establishing secure connection to Tourify"
        fullScreen={true}
      />
    )
  }

  // Show main app layout
  return (
    <AppLayout {...layoutProps}>
      {children}
    </AppLayout>
  )
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Basic usage with default glow animation
<EnhancedAppLayout>
  <YourAppContent />
</EnhancedAppLayout>

// Custom animation and logo
<EnhancedAppLayout
  loadingVariant="particles"
  customLogo="/your-logo.png"
  initialLoadingDuration={3000}
>
  <YourAppContent />
</EnhancedAppLayout>

// Skip initial loading for faster subsequent loads
<EnhancedAppLayout
  showInitialLoading={false}
  loadingVariant="pulse"
>
  <YourAppContent />
</EnhancedAppLayout>
*/