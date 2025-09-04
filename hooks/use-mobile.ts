import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const mqlTablet = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)

    const onChange = () => checkScreenSize()
    
    mql.addEventListener("change", onChange)
    mqlTablet.addEventListener("change", onChange)
    
    checkScreenSize()
    
    return () => {
      mql.removeEventListener("change", onChange)
      mqlTablet.removeEventListener("change", onChange)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    isTablet: !!isTablet,
    isDesktop: !isMobile && !isTablet,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  }
}

// Touch detection hook
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  React.useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    
    checkTouchDevice()
    window.addEventListener('touchstart', checkTouchDevice, { once: true })
    
    return () => window.removeEventListener('touchstart', checkTouchDevice)
  }, [])

  return isTouchDevice
}

// Haptic feedback hook
export function useHapticFeedback() {
  const triggerHaptic = React.useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100
      }
      navigator.vibrate(patterns[type])
    }
  }, [])

  return { triggerHaptic }
}
