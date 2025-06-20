"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import { Home, Calendar, Users, Settings, LogOut } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navItems = [
    {
      title: "Dashboard",
      href: "/venue/dashboard",
      icon: Home,
    },
    {
      title: "Events",
      href: "/venue/dashboard/events",
      icon: Calendar,
    },
    {
      title: "Network",
      href: "/venue/dashboard/network",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/venue/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="flex flex-col space-y-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
      <Button
        variant="ghost"
        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </nav>
  )
}
