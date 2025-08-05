import { Metadata } from "next"
import { EnhancedSettingsRouter } from "@/components/settings/enhanced-settings-router"

export const metadata: Metadata = {
  title: "Account Settings | Tourify",
  description: "Manage your account settings, profile, and preferences",
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-white/60">
            Manage your profile, preferences, and account settings
          </p>
        </div>
        
        <EnhancedSettingsRouter />
      </div>
    </div>
  )
}
