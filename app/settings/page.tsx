import type { Metadata } from "next"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { SettingsTabs } from "@/components/settings/settings-tabs"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Settings | Tourify",
  description: "Manage your account settings and preferences",
}

export default function SettingsPage() {
  return (
    <SettingsLayout>
      <SettingsTabs />
    </SettingsLayout>
  )
}
