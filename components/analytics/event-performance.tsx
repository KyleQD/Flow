"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TopEvent {
  name: string
  revenue: number
  ticketsSold: number
  date: string
  profitMargin: number
}

interface EventPerformanceProps {
  topEvents: TopEvent[]
  isCompact: boolean
}

export function EventPerformance({ topEvents, isCompact }: EventPerformanceProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare data for the chart
  const chartData = topEvents.map((event) => ({
    name: event.name.split(" ").slice(0, 2).join(" "), // Shorten name for chart
    revenue: event.revenue,
    tickets: event.ticketsSold,
  }))

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="pb-2">
        <CardTitle>Event Performance</CardTitle>
        {!isCompact && (
          <CardDescription className="text-white/60">Analysis of your top performing events</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!isCompact && (
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#9ca3af"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "revenue" ? "Revenue" : "Tickets Sold",
                  ]}
                  contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="tickets" name="Tickets Sold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Top Performing Events</h3>
          <div className="space-y-3">
            {topEvents.map((event) => (
              <div key={event.name} className="p-3 bg-[#0f1117] rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{event.name}</h4>
                  <Badge className="bg-green-500/20 text-green-500 border-0">{event.profitMargin}% margin</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-white/60">Revenue</p>
                    <p className="font-medium">{formatCurrency(event.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Tickets</p>
                    <p className="font-medium">{event.ticketsSold}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Date</p>
                    <p className="font-medium">{event.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
