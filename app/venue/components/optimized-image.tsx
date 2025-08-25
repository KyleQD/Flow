"use client"

import React, { useState, useEffect, useRef } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
}

export const OptimizedImage = React.memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState(priority ? src : "")
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 })

  useEffect(() => {
    if (priority) return

    if (isVisible && !imgSrc) {
      setImgSrc(src)
    }
  }, [isVisible, src, imgSrc, priority])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {(!isLoaded || !imgSrc) && <Skeleton className="absolute inset-0 bg-gray-300 dark:bg-gray-700" />}

      {imgSrc && (
        <img
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ objectFit }}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            console.error(`Failed to load image: ${src}`)
            setImgSrc("/placeholder.svg?height=120&width=120&text=Error")
          }}
        />
      )}
    </div>
  )
})
