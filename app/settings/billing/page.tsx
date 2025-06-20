import type { Metadata } from "next"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { BillingSettings } from "@/components/settings/billing-settings"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Billing Settings | Tourify",
  description: "Manage your billing information and subscription",
}

export default function BillingSettingsPage() {
  return (
    <SettingsLayout>
      <BillingSettings />
    </SettingsLayout>
  )
}
