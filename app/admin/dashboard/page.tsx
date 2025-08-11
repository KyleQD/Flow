import { Suspense } from "react"
import EnhancedDashboardClient from "./components/enhanced-dashboard-client"
import { DashboardLoading } from "./components/optimized-loading"

// This is now a proper server component without client-side dependencies
export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Wrap in Suspense for better loading states */}
      <Suspense fallback={<DashboardLoading />}>
        <EnhancedDashboardClient />
      </Suspense>
    </div>
  )
}
