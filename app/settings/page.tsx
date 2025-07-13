import type { Metadata } from "next"
import { EnhancedSettingsLayout } from "@/components/settings/enhanced-settings-layout"
import { AccountScopedSettings } from "@/components/settings/account-scoped-settings"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Settings | Tourify",
  description: "Manage your account settings and preferences with our next-generation interface",
}

export default function SettingsPage() {
  return (
    <EnhancedSettingsLayout>
      <AccountScopedSettings />
    </EnhancedSettingsLayout>
  )
}
