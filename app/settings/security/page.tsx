import type { Metadata } from "next"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { SecuritySettings } from "@/components/settings/security-settings"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Security Settings | Tourify",
  description: "Manage your account security and privacy",
}

export default function SecuritySettingsPage() {
  return (
    <SettingsLayout>
      <SecuritySettings />
    </SettingsLayout>
  )
}
