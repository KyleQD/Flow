"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useIsMobile, useHapticFeedback } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface MobileCardProps {
  title: string
  subtitle?: string
  content: React.ReactNode
  actions?: React.ReactNode
  badge?: string | number
  image?: string
  onClick?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  variant?: 'default' | 'elevated' | 'flat'
  size?: 'sm' | 'md' | 'lg'
}

export function MobileOptimizedCard({
  title,
  subtitle,
  content,
  actions,
  badge,
  image,
  onClick,
  onSwipeLeft,
  onSwipeRight,
  className,
  variant = 'default',
  size = 'md'
}: MobileCardProps) {
  const { isMobile } = useIsMobile()
  const { triggerHaptic } = useHapticFeedback()
  const [isPressed, setIsPressed] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    setIsPressed(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const deltaX = e.touches[0].clientX - touchStartRef.current.x
    const deltaY = e.touches[0].clientY - touchStartRef.current.y

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      setSwipeOffset(deltaX * 0.3) // Dampen the movement
    }
  }

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return

    const deltaX = swipeOffset / 0.3 // Reverse the dampening
    const minSwipeDistance = 100

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onSwipeRight) {
        triggerHaptic('medium')
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        triggerHaptic('medium')
        onSwipeLeft()
      }
    }

    setSwipeOffset(0)
    setIsPressed(false)
    touchStartRef.current = null
  }

  const handleClick = () => {
    if (onClick) {
      triggerHaptic('light')
      onClick()
    }
  }

  const cardVariants = {
    default: "bg-slate-800/50 border-slate-700/50",
    elevated: "bg-slate-800/80 border-slate-600/50 shadow-lg shadow-slate-900/50",
    flat: "bg-slate-800/30 border-slate-700/30"
  }

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: swipeOffset,
        scale: isPressed ? 0.98 : 1
      }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 200,
        x: { type: "tween", duration: 0.1 }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "touch-manipulation",
        className
      )}
    >
      <Card
        className={cn(
          "transition-all duration-200 cursor-pointer",
          cardVariants[variant],
          sizeClasses[size],
          onClick && "hover:bg-slate-800/70 active:bg-slate-800/90"
        )}
        onClick={handleClick}
      >
        <CardHeader className={cn("p-0 pb-3", size === 'sm' && "pb-2")}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "text-white font-semibold truncate",
                size === 'sm' ? "text-sm" : size === 'lg' ? "text-xl" : "text-base"
              )}>
                {title}
              </CardTitle>
              {subtitle && (
                <p className={cn(
                  "text-slate-400 mt-1 truncate",
                  size === 'sm' ? "text-xs" : "text-sm"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {badge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2 flex-shrink-0",
                  size === 'sm' ? "text-xs px-2 py-0.5" : "text-sm"
                )}
              >
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn("p-0", size === 'sm' && "space-y-2")}>
          {image && (
            <div className={cn(
              "rounded-lg overflow-hidden mb-3",
              size === 'sm' ? "h-24" : size === 'lg' ? "h-48" : "h-32"
            )}>
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          <div className={cn(
            "text-slate-300",
            size === 'sm' ? "text-sm" : "text-base"
          )}>
            {content}
          </div>

          {actions && (
            <div className={cn(
              "flex items-center justify-end gap-2 mt-4",
              size === 'sm' && "mt-3"
            )}>
              {actions}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Mobile-optimized list item component
interface MobileListItemProps {
  title: string
  subtitle?: string
  avatar?: string
  badge?: string | number
  actions?: React.ReactNode
  onClick?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function MobileListItem({
  title,
  subtitle,
  avatar,
  badge,
  actions,
  onClick,
  onSwipeLeft,
  onSwipeRight,
  className
}: MobileListItemProps) {
  const { triggerHaptic } = useHapticFeedback()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const deltaX = e.touches[0].clientX - touchStartRef.current.x
    const deltaY = e.touches[0].clientY - touchStartRef.current.y

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      setSwipeOffset(deltaX * 0.3)
    }
  }

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return

    const deltaX = swipeOffset / 0.3
    const minSwipeDistance = 80

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onSwipeRight) {
        triggerHaptic('medium')
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        triggerHaptic('medium')
        onSwipeLeft()
      }
    }

    setSwipeOffset(0)
    touchStartRef.current = null
  }

  return (
    <motion.div
      animate={{ x: swipeOffset }}
      transition={{ type: "tween", duration: 0.1 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("touch-manipulation", className)}
    >
      <div
        onClick={() => {
          if (onClick) {
            triggerHaptic('light')
            onClick()
          }
        }}
        className={cn(
          "flex items-center p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg",
          "transition-all duration-200 cursor-pointer",
          onClick && "hover:bg-slate-800/70 active:bg-slate-800/90"
        )}
      >
        {avatar && (
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-3">
            <img 
              src={avatar} 
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{title}</h3>
          {subtitle && (
            <p className="text-slate-400 text-sm truncate mt-1">{subtitle}</p>
          )}
        </div>

        {badge && (
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {badge}
          </Badge>
        )}

        {actions && (
          <div className="flex items-center gap-2 ml-2">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  )
}
