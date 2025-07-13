import type { ImgHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TourifyLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  variant?: 'light' | 'dark' | 'white'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function TourifyLogo({ 
  variant = 'light', 
  size = 'md', 
  className,
  ...props 
}: TourifyLogoProps) {
  const sizeClasses = {
    xs: 'h-4 w-auto',
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto'
  }

  // Determine which logo file to use based on variant
  const logoSrc = variant === 'white' || variant === 'dark' 
    ? "/venue/images/tourify-logo-white.png"
    : "/venue/images/tourify-logo.png"
  
  return (
    <img
      src={logoSrc}
      alt="Tourify"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
}
