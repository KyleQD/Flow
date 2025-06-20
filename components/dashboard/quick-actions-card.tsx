"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { FileText, Truck, Users, Ticket } from "lucide-react"

interface QuickAction {
  label: string
  icon: React.ReactNode
  href: string
}

const actions: QuickAction[] = [
  {
    label: "Event Brief",
    icon: <FileText className="h-8 w-8 text-purple-400 mb-2" />,
    href: "/dashboard/event-brief"
  },
  {
    label: "Logistics",
    icon: <Truck className="h-8 w-8 text-purple-400 mb-2" />,
    href: "/dashboard/logistics"
  },
  {
    label: "Staff List",
    icon: <Users className="h-8 w-8 text-purple-400 mb-2" />,
    href: "/dashboard/staff-list"
  },
  {
    label: "Ticket Sales",
    icon: <Ticket className="h-8 w-8 text-purple-400 mb-2" />,
    href: "/dashboard/ticket-sales"
  }
]

export function QuickActionsCard() {
  return (
    <Card className="p-6 bg-[#181b2a] border border-[#23263a]">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map(action => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center justify-center p-6 rounded-lg border border-[#23263a] bg-[#181b2a] hover:bg-[#23263a] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {action.icon}
            <span className="mt-2 text-base font-medium text-slate-100">{action.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  )
} 