import type { Metadata } from "next"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { ProfileSettings } from "@/components/settings/profile-settings"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Profile Settings | Tourify",
  description: "Manage your profile information and visibility",
}

export default function ProfileSettingsPage() {
  return (
    <SettingsLayout>
      <ProfileSettings />
    </SettingsLayout>
  )
}
