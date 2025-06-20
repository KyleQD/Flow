"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Costs {
  staffing: number
  rent: number
  utilities: number
  marketing: number
  equipment: number
  licenses: number
  insurance: number
  maintenance: number
  other: number
}

interface CostTrend {
  month: string
  staffing: number
  rent: number
  utilities: number
  marketing: number
  other: number
}

interface CostAnalyticsProps {
  costs: Costs
  costTrend: CostTrend[]
  isCompact: boolean
}

export function CostAnalytics({ costs, costTrend, isCompact }: CostAnalyticsProps) {
  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#f43f5e"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare data for the pie chart
  const costData = [
    { name: "Staffing", value: costs.staffing },
    { name: "Rent", value: costs.rent },
    { name: "Utilities", value: costs.utilities },
    { name: "Marketing", value: costs.marketing },
    { name: "Equipment", value: costs.equipment },
    { name: "Licenses", value: costs.licenses },
    { name: "Insurance", value: costs.insurance },
    { name: "Maintenance", value: costs.maintenance },
    { name: "Other", value: costs.other },
  ]

  const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0)

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="pb-2">
        <CardTitle>Cost Analysis</CardTitle>
        {!isCompact && (
          <CardDescription className="text-white/60">Breakdown of operational costs and trends</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breakdown" className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="breakdown" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Cost Breakdown
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Cost Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Cost"]}
                      contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cost Breakdown</h3>
                <div className="space-y-2">
                  {costData.map((cost, index) => (
                    <div key={cost.name} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{cost.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{formatCurrency(cost.value)}</span>
                        <span className="text-sm text-white/60">{((cost.value / totalCosts) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Costs</span>
                    <span className="font-bold">{formatCurrency(totalCosts)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={costTrend}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="staffing" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                  <Area type="monotone" dataKey="rent" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                  <Area type="monotone" dataKey="utilities" stackId="1" stroke="#10b981" fill="#10b981" />
                  <Area type="monotone" dataKey="marketing" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                  <Area type="monotone" dataKey="other" stackId="1" stroke="#ef4444" fill="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {!isCompact && (
          <div className="mt-6 p-4 bg-[#0f1117] rounded-md">
            <h3 className="text-lg font-medium mb-2">Cost Optimization Opportunities</h3>
            <p className="text-white/60 mb-4">
              Based on your cost analysis, here are some areas where you might optimize expenses:
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div>
                  <span>Staffing Optimization</span>
                </div>
                <span className="text-green-400">Potential 8% savings</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-yellow-500"></div>
                  <span>Energy Efficiency</span>
                </div>
                <span className="text-green-400">Potential 12% savings</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                  <span>Marketing ROI Improvement</span>
                </div>
                <span className="text-green-400">Potential 15% savings</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
