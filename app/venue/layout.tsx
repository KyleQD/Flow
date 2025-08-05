import type React from "react"
import type { Metadata } from "next"
import { VenueProviders } from "./providers"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Tourify - Music Industry Platform",
  description: "Connect, collaborate, and grow in the music industry",
    generator: 'v0.dev'
}

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VenueProviders>
      {children}
      <Toaster />
    </VenueProviders>
  )
}
