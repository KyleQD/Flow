"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useAuth } from "@/context/auth-context"
import { useSocial } from "@/context/social-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getAllAnalyticsData } from "@/lib/analytics-service"

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const { events } = useSocial()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Load analytics data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call with the user's ID
        const data = getAllAnalyticsData()
        setAnalyticsData(data)
      } catch (error) {
        console.error("Error loading analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!analyticsData) {
    return <div className="text-center py-8 text-gray-500">Failed to load analytics data. Please try again later.</div>
  }

  // Colors for charts
  const COLORS = ["#8b5cf6", "#6366f1", "#ec4899", "#f43f5e", "#f97316"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Venue Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-purple-400">{analyticsData.venueBookings.total}</div>
              <p className="text-sm text-gray-400">Last 30 days</p>
              <div
                className={`text-xs ${analyticsData.venueBookings.percentChange >= 0 ? "text-green-500" : "text-red-500"} mt-1`}
              >
                {analyticsData.venueBookings.percentChange >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(analyticsData.venueBookings.percentChange)}% from previous period
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Ticket Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-purple-400">{analyticsData.ticketSales.total}</div>
              <p className="text-sm text-gray-400">Total tickets sold</p>
              <div className="text-xs text-green-500 mt-1">↑ {analyticsData.ticketSales.recent} new this month</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Venue Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-purple-400">{analyticsData.venueCapacity.rate}%</div>
              <p className="text-sm text-gray-400">Average capacity filled</p>
              <div
                className={`text-xs ${analyticsData.venueCapacity.percentChange >= 0 ? "text-green-500" : "text-red-500"} mt-1`}
              >
                {analyticsData.venueCapacity.percentChange >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(analyticsData.venueCapacity.percentChange)}% from previous period
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <Card className="bg-gray-900 text-white border-gray-800">
            <CardHeader>
              <CardTitle>Events Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.eventsOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#333", borderColor: "#555" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="confirmed" stroke="#ec4899" />
                    <Line type="monotone" dataKey="completed" stroke="#f97316" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card className="bg-gray-900 text-white border-gray-800">
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.revenue.bySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.revenue.bySource.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#333", borderColor: "#555" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card className="bg-gray-900 text-white border-gray-800">
            <CardHeader>
              <CardTitle>Attendance by Event Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.attendance.byEventType}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#333", borderColor: "#555" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Bar dataKey="capacity" fill="#8b5cf6" />
                    <Bar dataKey="attendance" fill="#ec4899" />
                    <Bar dataKey="percentFilled" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="mt-4">
          <Card className="bg-gray-900 text-white border-gray-800">
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.demographics.ageGroups}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.demographics.ageGroups.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#333", borderColor: "#555" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
