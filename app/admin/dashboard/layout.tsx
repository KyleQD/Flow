import type React from "react"
import { OptimizedSidebar } from "./components/optimized-sidebar"
import { Breadcrumbs } from "./components/breadcrumbs"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Optimized Sidebar Navigation */}
      <OptimizedSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Page Content with Breadcrumbs */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20">
          <div className="p-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
