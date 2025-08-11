// Admin Theme Utilities
// Provides consistent theming and styling for the admin dashboard

export interface AdminThemeColors {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
}

export interface AdminGradients {
  primary: string
  secondary: string
  accent: string
  background: string
  card: string
}

export interface AdminGlowEffects {
  primary: string
  secondary: string
  accent: string
}

export const adminTheme = {
  colors: {
    primary: 'rgb(239, 68, 68)', // Red for authority
    secondary: 'rgb(139, 92, 246)', // Purple for creativity
    accent: 'rgb(6, 182, 212)', // Cyan for organization
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    error: 'rgb(239, 68, 68)',
    info: 'rgb(59, 130, 246)'
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, rgb(239, 68, 68), rgb(139, 92, 246))',
    secondary: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(6, 182, 212))',
    accent: 'linear-gradient(135deg, rgb(6, 182, 212), rgb(34, 211, 238))',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    card: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))'
  },
  
  glow: {
    primary: '0 0 20px rgba(239, 68, 68, 0.3)',
    secondary: '0 0 20px rgba(139, 92, 246, 0.3)',
    accent: '0 0 20px rgba(6, 182, 212, 0.3)'
  }
}

export function getAdminColor(type: keyof AdminThemeColors): string {
  return adminTheme.colors[type]
}

export function getAdminGradient(type: keyof AdminGradients): string {
  return adminTheme.gradients[type]
}

export function getAdminGlow(type: keyof AdminGlowEffects): string {
  return adminTheme.glow[type]
}

export function getStatusClasses(status: 'success' | 'warning' | 'error' | 'info' | 'neutral'): string {
  const baseClasses = 'px-2 py-1 rounded-md text-xs font-medium'
  
  switch (status) {
    case 'success':
      return `${baseClasses} admin-badge-success`
    case 'warning':
      return `${baseClasses} admin-badge-warning`
    case 'error':
      return `${baseClasses} admin-badge-error`
    case 'info':
      return `${baseClasses} admin-badge-info`
    default:
      return `${baseClasses} bg-slate-500/20 text-slate-400`
  }
}

export function getPriorityClasses(priority: 'low' | 'medium' | 'high' | 'urgent'): string {
  const baseClasses = 'px-2 py-1 rounded-md text-xs font-medium'
  
  switch (priority) {
    case 'urgent':
      return `${baseClasses} admin-badge-error`
    case 'high':
      return `${baseClasses} admin-badge-warning`
    case 'medium':
      return `${baseClasses} admin-badge-info`
    case 'low':
      return `${baseClasses} bg-slate-500/20 text-slate-400`
    default:
      return `${baseClasses} bg-slate-500/20 text-slate-400`
  }
}

export function getRoleClasses(role: string): string {
  const baseClasses = 'px-2 py-1 rounded-md text-xs font-medium'
  
  switch (role.toLowerCase()) {
    case 'admin':
      return `${baseClasses} admin-badge-error`
    case 'manager':
      return `${baseClasses} admin-badge-warning`
    case 'coordinator':
      return `${baseClasses} admin-badge-info`
    case 'member':
      return `${baseClasses} admin-badge-success`
    default:
      return `${baseClasses} bg-slate-500/20 text-slate-400`
  }
}

export function getMetricCardClasses(variant: 'primary' | 'secondary' | 'accent' = 'primary'): string {
  const baseClasses = 'admin-metric-card admin-card-hover p-6 rounded-2xl'
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} border-red-500/20 hover:border-red-500/40`
    case 'secondary':
      return `${baseClasses} border-purple-500/20 hover:border-purple-500/40`
    case 'accent':
      return `${baseClasses} border-cyan-500/20 hover:border-cyan-500/40`
    default:
      return `${baseClasses} border-red-500/20 hover:border-red-500/40`
  }
}

export function getButtonClasses(variant: 'primary' | 'secondary' | 'accent' | 'outline' = 'primary'): string {
  const baseClasses = 'admin-btn-futuristic px-4 py-2 rounded-lg font-medium transition-all duration-300'
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700`
    case 'secondary':
      return `${baseClasses} bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700`
    case 'accent':
      return `${baseClasses} bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700`
    case 'outline':
      return `${baseClasses} bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400`
    default:
      return `${baseClasses} bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700`
  }
}

export function getCardClasses(variant: 'default' | 'elevated' | 'glass' = 'default'): string {
  const baseClasses = 'rounded-2xl border transition-all duration-300'
  
  switch (variant) {
    case 'default':
      return `${baseClasses} admin-metric-card`
    case 'elevated':
      return `${baseClasses} admin-metric-card shadow-lg hover:shadow-xl`
    case 'glass':
      return `${baseClasses} admin-backdrop-blur-enhanced`
    default:
      return `${baseClasses} admin-metric-card`
  }
}

export function getAnimationClasses(type: 'float' | 'glow' | 'pulse' | 'shimmer'): string {
  switch (type) {
    case 'float':
      return 'admin-floating'
    case 'glow':
      return 'admin-glow'
    case 'pulse':
      return 'admin-pulse'
    case 'shimmer':
      return 'admin-shimmer'
    default:
      return ''
  }
}

export function getTextGradientClasses(): string {
  return 'admin-gradient-text'
}

export function getBorderClasses(type: 'neon' | 'gradient' = 'neon'): string {
  switch (type) {
    case 'neon':
      return 'admin-neon-border'
    case 'gradient':
      return 'border border-gradient-to-r from-red-500 to-purple-600'
    default:
      return 'admin-neon-border'
  }
}

// Utility function to combine multiple classes
export function combineClasses(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Theme-aware color utilities
export const themeUtils = {
  getColor: getAdminColor,
  getGradient: getAdminGradient,
  getGlow: getAdminGlow,
  getStatusClasses,
  getPriorityClasses,
  getRoleClasses,
  getMetricCardClasses,
  getButtonClasses,
  getCardClasses,
  getAnimationClasses,
  getTextGradientClasses,
  getBorderClasses,
  combineClasses
}

export default themeUtils 