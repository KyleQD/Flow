import type { Metadata } from "next"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { NotificationSettings } from "@/components/settings/notification-settings"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Notification Settings | Tourify",
  description: "Manage your notification preferences",
}

export default function NotificationSettingsPage() {
  return (
    <SettingsLayout>
      <NotificationSettings />
    </SettingsLayout>
  )
}
