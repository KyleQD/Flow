import type React from "react"
import { EnhancedNavigationLayout } from "@/components/admin/enhanced-navigation-layout"
import { ErrorBoundary } from "@/components/admin/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { TourEventProvider } from "./components/tour-event-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <TourEventProvider>
        <EnhancedNavigationLayout
          showContextualNav={true}
          showActivityFeed={true}
          showTourSelector={true}
          defaultSidebarCollapsed={false}
          className="min-h-screen"
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </EnhancedNavigationLayout>
      </TourEventProvider>
      <Toaster />
    </ErrorBoundary>
  )
}
