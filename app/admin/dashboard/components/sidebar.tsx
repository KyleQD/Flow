"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Link as LinkIcon,
  Calendar,
  Ticket,
  Truck,
  Users,
  DollarSign,
  Box,
  MessageSquare,
  Settings as SettingsIcon
} from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Logo } from "./logo"
import { Suspense } from "react"
import ActiveEventsList from "./ActiveEventsList"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Home },
  { label: "Tours", href: "/admin/dashboard/tours", icon: LinkIcon },
  { label: "Events", href: "/admin/dashboard/events", icon: Calendar },
  { label: "Ticketing", href: "/admin/dashboard/ticketing", icon: Ticket },
  { label: "Logistics", href: "/admin/dashboard/logistics", icon: Truck },
  { label: "Staff", href: "/admin/dashboard/staff", icon: Users },
  { label: "Finances", href: "/admin/dashboard/finances", icon: DollarSign },
  { label: "Inventory", href: "/admin/dashboard/inventory", icon: Box },
  { label: "Communications", href: "/admin/dashboard/communications", icon: MessageSquare },
  { label: "Settings", href: "/admin/dashboard/settings", icon: SettingsIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:block w-64 shrink-0">
      <Card className="h-full rounded-none bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-6 mt-2">
            <Logo size="sm" />
          </div>

          <nav className="space-y-2">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname.startsWith(href)
              return (
                <NavItem
                  key={label}
                  href={href}
                  icon={Icon}
                  label={label}
                  active={isActive}
                />
              )
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="text-xs text-slate-500 mb-2 font-mono">ACTIVE EVENTS</div>
            <Suspense fallback={<div className="text-xs text-slate-400">Loading events...</div>}>
              <ActiveEventsList />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Component for nav items
function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Button
      variant="ghost"
      asChild
      className={`w-full justify-start ${active ? "bg-slate-800/70 text-purple-400" : "text-slate-400 hover:text-slate-100"}`}
    >
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
