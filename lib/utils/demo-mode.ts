/**
 * Demo Mode Utilities
 * Handles demo-specific functionality and environment detection
 */

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
export const isDemoDataEnabled = process.env.NEXT_PUBLIC_DEMO_DATA_ENABLED === 'true'
export const isDemoBannerEnabled = process.env.NEXT_PUBLIC_DEMO_BANNER_ENABLED === 'true'

export interface DemoConfig {
  isDemoMode: boolean
  isDemoDataEnabled: boolean
  isDemoBannerEnabled: boolean
  sessionTimeout: number
  maxProfiles: number
  maxPosts: number
  maxEvents: number
  features: {
    realTimeChat: boolean
    aiRecommendations: boolean
    socialSharing: boolean
    healthMonitoring: boolean
    demoTour: boolean
    demoReset: boolean
  }
}

export function getDemoConfig(): DemoConfig {
  return {
    isDemoMode,
    isDemoDataEnabled,
    isDemoBannerEnabled,
    sessionTimeout: parseInt(process.env.DEMO_SESSION_TIMEOUT || '3600'),
    maxProfiles: parseInt(process.env.DEMO_MAX_PROFILES || '50'),
    maxPosts: parseInt(process.env.DEMO_MAX_POSTS || '100'),
    maxEvents: parseInt(process.env.DEMO_MAX_EVENTS || '20'),
    features: {
      realTimeChat: process.env.ENABLE_REAL_TIME_CHAT === 'true',
      aiRecommendations: process.env.ENABLE_AI_RECOMMENDATIONS === 'true',
      socialSharing: process.env.ENABLE_SOCIAL_SHARING === 'true',
      healthMonitoring: process.env.ENABLE_HEALTH_MONITORING === 'true',
      demoTour: process.env.ENABLE_DEMO_TOUR === 'true',
      demoReset: process.env.ENABLE_DEMO_RESET === 'true',
    }
  }
}

export function shouldUseDemoData(): boolean {
  return isDemoMode && isDemoDataEnabled
}

export function getDemoBannerMessage(): string {
  if (!isDemoMode) return ''
  
  return '🎵 Demo Mode - This is a demonstration of Tourify. All data is simulated and will reset periodically.'
}

export function getDemoLimitations(): string[] {
  if (!isDemoMode) return []
  
  return [
    'Data resets every hour',
    'Limited to 50 profiles',
    'File uploads disabled',
    'No real payments',
    'Demo session timeout'
  ]
}

export function createDemoUser(): any {
  return {
    id: `demo-${Date.now()}`,
    username: 'demo-user',
    fullName: 'Demo User',
    avatar: '/placeholder.svg',
    email: 'demo@tourify.live',
    isDemo: true,
    createdAt: new Date().toISOString()
  }
}

export function isDemoUser(user: any): boolean {
  return user?.isDemo === true || user?.id?.startsWith('demo-')
}

export function getDemoSessionTimeout(): number {
  return parseInt(process.env.DEMO_SESSION_TIMEOUT || '3600') * 1000 // Convert to milliseconds
}

export function shouldShowDemoTour(): boolean {
  return isDemoMode && process.env.ENABLE_DEMO_TOUR === 'true'
}

export function canResetDemo(): boolean {
  return isDemoMode && process.env.ENABLE_DEMO_RESET === 'true'
}
