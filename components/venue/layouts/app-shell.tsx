"use client"

import type React from "react"
import { GlobalNavigation } from "@/components/layouts/global-navigation"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Global navigation is now a separate component */}
      <GlobalNavigation />

      <main className="flex-1 pt-16 pb-16 md:pb-0 md:pl-64">{children}</main>
    </div>
  )
}
