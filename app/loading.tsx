import { BrandLoadingScreen } from '@/components/ui/brand-loading-screen'

// =============================================================================
// NEXT.JS APP ROUTER LOADING PAGE
// This will be shown automatically during route transitions
// =============================================================================

export default function Loading() {
  return (
    <BrandLoadingScreen
      variant="glow"
      message="Loading page..."
      subMessage="Gathering the latest information for you"
      fullScreen={false}
    />
  )
}