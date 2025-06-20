import type React from "react"
import { AppShell } from "../../components/layouts/app-shell"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
