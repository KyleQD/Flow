import type { Metadata } from "next"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { IntegrationSettings } from "@/components/settings/integration-settings"

export const metadata: Metadata = {
  title: "Integration Settings | Tourify",
  description: "Manage your third-party integrations and connections",
}

export default function IntegrationSettingsPage() {
  return (
    <SettingsLayout>
      <IntegrationSettings />
    </SettingsLayout>
  )
}
