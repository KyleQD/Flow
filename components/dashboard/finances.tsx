"use client"

import { useState } from "react"
import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DashboardFinancesProps {
  userId: string
}

export function DashboardFinances({ userId }: DashboardFinancesProps) {
  const [budgetStatus, setBudgetStatus] = useState(42)

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center text-base">
          <DollarSign className="mr-2 h-5 w-5 text-green-500" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Total Budget</div>
            <div className="text-sm font-medium text-slate-200">$200,000</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Spent to Date</div>
            <div className="text-sm font-medium text-slate-200">$84,500</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Remaining</div>
            <div className="text-sm font-medium text-green-400">$115,500</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">Ticket Revenue</div>
            <div className="text-sm font-medium text-purple-400">$172,500</div>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Budget Utilization</div>
              <div className="text-sm text-purple-400">{budgetStatus}%</div>
            </div>
            <Progress value={budgetStatus} className="h-2 bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                style={{ width: `${budgetStatus}%` }}
              />
            </Progress>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 