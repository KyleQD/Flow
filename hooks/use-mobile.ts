import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        setIsMobile(width < MOBILE_BREAKPOINT)
        setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
      }
    }

    if (typeof window !== 'undefined') {
      checkScreenSize()
      
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const mqlTablet = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)

      const onChange = () => checkScreenSize()
      
      mql.addEventListener("change", onChange)
      mqlTablet.addEventListener("change", onChange)
      
      return () => {
        mql.removeEventListener("change", onChange)
        mqlTablet.removeEventListener("change", onChange)
      }
    }
  }, [])

  return {
    isMobile: isClient ? isMobile : false,
    isTablet: isClient ? isTablet : false,
    isDesktop: isClient ? (!isMobile && !isTablet) : true,
    breakpoint: isClient ? (isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop') : 'desktop'
  }
}

// Touch detection hook
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined') {
      const checkTouchDevice = () => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
      }
      
      checkTouchDevice()
      window.addEventListener('touchstart', checkTouchDevice, { once: true })
      
      return () => window.removeEventListener('touchstart', checkTouchDevice)
    }
  }, [])

  return isClient ? isTouchDevice : false
}

// Haptic feedback hook
export function useHapticFeedback() {
  const triggerHaptic = React.useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const patterns = {
          light: 10,
          medium: 50,
          heavy: 100
        }
        navigator.vibrate(patterns[type])
      } catch (error) {
        // Silently fail if vibration is not supported or fails
        console.debug('Haptic feedback not supported:', error)
      }
    }
  }, [])

  return { triggerHaptic }
}
