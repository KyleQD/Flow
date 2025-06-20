"use client"

import { useState, useEffect, useRef, type RefObject } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver<T extends Element>({
  threshold = 0,
  root = null,
  rootMargin = "0px",
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const hasIOSupport = !!window.IntersectionObserver
    if (!hasIOSupport) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting
        if (isIntersecting || !freezeOnceVisible) {
          setIsVisible(isIntersecting)
        }
        if (isIntersecting && freezeOnceVisible && observer) {
          observer.disconnect()
        }
      },
      { threshold, root, rootMargin },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return [ref, isVisible]
}
