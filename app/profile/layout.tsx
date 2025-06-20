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
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Profile</h1>
        {children}
      </div>
    </div>
  )
} 