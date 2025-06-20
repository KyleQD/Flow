"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  BrainCircuit, 
  Sparkles, 
  Star, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  Shield
} from "lucide-react"

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

// Staff analytics data
const staffMetrics = [
  { id: "performance", name: "Overall Performance", value: 94.2, change: 5.3, trend: "up", color: "from-green-500 to-emerald-500" },
  { id: "efficiency", name: "Team Efficiency", value: 89.7, change: 2.1, trend: "up", color: "from-blue-500 to-cyan-500" },
  { id: "communication", name: "Communication Score", value: 96.1, change: -1.2, trend: "down", color: "from-purple-500 to-pink-500" },
  { id: "reliability", name: "Reliability Index", value: 97.8, change: 0.8, trend: "stable", color: "from-orange-500 to-red-500" }
]

const staffAnalytics = [
  {
    id: "1",
    name: "Alex Chen",
    role: "Venue Manager",
    avatar: "/placeholder.svg",
    performance: 98,
    efficiency: 96,
    reliability: 99,
    eventsCompleted: 124,
    hoursWorked: 2240,
    avgRating: 4.9,
    status: "online"
  },
  {
    id: "2", 
    name: "Maya Rodriguez",
    role: "Sound Engineer",
    avatar: "/placeholder.svg",
    performance: 95,
    efficiency: 97,
    reliability: 97,
    eventsCompleted: 89,
    hoursWorked: 1680,
    avgRating: 4.8,
    status: "busy"
  },
  {
    id: "3",
    name: "Jordan Kim", 
    role: "Bar Manager",
    avatar: "/placeholder.svg",
    performance: 92,
    efficiency: 94,
    reliability: 94,
    eventsCompleted: 156,
    hoursWorked: 1920,
    avgRating: 4.7,
    status: "online"
  }
]

export function VenueAnalyticsDashboard({ venue }: VenueAnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState("6m")

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Activity
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-400'
    if (performance >= 85) return 'text-blue-400'
    if (performance >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

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
            <TabsTrigger value="staff">Staff Analytics</TabsTrigger>
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

          <TabsContent value="staff" className="space-y-6">
            {/* Staff Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {staffMetrics.map((metric) => {
                const TrendIcon = getTrendIcon(metric.trend)
                return (
                  <Card key={metric.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                          <TrendIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">{metric.name}</p>
                        <p className="text-3xl font-bold text-white">{metric.value}%</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* AI Insights Section */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BrainCircuit className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-400">AI-Powered Staff Insights</span>
                  <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">BETA</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Performance Boost</span>
                    </div>
                    <p className="text-slate-300 text-sm">Team efficiency increased by 12% this month due to improved communication.</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-semibold">Optimization</span>
                    </div>
                    <p className="text-slate-300 text-sm">Scheduling optimization could reduce costs by 15% while maintaining quality.</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Training Needed</span>
                    </div>
                    <p className="text-slate-300 text-sm">Cross-training recommended for 40% improvement in team flexibility.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {staffAnalytics.map((staff) => (
                <Card key={staff.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Staff Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-slate-600">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(staff.status)} rounded-full border-2 border-slate-800`}></div>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{staff.name}</h3>
                        <p className="text-slate-400 text-sm">{staff.role}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-medium">{staff.avgRating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Performance</span>
                          <span className={`font-semibold ${getPerformanceColor(staff.performance)}`}>
                            {staff.performance}%
                          </span>
                        </div>
                        <Progress value={staff.performance} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Efficiency</span>
                          <span className={`font-semibold ${getPerformanceColor(staff.efficiency)}`}>
                            {staff.efficiency}%
                          </span>
                        </div>
                        <Progress value={staff.efficiency} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Reliability</span>
                          <span className={`font-semibold ${getPerformanceColor(staff.reliability)}`}>
                            {staff.reliability}%
                          </span>
                        </div>
                        <Progress value={staff.reliability} className="h-2" />
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-white font-semibold">{staff.eventsCompleted}</div>
                        <div className="text-xs text-slate-400">Events</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{staff.hoursWorked.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Hours</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Predictive Analytics */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-400">Predictive Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 font-semibold">Staffing Forecast</span>
                        <Badge className="bg-blue-500 text-white">High Confidence</Badge>
                      </div>
                      <p className="text-slate-300 text-sm">Peak demand predicted for next weekend. Recommend 15% increase in bar staff.</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-semibold">Performance Trend</span>
                        <Badge className="bg-green-500 text-white">Improving</Badge>
                      </div>
                      <p className="text-slate-300 text-sm">Team performance expected to improve by 8% next month based on training programs.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-orange-400 font-semibold flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Optimization Recommendations
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                        <Shield className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium text-sm">Cross-train Security Team</div>
                          <div className="text-slate-400 text-xs">Improve flexibility by 25%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                        <Clock className="h-5 w-5 text-green-400" />
                        <div>
                          <div className="text-white font-medium text-sm">Optimize Shift Overlaps</div>
                          <div className="text-slate-400 text-xs">Reduce costs by 12%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                        <Award className="h-5 w-5 text-purple-400" />
                        <div>
                          <div className="text-white font-medium text-sm">Performance Incentives</div>
                          <div className="text-slate-400 text-xs">Boost morale and productivity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
