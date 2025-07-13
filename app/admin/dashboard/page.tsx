import { CustomizableDashboard } from "@/components/admin/customizable-dashboard"
import { OnboardingDashboard } from "./components/onboarding-dashboard"
import { TourEventProvider } from "./components/tour-event-provider"
import Dashboard from "./components/dashboard"
import { Suspense } from "react"

// This is now a proper server component without client-side dependencies
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Event & Tour Management</h1>
          <p className="text-slate-400">
            Manage your tours, events, and business operations
          </p>
        </div>

        {/* Wrap everything in Suspense for better loading states */}
        <Suspense fallback={<DashboardLoadingState />}>
          <TourEventProvider>
            <DashboardContent />
          </TourEventProvider>
        </Suspense>
      </div>
    </div>
  )
}

// Separate component for the actual dashboard content
function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Enhanced Customizable Dashboard */}
      <div>
        <CustomizableDashboard />
      </div>
      
      {/* Existing Dashboard Content */}
      <div>
        <Dashboard />
      </div>
    </div>
  )
}

// Loading state component
function DashboardLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-slate-400">Loading your dashboard...</p>
      </div>
    </div>
  )
}
