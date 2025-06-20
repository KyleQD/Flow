"use client"

import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  variant?: 'default' | 'dots' | 'pulse' | 'glow'
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function Loading({ className, variant = 'default', size = 'md', text }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse",
              size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
        {text && <span className="ml-3 text-slate-300 text-sm">{text}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
        <div className="relative">
          <div className={cn(
            "rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse",
            sizes[size]
          )} />
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 animate-ping",
            sizes[size]
          )} />
        </div>
        {text && <span className="text-slate-300 text-sm animate-pulse">{text}</span>}
      </div>
    )
  }

  if (variant === 'glow') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-75 blur-lg animate-pulse",
            sizes[size]
          )} />
          <div className={cn(
            "relative rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin",
            sizes[size]
          )}>
            <div className="absolute inset-2 rounded-full bg-slate-900" />
          </div>
        </div>
        {text && (
          <div className="text-center">
            <p className="text-white font-medium">{text}</p>
            <div className="mt-2 flex items-center justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1 w-1 rounded-full bg-purple-400 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default spinner
  return (
    <div className={cn("flex items-center justify-center space-x-3", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-purple-400 border-t-transparent",
        sizes[size]
      )} />
      {text && <span className="text-slate-300 text-sm">{text}</span>}
    </div>
  )
}

// Full page loading overlay
export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-800/90 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-8 shadow-xl shadow-purple-500/10">
        <Loading variant="glow" size="lg" text={text} />
      </div>
    </div>
  )
}

// Page transition loading
export function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 opacity-75 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 bg-slate-900 rounded-full p-4 border-4 border-purple-400/30">
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin">
              <div className="absolute inset-2 bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
            Loading Tourify
          </h2>
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 