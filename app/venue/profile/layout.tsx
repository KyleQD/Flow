import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Briefcase, FileText, User } from "lucide-react"

export const metadata: Metadata = {
  title: "Profile Management",
  description: "Manage your professional profile",
}

interface ProfileLayoutProps {
  children: React.ReactNode
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <User className="mr-3 h-5 w-5" />
              Profile Overview
            </Link>
            <Link
              href="/profile/professions"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <Briefcase className="mr-3 h-5 w-5" />
              Professions
            </Link>
            <Link
              href="/profile/content"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="mr-3 h-5 w-5" />
              Content
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
