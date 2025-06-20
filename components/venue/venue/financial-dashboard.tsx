"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Calendar, ChevronDown, Download, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react"

// Mock financial data
const revenueData = [
  { name: "Jan", revenue: 42000, expenses: 28000, profit: 14000 },
  { name: "Feb", revenue: 38000, expenses: 25000, profit: 13000 },
  { name: "Mar", revenue: 45000, expenses: 29000, profit: 16000 },
  { name: "Apr", revenue: 52000, expenses: 32000, profit: 20000 },
  { name: "May", revenue: 58000, expenses: 35000, profit: 23000 },
  { name: "Jun", revenue: 65000, expenses: 38000, profit: 27000 },
]

const revenueSourceData = [
  { name: "Ticket Sales", value: 65 },
  { name: "Bar Sales", value: 20 },
  { name: "Venue Rental", value: 10 },
  { name: "Merchandise", value: 5 },
]

const expenseData = [
  { name: "Staff", value: 40 },
  { name: "Utilities", value: 15 },
  { name: "Maintenance", value: 20 },
  { name: "Marketing", value: 15 },
  { name: "Other", value: 10 },
]

const COLORS = ["#8b5cf6", "#3b82f6", "#ec4899", "#10b981", "#6b7280"]

export function FinancialDashboard() {
  const [dateRange, setDateRange] = useState("6m")

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg">Financial Dashboard</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Last 6 Months</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="bg-gray-800 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">$300,000</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-900/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15%
                    </Badge>
                    <span className="text-xs text-gray-400 ml-2">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Expenses</p>
                      <p className="text-2xl font-bold text-white">$187,000</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-900/20 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-red-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8%
                    </Badge>
                    <span className="text-xs text-gray-400 ml-2">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Net Profit</p>
                      <p className="text-2xl font-bold text-white">$113,000</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-900/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +22%
                    </Badge>
                    <span className="text-xs text-gray-400 ml-2">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Profit Margin</p>
                      <p className="text-2xl font-bold text-white">37.6%</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-900/20 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5.2%
                    </Badge>
                    <span className="text-xs text-gray-400 ml-2">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue vs Expenses Chart */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", borderRadius: "0.375rem" }}
                        itemStyle={{ color: "#F3F4F6" }}
                        labelStyle={{ color: "#F3F4F6", fontWeight: "bold" }}
                        formatter={(value) => [`$${value}`, ""]}
                      />
                      <Bar dataKey="revenue" name="Revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Sources and Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueSourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {revenueSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            borderColor: "#374151",
                            borderRadius: "0.375rem",
                          }}
                          itemStyle={{ color: "#F3F4F6" }}
                          labelStyle={{ color: "#F3F4F6", fontWeight: "bold" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            borderColor: "#374151",
                            borderRadius: "0.375rem",
                          }}
                          itemStyle={{ color: "#F3F4F6" }}
                          labelStyle={{ color: "#F3F4F6", fontWeight: "bold" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            borderColor: "#374151",
                            borderRadius: "0.375rem",
                          }}
                          itemStyle={{ color: "#F3F4F6" }}
                          labelStyle={{ color: "#F3F4F6", fontWeight: "bold" }}
                          formatter={(value) => [`$${value}`, ""]}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Expense Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            borderColor: "#374151",
                            borderRadius: "0.375rem",
                          }}
                          itemStyle={{ color: "#F3F4F6" }}
                          labelStyle={{ color: "#F3F4F6", fontWeight: "bold" }}
                          formatter={(value) => [`$${value}`, ""]}
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="#EF4444"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Financial Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon className="h-8 w-8 text-purple-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-white">Monthly Financial Statement - June 2025</h3>
                          <p className="text-sm text-gray-400">Generated on July 1, 2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="p-4 bg-gray-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon className="h-8 w-8 text-purple-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-white">Quarterly Financial Report - Q2 2025</h3>
                          <p className="text-sm text-gray-400">Generated on July 5, 2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <div className="p-4 bg-gray-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon className="h-8 w-8 text-purple-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-white">Tax Summary Report - 2025</h3>
                          <p className="text-sm text-gray-400">Generated on July 10, 2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
