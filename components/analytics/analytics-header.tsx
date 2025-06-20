"use client"

import { Download, FileText, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AnalyticsHeaderProps {
  dateRange: "7d" | "30d" | "90d" | "1y" | "all"
  setDateRange: (range: "7d" | "30d" | "90d" | "1y" | "all") => void
}

export function AnalyticsHeader({ dateRange, setDateRange }: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-white/60">Track your venue's performance metrics and insights</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Card className="bg-[#1a1d29] border-0 p-1 w-full sm:w-auto">
          <CardContent className="flex p-0">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md ${
                dateRange === "7d" ? "bg-purple-600 text-white" : "text-white/70 hover:text-white hover:bg-[#2a2f3e]"
              }`}
              onClick={() => setDateRange("7d")}
            >
              7D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md ${
                dateRange === "30d" ? "bg-purple-600 text-white" : "text-white/70 hover:text-white hover:bg-[#2a2f3e]"
              }`}
              onClick={() => setDateRange("30d")}
            >
              30D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md ${
                dateRange === "90d" ? "bg-purple-600 text-white" : "text-white/70 hover:text-white hover:bg-[#2a2f3e]"
              }`}
              onClick={() => setDateRange("90d")}
            >
              90D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md ${
                dateRange === "1y" ? "bg-purple-600 text-white" : "text-white/70 hover:text-white hover:bg-[#2a2f3e]"
              }`}
              onClick={() => setDateRange("1y")}
            >
              1Y
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md ${
                dateRange === "all" ? "bg-purple-600 text-white" : "text-white/70 hover:text-white hover:bg-[#2a2f3e]"
              }`}
              onClick={() => setDateRange("all")}
            >
              All
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <FileText className="mr-2 h-4 w-4" />
            Report
          </Button>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
