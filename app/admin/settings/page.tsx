import type { Metadata } from "next"
import { EnhancedSettingsLayout } from "@/components/settings/enhanced-settings-layout"
import { AccountScopedSettings } from "@/components/settings/account-scoped-settings"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Admin Settings | Tourify",
  description: "Manage administrative settings and platform configuration",
}

export default function AdminSettingsPage() {
  return (
    <EnhancedSettingsLayout>
      <AccountScopedSettings />
    </EnhancedSettingsLayout>
  )
} 