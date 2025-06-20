import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
  // Define sizes for different variants
  const sizes = {
    sm: { width: 100, height: 30 },
    md: { width: 140, height: 42 },
    lg: { width: 180, height: 54 },
  }

  const { width, height } = sizes[size]

  return (
    <Link href="/" className={className}>
      <Image
        src="/images/tourify-logo.png"
        alt="Tourify"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </Link>
  )
}
