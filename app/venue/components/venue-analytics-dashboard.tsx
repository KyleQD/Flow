"use client"

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
import { Calendar, ChevronDown, Download, Users } from "lucide-react"

interface VenueAnalyticsDashboardProps {
  venue: any
}

// Mock analytics data
const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 5000 },
  { name: "Mar", revenue: 6000 },
  { name: "Apr", revenue: 7000 },
  { name: "May", revenue: 8500 },
  { name: "Jun", revenue: 9800 },
]

const bookingsData = [
  { name: "Jan", bookings: 10 },
  { name: "Feb", bookings: 15 },
  { name: "Mar", bookings: 12 },
  { name: "Apr", bookings: 18 },
  { name: "May", bookings: 20 },
  { name: "Jun", bookings: 25 },
]

const visitsData = [
  { name: "Jan", visits: 1200 },
  { name: "Feb", visits: 1500 },
  { name: "Mar", visits: 1800 },
  { name: "Apr", visits: 2100 },
  { name: "May", visits: 2400 },
  { name: "Jun", visits: 2800 },
]

const eventTypeData = [
  { name: "Concerts", value: 45 },
  { name: "Private Events", value: 25 },
  { name: "Corporate", value: 15 },
  { name: "Other", value: 15 },
]

const COLORS = ["#8b5cf6", "#3b82f6", "#ec4899", "#6b7280"]

export function VenueAnalyticsDashboard({ venue }: VenueAnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState("6m")

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Date Range</span>
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
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">$42,500</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-900/20 flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-900/20 text-green-400 border-green-800">
                    +15% from last period
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Bookings</p>
                      <p className="text-2xl font-bold text-white">125</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-900/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-900/20 text-green-400 border-green-800">
                    +8% from last period
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Profile Views</p>
                      <p className="text-2xl font-bold text-white">12,450</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-pink-900/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-pink-400" />
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-900/20 text-green-400 border-green-800">
                    +22% from last period
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Avg. Event Size</p>
                      <p className="text-2xl font-bold text-white">385</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 bg-green-900/20 text-green-400 border-green-800">
                    +5% from last period
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", borderRadius: "0.375rem" }}
                        itemStyle={{ color: "#F3F4F6" }}
                        labelStyle={{ color: "#F3F4F6", fontWeight: "bold" }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bookings and Event Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        />
                        <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Event Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={eventTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {eventTypeData.map((entry, index) => (
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
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Booking Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        />
                        <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience">
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Profile Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={visitsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        />
                        <Line type="monotone" dataKey="visits" stroke="#EC4899" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
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
