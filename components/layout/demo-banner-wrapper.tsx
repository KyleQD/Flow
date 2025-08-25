"use client"

import { DemoBanner } from "@/components/demo/demo-banner"

export function DemoBannerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <DemoBanner />
      {children}
    </div>
  )
}
