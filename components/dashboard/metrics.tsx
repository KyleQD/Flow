"use client"

import { useState } from "react"
import { Activity, DollarSign, Ticket, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardMetricsProps {
  userId: string
}

interface MetricCardProps {
  title: string
  value: number
  icon: any
  trend: "up" | "down" | "stable"
  color: string
  detail: string
}

export function DashboardMetrics({ userId }: DashboardMetricsProps) {
  const [ticketSales, setTicketSales] = useState(78)
  const [budgetStatus, setBudgetStatus] = useState(42)
  const [staffReadiness, setStaffReadiness] = useState(85)

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-slate-700/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-purple-500" />
            Event Overview
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-slate-800/50 text-purple-400 border-purple-500/50 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1 animate-pulse"></div>
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Ticket Sales"
            value={ticketSales}
            icon={Ticket}
            trend="up"
            color="purple"
            detail="3,450 / 4,500 sold"
          />
          <MetricCard
            title="Budget Status"
            value={budgetStatus}
            icon={DollarSign}
            trend="stable"
            color="pink"
            detail="$84,500 / $200,000"
          />
          <MetricCard
            title="Staff Readiness"
            value={staffReadiness}
            icon={Users}
            trend="up"
            color="blue"
            detail="42 confirmed / 50 needed"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({ title, value, icon: Icon, trend, color, detail }: MetricCardProps) {
  const getColor = () => {
    switch (color) {
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      case "pink":
        return "from-pink-500 to-purple-500 border-pink-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      default:
        return "from-purple-500 to-pink-500 border-purple-500/30"
    }
  }

  return (
    <div className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
        {value}%
      </div>
      <div className="text-xs text-slate-500">{detail}</div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-purple-500 to-pink-500"></div>
    </div>
  )
} 