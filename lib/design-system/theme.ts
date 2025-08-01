// =============================================================================
// TOURIFY DESIGN SYSTEM - UNIFIED THEME
// Comprehensive design system for consistent UI/UX across all platform features
// =============================================================================

export const tourifyTheme = {
  // =============================================================================
  // COLOR PALETTE - Cohesive brand colors
  // =============================================================================
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main primary
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },

    // Secondary accent colors
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef', // Main secondary
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    },

    // Success states
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },

    // Warning states
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },

    // Error states
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },

    // Neutral grays
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },

    // Dark theme colors
    dark: {
      background: '#0f172a', // slate-900
      surface: '#1e293b',     // slate-800
      elevated: '#334155',    // slate-700
      border: '#475569',      // slate-600
      muted: '#64748b',       // slate-500
      text: {
        primary: '#f8fafc',   // slate-50
        secondary: '#e2e8f0', // slate-200
        tertiary: '#94a3b8'   // slate-400
      }
    },

    // Role-based colors
    roles: {
      admin: '#ef4444',      // red-500
      manager: '#f59e0b',    // amber-500
      tour_manager: '#8b5cf6', // violet-500
      event_coordinator: '#06b6d4', // cyan-500
      artist: '#d946ef',     // fuchsia-500
      crew_member: '#22c55e', // green-500
      vendor: '#f97316',     // orange-500
      venue_owner: '#3b82f6', // blue-500
      viewer: '#6b7280'      // gray-500
    }
  },

  // =============================================================================
  // TYPOGRAPHY - Consistent text styling
  // =============================================================================
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      display: ['Inter', 'system-ui', 'sans-serif']
    },

    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem'  // 60px
    },

    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },

    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    }
  },

  // =============================================================================
  // SPACING - Consistent spacing scale
  // =============================================================================
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px  
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem'      // 384px
  },

  // =============================================================================
  // SHADOWS - Depth and elevation
  // =============================================================================
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    
    // Special effect shadows
    glow: '0 0 20px rgb(139 92 246 / 0.3)',
    glowSm: '0 0 10px rgb(139 92 246 / 0.2)',
    glowLg: '0 0 40px rgb(139 92 246 / 0.4)'
  },

  // =============================================================================
  // BORDER RADIUS - Consistent rounding
  // =============================================================================
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // =============================================================================
  // BREAKPOINTS - Responsive design
  // =============================================================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // =============================================================================
  // ANIMATION - Consistent transitions
  // =============================================================================
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms'
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0.0, 1, 1)',
      out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    }
  },

  // =============================================================================
  // Z-INDEX - Layering system
  // =============================================================================
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
} as const

// =============================================================================
// COMPONENT VARIANTS - Consistent component styling
// =============================================================================

export const componentVariants = {
  // Button variants
  button: {
    primary: {
      background: 'bg-primary-600 hover:bg-primary-700 focus:bg-primary-700',
      text: 'text-white',
      border: 'border-transparent',
      shadow: 'shadow-sm hover:shadow-md',
      transition: 'transition-all duration-200'
    },
    secondary: {
      background: 'bg-secondary-600 hover:bg-secondary-700 focus:bg-secondary-700',
      text: 'text-white',
      border: 'border-transparent',
      shadow: 'shadow-sm hover:shadow-md',
      transition: 'transition-all duration-200'
    },
    outline: {
      background: 'bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-200',
      border: 'border-neutral-300 dark:border-neutral-600',
      shadow: 'shadow-sm hover:shadow-md',
      transition: 'transition-all duration-200'
    },
    ghost: {
      background: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-200',
      border: 'border-transparent',
      shadow: 'shadow-none',
      transition: 'transition-all duration-200'
    }
  },

  // Card variants
  card: {
    default: {
      background: 'bg-white dark:bg-neutral-800',
      border: 'border border-neutral-200 dark:border-neutral-700',
      shadow: 'shadow-sm hover:shadow-md',
      rounded: 'rounded-lg',
      transition: 'transition-shadow duration-200'
    },
    elevated: {
      background: 'bg-white dark:bg-neutral-800',
      border: 'border-0',
      shadow: 'shadow-lg hover:shadow-xl',
      rounded: 'rounded-xl',
      transition: 'transition-shadow duration-200'
    },
    outlined: {
      background: 'bg-transparent',
      border: 'border-2 border-neutral-200 dark:border-neutral-700',
      shadow: 'shadow-none',
      rounded: 'rounded-lg',
      transition: 'transition-colors duration-200'
    }
  },

  // Status indicators
  status: {
    online: {
      background: 'bg-success-500',
      text: 'text-success-50',
      border: 'border-success-400',
      icon: 'text-success-500'
    },
    offline: {
      background: 'bg-neutral-500',
      text: 'text-neutral-50',
      border: 'border-neutral-400',
      icon: 'text-neutral-500'
    },
    warning: {
      background: 'bg-warning-500',
      text: 'text-warning-50',
      border: 'border-warning-400',
      icon: 'text-warning-500'
    },
    error: {
      background: 'bg-error-500',
      text: 'text-error-50',
      border: 'border-error-400',
      icon: 'text-error-500'
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const themeUtils = {
  // Get role color
  getRoleColor: (role: string) => {
    return tourifyTheme.colors.roles[role as keyof typeof tourifyTheme.colors.roles] || tourifyTheme.colors.neutral[500]
  },

  // Get role classes
  getRoleClasses: (role: string) => {
    const colorMap: Record<string, string> = {
      admin: 'text-red-400 bg-red-500/10 border-red-500/20',
      manager: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tour_manager: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      event_coordinator: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      artist: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
      crew_member: 'text-green-400 bg-green-500/10 border-green-500/20',
      vendor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      venue_owner: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      viewer: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
    return colorMap[role] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  },

  // Get priority color classes
  getPriorityClasses: (priority: string) => {
    const priorityMap: Record<string, string> = {
      emergency: 'text-red-400 bg-red-500/10 border-red-500/30',
      urgent: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      important: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      general: 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
    return priorityMap[priority] || priorityMap.general
  },

  // Get status color classes
  getStatusClasses: (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'text-green-400 bg-green-500/10 border-green-500/30',
      inactive: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
      pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      completed: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      cancelled: 'text-red-400 bg-red-500/10 border-red-500/30',
      planning: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      confirmed: 'text-green-400 bg-green-500/10 border-green-500/30',
      scheduled: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    }
    return statusMap[status] || 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  },

  // Generate consistent spacing classes
  getSpacingClass: (size: keyof typeof tourifyTheme.spacing) => {
    return `p-${size}`
  },

  // Generate consistent shadow classes
  getShadowClass: (level: keyof typeof tourifyTheme.shadows) => {
    return `shadow-${level}`
  }
}

// =============================================================================
// EXPORT DEFAULT THEME
// =============================================================================

export default tourifyTheme