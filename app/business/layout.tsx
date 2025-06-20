"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/utils"
import { BarChart2, Calendar, CreditCard, Settings, Users, Ticket } from "lucide-react"

const navigation = [
  {
    name: "Overview",
    href: "/business",
    icon: BarChart2
  },
  {
    name: "Events",
    href: "/business/events",
    icon: Calendar
  },
  {
    name: "Tickets",
    href: "/business/tickets",
    icon: Ticket
  },
  {
    name: "Customers",
    href: "/business/customers",
    icon: Users
  },
  {
    name: "Payments",
    href: "/business/payments",
    icon: CreditCard
  },
  {
    name: "Settings",
    href: "/business/settings",
    icon: Settings
  }
]

export default function BusinessLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[#13151c] border-r border-gray-800">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">Business Dashboard</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[#0c0d10]">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
} 