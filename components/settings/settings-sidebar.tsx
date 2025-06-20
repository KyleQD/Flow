"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BellRing, CreditCard, Lock, Settings, User, Plug } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function SettingsSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/settings",
      label: "Account",
      icon: <Settings className="mr-2 h-4 w-4" />,
      active: pathname === "/settings",
    },
    {
      href: "/settings/profile",
      label: "Profile",
      icon: <User className="mr-2 h-4 w-4" />,
      active: pathname === "/settings/profile",
    },
    {
      href: "/settings/notifications",
      label: "Notifications",
      icon: <BellRing className="mr-2 h-4 w-4" />,
      active: pathname === "/settings/notifications",
    },
    {
      href: "/settings/security",
      label: "Security",
      icon: <Lock className="mr-2 h-4 w-4" />,
      active: pathname === "/settings/security",
    },
    {
      href: "/settings/billing",
      label: "Billing",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
      active: pathname === "/settings/billing",
    },
    {
      href: "/settings/integrations",
      label: "Integrations",
      icon: <Plug className="mr-2 h-4 w-4" />,
      active: pathname === "/settings/integrations",
    },
  ]

  return (
    <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block md:w-[200px]">
      <ScrollArea className="h-full py-6">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Settings</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn("w-full justify-start", route.active ? "bg-secondary" : "hover:bg-accent")}
                asChild
              >
                <Link href={route.href}>
                  {route.icon}
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
