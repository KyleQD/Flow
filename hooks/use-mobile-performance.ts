import { useState, useEffect, useRef, useCallback } from "react"
import { useIsMobile } from "./use-mobile"

interface UseMobilePerformanceOptions {
  enableLazyLoading?: boolean
  enableVirtualScrolling?: boolean
  enableIntersectionObserver?: boolean
  enablePreload?: boolean
  preloadDistance?: number
}

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  totalItems: number
  overscan?: number
}

export function useMobilePerformance(options: UseMobilePerformanceOptions = {}) {
  const { isMobile } = useIsMobile()
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isReducedData, setIsReducedData] = useState(false)

  // Detect user preferences and device capabilities
  useEffect(() => {
    // Check for low power mode (iOS)
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        (navigator as any).getBattery().then((battery: any) => {
          setIsLowPowerMode(battery.level < 0.2)
          
          battery.addEventListener('levelchange', () => {
            setIsLowPowerMode(battery.level < 0.2)
          })
        }).catch(() => {
          // Silently fail if battery API is not supported
        })
      } catch (error) {
        // Silently fail if battery API is not supported
      }
    }

    // Check for slow connection
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      try {
        const connection = (navigator as any).connection
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
        
        connection.addEventListener('change', () => {
          setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
        })
      } catch (error) {
        // Silently fail if connection API is not supported
      }
    }

    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      try {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setIsReducedMotion(mediaQuery.matches)
        
        mediaQuery.addEventListener('change', (e) => {
          setIsReducedMotion(e.matches)
        })
      } catch (error) {
        // Silently fail if media query is not supported
      }

      // Check for reduced data preference
      try {
        const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)')
        setIsReducedData(dataQuery.matches)
        
        dataQuery.addEventListener('change', (e) => {
          setIsReducedData(e.matches)
        })
      } catch (error) {
        // Silently fail if media query is not supported
      }
    }
  }, [])

  // Lazy loading hook
  const useLazyLoading = useCallback((options: { threshold?: number; rootMargin?: string; enableIntersectionObserver?: boolean } = {}) => {
    const [isVisible, setIsVisible] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const elementRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (!options.enableIntersectionObserver || !isMobile) {
        setIsVisible(true)
        return
      }

      if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        try {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setIsVisible(true)
                observer.disconnect()
              }
            },
            {
              threshold: options.threshold || 0.1,
              rootMargin: options.rootMargin || '50px'
            }
          )

          if (elementRef.current) {
            observer.observe(elementRef.current)
          }

          return () => observer.disconnect()
        } catch (error) {
          // Fallback if IntersectionObserver fails
          setIsVisible(true)
        }
      } else {
        // Fallback if IntersectionObserver is not supported
        setIsVisible(true)
      }
    }, [isMobile, options.enableIntersectionObserver, options.threshold, options.rootMargin])

    return {
      elementRef,
      isVisible,
      isLoaded,
      setIsLoaded
    }
  }, [isMobile])

  // Virtual scrolling hook
  const useVirtualScrolling = useCallback((options: VirtualScrollOptions) => {
    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const { itemHeight, containerHeight, totalItems, overscan = 5 } = options

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems = Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i)
    const totalHeight = totalItems * itemHeight
    const offsetY = startIndex * itemHeight

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }, [])

    return {
      containerRef,
      scrollTop,
      visibleItems,
      totalHeight,
      offsetY,
      handleScroll
    }
  }, [])

  // Image optimization hook
  const useOptimizedImage = useCallback((src: string, options: { 
    sizes?: string
    quality?: number
    format?: 'webp' | 'avif' | 'auto'
  } = {}) => {
    const { sizes = '100vw', quality = 80, format = 'auto' } = options
    
    // Generate optimized image URL based on device capabilities
    const getOptimizedSrc = useCallback(() => {
      if (!isMobile || typeof window === 'undefined') return src

      try {
        // For mobile, we can add optimization parameters
        const url = new URL(src, window.location.origin)
        
        if (isSlowConnection) {
          url.searchParams.set('quality', '60')
          url.searchParams.set('format', 'webp')
        } else if (isLowPowerMode) {
          url.searchParams.set('quality', '70')
          url.searchParams.set('format', 'webp')
        } else {
          url.searchParams.set('quality', quality.toString())
          if (format !== 'auto') {
            url.searchParams.set('format', format)
          }
        }

        return url.toString()
      } catch (error) {
        // Fallback to original src if URL manipulation fails
        return src
      }
    }, [src, isMobile, isSlowConnection, isLowPowerMode, quality, format])

    return {
      src: getOptimizedSrc(),
      sizes,
      loading: isMobile ? 'lazy' : 'eager' as const,
      decoding: 'async' as const
    }
  }, [isMobile, isSlowConnection, isLowPowerMode])

  // Preload hook for critical resources
  const usePreload = useCallback((resources: string[], options: { 
    priority?: 'high' | 'low'
    type?: 'image' | 'script' | 'style'
  } = {}) => {
    const { priority = 'low', type = 'image' } = options
    const [loadedResources, setLoadedResources] = useState<Set<string>>(new Set())

    useEffect(() => {
      if (!isMobile || isReducedData || typeof window === 'undefined') return

      try {
        const preloadPromises = resources.map(resource => {
          return new Promise<string>((resolve, reject) => {
            if (type === 'image') {
              const img = new Image()
              img.onload = () => {
                setLoadedResources(prev => new Set([...prev, resource]))
                resolve(resource)
              }
              img.onerror = () => reject(resource)
              img.src = resource
            } else if (type === 'script') {
              const script = document.createElement('script')
              script.src = resource
              script.onload = () => {
                setLoadedResources(prev => new Set([...prev, resource]))
                resolve(resource)
              }
              script.onerror = () => reject(resource)
              document.head.appendChild(script)
            }
          })
        })

        Promise.allSettled(preloadPromises)
      } catch (error) {
        // Silently fail if preloading is not supported
        console.debug('Preloading not supported:', error)
      }
    }, [resources, type, isMobile, isReducedData])

    return {
      loadedResources,
      isLoaded: (resource: string) => loadedResources.has(resource)
    }
  }, [isMobile, isReducedData])

  // Performance monitoring hook
  const usePerformanceMonitor = useCallback(() => {
    const [metrics, setMetrics] = useState({
      fps: 60,
      memoryUsage: 0,
      networkSpeed: 0
    })

    useEffect(() => {
      if (!isMobile) return

      let frameCount = 0
      let lastTime = performance.now()
      let animationId: number

      const measureFPS = () => {
        frameCount++
        const currentTime = performance.now()
        
        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
          setMetrics(prev => ({ ...prev, fps }))
          frameCount = 0
          lastTime = currentTime
        }

        if (typeof requestAnimationFrame !== 'undefined') {
          animationId = requestAnimationFrame(measureFPS)
        }
      }

      // Measure memory usage (if available)
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        try {
          const memory = (performance as any).memory
          setMetrics(prev => ({ 
            ...prev, 
            memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) 
          }))
        } catch (error) {
          // Silently fail if memory API is not supported
        }
      }

      // Measure network speed
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        try {
          const connection = (navigator as any).connection
          if (connection.downlink) {
            setMetrics(prev => ({ ...prev, networkSpeed: connection.downlink }))
          }
        } catch (error) {
          // Silently fail if connection API is not supported
        }
      }

      measureFPS()

      return () => {
        if (animationId && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(animationId)
        }
      }
    }, [isMobile])

    return metrics
  }, [isMobile])

  // Debounced scroll handler for better performance
  const useDebouncedScroll = useCallback((callback: (scrollTop: number) => void, delay: number = 16) => {
    const timeoutRef = useRef<NodeJS.Timeout>()

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(e.currentTarget.scrollTop)
      }, delay)
    }, [callback, delay])

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return handleScroll
  }, [])

  return {
    // Device capabilities
    isMobile,
    isLowPowerMode,
    isSlowConnection,
    isReducedMotion,
    isReducedData,
    
    // Performance hooks
    useLazyLoading,
    useVirtualScrolling,
    useOptimizedImage,
    usePreload,
    usePerformanceMonitor,
    useDebouncedScroll,
    
    // Utility functions
    shouldOptimize: isMobile || isLowPowerMode || isSlowConnection || isReducedData,
    getOptimizationLevel: () => {
      if (isReducedData) return 'minimal'
      if (isLowPowerMode || isSlowConnection) return 'conservative'
      if (isMobile) return 'balanced'
      return 'full'
    }
  }
}
