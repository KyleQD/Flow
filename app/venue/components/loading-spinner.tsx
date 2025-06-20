import { cn } from "@/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          className={cn(
            "animate-spin rounded-full border-solid border-purple-500 border-t-transparent",
            sizeClasses[size],
            className,
          )}
        />
        <img
          src="/images/tourify-logo-white.png"
          alt="Tourify"
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            size === "sm" ? "h-2" : size === "md" ? "h-3" : "h-4",
          )}
        />
      </div>
    </div>
  )
}
