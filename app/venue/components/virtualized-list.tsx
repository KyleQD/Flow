"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  className?: string
  overscan?: number
  onEndReached?: () => void
  endReachedThreshold?: number
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  className = "",
  overscan = 3,
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [endRef, isEndVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: endReachedThreshold,
  })

  useEffect(() => {
    if (isEndVisible && onEndReached) {
      onEndReached()
    }
  }, [isEndVisible, onEndReached])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          setContainerHeight(entry.contentRect.height)
        }
      }
    })

    resizeObserver.observe(container)
    setContainerHeight(container.clientHeight)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  // Calculate the range of visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)

  // Calculate the total height of all items
  const totalHeight = items.length * itemHeight

  // Render only the visible items
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => {
    const actualIndex = startIndex + index
    return (
      <div
        key={actualIndex}
        style={{
          position: "absolute",
          top: actualIndex * itemHeight,
          height: itemHeight,
          left: 0,
          right: 0,
        }}
      >
        {renderItem(item, actualIndex)}
      </div>
    )
  })

  return (
    <div ref={containerRef} className={`relative overflow-auto ${className}`} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems}
        <div ref={endRef} style={{ height: 1, width: "100%" }} />
      </div>
    </div>
  )
}
