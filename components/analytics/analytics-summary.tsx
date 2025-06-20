"use client"

import { ArrowUpRight, DollarSign, Percent, Ticket, TrendingUp, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AnalyticsSummaryProps {
  data: {
    totalRevenue: number
    ticketsSold: number
    averageTicketPrice: number
    totalEvents: number
    profitMargin: number
    revenueGrowth: number
  }
}

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Badge className="bg-green-500/20 text-green-500 border-0 mr-2">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              {data.revenueGrowth}%
            </Badge>
            <span className="text-white/60 text-sm">vs. previous period</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60 mb-1">Tickets Sold</p>
              <h3 className="text-2xl font-bold">{data.ticketsSold.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <p className="text-white/60 text-sm">
              Avg. Price: <span className="text-white font-medium">${data.averageTicketPrice}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60 mb-1">Total Events</p>
              <h3 className="text-2xl font-bold">{data.totalEvents}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-600/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <p className="text-white/60 text-sm">
              Revenue per Event:{" "}
              <span className="text-white font-medium">
                {formatCurrency(Math.round(data.totalRevenue / data.totalEvents))}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60 mb-1">Profit Margin</p>
              <h3 className="text-2xl font-bold">{data.profitMargin}%</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-600/20 flex items-center justify-center">
              <Percent className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <p className="text-white/60 text-sm">
              Estimated Profit:{" "}
              <span className="text-white font-medium">
                {formatCurrency(Math.round(data.totalRevenue * (data.profitMargin / 100)))}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60 mb-1">Revenue Growth</p>
              <h3 className="text-2xl font-bold">{data.revenueGrowth}%</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-600/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <p className="text-white/60 text-sm">
              Projected Next Month:{" "}
              <span className="text-white font-medium">
                {formatCurrency(Math.round(data.totalRevenue * (1 + data.revenueGrowth / 100)))}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-900 to-purple-700 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/80 mb-1">Revenue Per Attendee</p>
              <h3 className="text-2xl font-bold">${Math.round((data.totalRevenue / data.ticketsSold) * 100) / 100}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <p className="text-white/80 text-sm">Including ticket sales, bar revenue, and merchandise</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
