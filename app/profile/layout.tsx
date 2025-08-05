import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Tourify",
  description: "Manage your profile settings and preferences",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container py-6">
        {children}
      </div>
    </div>
  )
} 