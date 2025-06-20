"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface RevenueSource {
  name: string
  value: number
}

interface RevenueOverTime {
  date: string
  revenue: number
  expenses: number
  profit: number
}

interface RevenueAnalyticsProps {
  revenueBySource: RevenueSource[]
  revenueOverTime: RevenueOverTime[]
  isCompact: boolean
}

export function RevenueAnalytics({ revenueBySource, revenueOverTime, isCompact }: RevenueAnalyticsProps) {
  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const totalRevenue = revenueBySource.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={isCompact ? "" : "space-y-6"}>
      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardHeader className="pb-2">
          <CardTitle>Revenue Analysis</CardTitle>
          {!isCompact && (
            <CardDescription className="text-white/60">
              Breakdown of revenue sources and trends over time
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sources" className="space-y-4">
            <TabsList className="bg-[#0f1117] p-1">
              <TabsTrigger value="sources" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Revenue Sources
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Revenue Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueBySource}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueBySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                        contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Revenue Breakdown</h3>
                  <div className="space-y-2">
                    {revenueBySource.map((source, index) => (
                      <div key={source.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span>{source.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{formatCurrency(source.value)}</span>
                          <span className="text-sm text-white/60">
                            {((source.value / totalRevenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Revenue</span>
                      <span className="font-bold">{formatCurrency(totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueOverTime}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {!isCompact && (
        <Card className="bg-[#1a1d29] border-0 text-white">
          <CardHeader className="pb-2">
            <CardTitle>Revenue by Month</CardTitle>
            <CardDescription className="text-white/60">Monthly revenue breakdown for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueOverTime}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
