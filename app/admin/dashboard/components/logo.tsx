import Link from "next/link"
import { TourifyLogo } from "../../../../components/tourify-logo"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <Link href="/" className={className}>
      <TourifyLogo
        variant="light"
        size={size}
        className="object-contain"
      />
    </Link>
  )
}
