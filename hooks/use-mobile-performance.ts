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
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setIsLowPowerMode(battery.level < 0.2)
        
        battery.addEventListener('levelchange', () => {
          setIsLowPowerMode(battery.level < 0.2)
        })
      })
    }

    // Check for slow connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
      
      connection.addEventListener('change', () => {
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
      })
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)
    
    mediaQuery.addEventListener('change', (e) => {
      setIsReducedMotion(e.matches)
    })

    // Check for reduced data preference
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)')
    setIsReducedData(dataQuery.matches)
    
    dataQuery.addEventListener('change', (e) => {
      setIsReducedData(e.matches)
    })
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
      if (!isMobile) return src

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
      if (!isMobile || isReducedData) return

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

        animationId = requestAnimationFrame(measureFPS)
      }

      // Measure memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) 
        }))
      }

      // Measure network speed
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection.downlink) {
          setMetrics(prev => ({ ...prev, networkSpeed: connection.downlink }))
        }
      }

      measureFPS()

      return () => {
        if (animationId) {
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
