"use client"

import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ArtistProvider } from "@/contexts/artist-context"
import { useRouteAccountSync } from "@/hooks/use-route-account-sync"

function ArtistLayoutContent({ children }: { children: ReactNode }) {
  // Automatically sync account with route
  const { isCorrectAccount } = useRouteAccountSync()
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-black via-slate-950 to-black">
        <AppSidebar />
        <main className="flex-1 overflow-hidden relative">
          {/* Background Effects */}
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 noise-texture" />
          
          <div className="h-full overflow-auto p-4 lg:p-8 artist-content relative z-10">
            {/* Show warning if not in correct account mode */}
            {!isCorrectAccount && (
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400 text-sm">
                  ⚠️ You're viewing artist pages but not in artist mode. Switch to your artist account for the full experience.
                </p>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return (
    <ArtistProvider>
      <ArtistLayoutContent>{children}</ArtistLayoutContent>
    </ArtistProvider>
  )
} 