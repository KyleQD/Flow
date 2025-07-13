"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  Music,
  Building,
  Target,
  Activity,
  Star,
  Clock,
  MapPin,
  Zap,
  Eye,
  Download,
  Share,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  PieChart,
  LineChart,
  AreaChart,
  Globe,
  Heart,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Play,
  Headphones,
  Radio,
  Ticket,
  Crown,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalRevenue: number
    revenueGrowth: number
    totalEvents: number
    eventsGrowth: number
    totalUsers: number
    usersGrowth: number
    avgTicketPrice: number
    ticketPriceGrowth: number
  }
  revenue: {
    monthly: Array<{ month: string; revenue: number; target: number }>
    bySource: Array<{ source: string; amount: number; percentage: number }>
    topEvents: Array<{ name: string; revenue: number; date: string; venue: string }>
  }
  performance: {
    eventSuccess: number
    customerSatisfaction: number
    bookingConversion: number
    repeatCustomers: number
    artistRetention: number
    venuePartnership: number
  }
  audience: {
    demographics: Array<{ age: string; percentage: number }>
    geography: Array<{ region: string; users: number; growth: number }>
    engagement: Array<{ metric: string; value: number; trend: number }>
  }
  trends: {
    popularGenres: Array<{ genre: string; events: number; growth: number }>
    peakTimes: Array<{ time: string; bookings: number }>
    seasonality: Array<{ month: string; demand: number }>
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [isLoading, setIsLoading] = useState(false)
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalRevenue: 2485000,
      revenueGrowth: 15.3,
      totalEvents: 156,
      eventsGrowth: 8.7,
      totalUsers: 25840,
      usersGrowth: 22.1,
      avgTicketPrice: 89.50,
      ticketPriceGrowth: -2.3
    },
    revenue: {
      monthly: [
        { month: "Jan", revenue: 180000, target: 200000 },
        { month: "Feb", revenue: 220000, target: 210000 },
        { month: "Mar", revenue: 280000, target: 250000 },
        { month: "Apr", revenue: 320000, target: 300000 },
        { month: "May", revenue: 380000, target: 350000 },
        { month: "Jun", revenue: 485000, target: 400000 }
      ],
      bySource: [
        { source: "Ticket Sales", amount: 1580000, percentage: 63.6 },
        { source: "Merchandise", amount: 485000, percentage: 19.5 },
        { source: "Sponsorships", amount: 280000, percentage: 11.3 },
        { source: "VIP Packages", amount: 140000, percentage: 5.6 }
      ],
      topEvents: [
        { name: "Summer Music Festival", revenue: 285000, date: "2025-06-15", venue: "Central Park" },
        { name: "Electronic Showcase", revenue: 180000, date: "2025-06-10", venue: "Brooklyn Warehouse" },
        { name: "Indie Rock Night", revenue: 125000, date: "2025-06-05", venue: "Madison Square Garden" }
      ]
    },
    performance: {
      eventSuccess: 94.2,
      customerSatisfaction: 4.7,
      bookingConversion: 68.5,
      repeatCustomers: 42.8,
      artistRetention: 87.3,
      venuePartnership: 91.6
    },
    audience: {
      demographics: [
        { age: "18-24", percentage: 28.5 },
        { age: "25-34", percentage: 35.2 },
        { age: "35-44", percentage: 22.1 },
        { age: "45-54", percentage: 10.8 },
        { age: "55+", percentage: 3.4 }
      ],
      geography: [
        { region: "New York", users: 8450, growth: 18.2 },
        { region: "California", users: 6280, growth: 22.7 },
        { region: "Texas", users: 4120, growth: 15.8 },
        { region: "Florida", users: 3890, growth: 28.4 },
        { region: "Illinois", users: 2100, growth: 12.1 }
      ],
      engagement: [
        { metric: "Avg Session Duration", value: 24.5, trend: 8.2 },
        { metric: "Pages Per Session", value: 6.8, trend: 15.3 },
        { metric: "Bounce Rate", value: 32.1, trend: -12.7 },
        { metric: "Return Visitors", value: 58.9, trend: 25.4 }
      ]
    },
    trends: {
      popularGenres: [
        { genre: "Electronic", events: 45, growth: 28.5 },
        { genre: "Rock", events: 38, growth: 15.2 },
        { genre: "Hip Hop", events: 32, growth: 35.8 },
        { genre: "Folk", events: 22, growth: 18.9 },
        { genre: "Jazz", events: 19, growth: 8.7 }
      ],
      peakTimes: [
        { time: "Friday 8PM", bookings: 1250 },
        { time: "Saturday 9PM", bookings: 1180 },
        { time: "Sunday 7PM", bookings: 890 },
        { time: "Thursday 8PM", bookings: 720 },
        { time: "Saturday 2PM", bookings: 650 }
      ],
      seasonality: [
        { month: "Jan", demand: 65 },
        { month: "Feb", demand: 70 },
        { month: "Mar", demand: 85 },
        { month: "Apr", demand: 90 },
        { month: "May", demand: 95 },
        { month: "Jun", demand: 100 }
      ]
    }
  })

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    prefix = "", 
    suffix = "",
    color = "text-blue-400"
  }: {
    title: string
    value: number | string
    growth?: number
    icon: any
    prefix?: string
    suffix?: string
    color?: string
  }) => (
    <Card className="bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {growth !== undefined && (
              <div className="flex items-center">
                {growth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
                ) : growth < 0 ? (
                  <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  growth > 0 ? 'text-green-400' : growth < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {growth > 0 ? '+' : ''}{growth}%
                </span>
                <span className="text-sm text-slate-500 ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-slate-800/50 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PerformanceMetric = ({ 
    title, 
    value, 
    target = 100, 
    unit = "%",
    color = "from-blue-500 to-purple-500"
  }: {
    title: string
    value: number
    target?: number
    unit?: string
    color?: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-lg font-bold text-white">{value}{unit}</p>
      </div>
      <div className="relative">
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div 
            className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-700`}
            style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
          />
        </div>
        {target !== 100 && (
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span>
            <span>{target}{unit} target</span>
          </div>
        )}
      </div>
    </div>
  )

  const TrendChart = ({ data, title, color = "rgb(99, 102, 241)" }: {
    data: Array<{ label: string; value: number }>
    title: string
    color?: string
  }) => (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.label}</span>
              <div className="flex items-center space-x-3 flex-1 ml-4">
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ 
                      width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-white w-16 text-right">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Analytics & Insights
            </h1>
            <p className="text-slate-400 mt-2">
              Comprehensive performance metrics and business intelligence
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={refreshData}
              disabled={isLoading}
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={analyticsData.overview.totalRevenue}
            growth={analyticsData.overview.revenueGrowth}
            icon={DollarSign}
            prefix="$"
            color="text-green-400"
          />
          <MetricCard
            title="Total Events"
            value={analyticsData.overview.totalEvents}
            growth={analyticsData.overview.eventsGrowth}
            icon={CalendarIcon}
            color="text-blue-400"
          />
          <MetricCard
            title="Total Users"
            value={analyticsData.overview.totalUsers}
            growth={analyticsData.overview.usersGrowth}
            icon={Users}
            color="text-purple-400"
          />
          <MetricCard
            title="Avg Ticket Price"
            value={analyticsData.overview.avgTicketPrice}
            growth={analyticsData.overview.ticketPriceGrowth}
            icon={Ticket}
            prefix="$"
            color="text-yellow-400"
          />
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="bg-slate-800/50 p-1 grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="performance" className="data-[state=active]:bg-slate-700">Performance</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-slate-700">Revenue</TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-slate-700">Audience</TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-slate-700">Trends</TabsTrigger>
            <TabsTrigger value="real-time" className="data-[state=active]:bg-slate-700">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-400" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PerformanceMetric
                    title="Event Success Rate"
                    value={analyticsData.performance.eventSuccess}
                    color="from-green-500 to-emerald-500"
                  />
                  <PerformanceMetric
                    title="Customer Satisfaction"
                    value={analyticsData.performance.customerSatisfaction}
                    target={5}
                    unit="/5"
                    color="from-yellow-500 to-orange-500"
                  />
                  <PerformanceMetric
                    title="Booking Conversion"
                    value={analyticsData.performance.bookingConversion}
                    color="from-blue-500 to-purple-500"
                  />
                  <PerformanceMetric
                    title="Repeat Customers"
                    value={analyticsData.performance.repeatCustomers}
                    color="from-purple-500 to-pink-500"
                  />
                  <PerformanceMetric
                    title="Artist Retention"
                    value={analyticsData.performance.artistRetention}
                    color="from-pink-500 to-red-500"
                  />
                  <PerformanceMetric
                    title="Venue Partnership Score"
                    value={analyticsData.performance.venuePartnership}
                    color="from-cyan-500 to-blue-500"
                  />
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-400">Strong Performance</h4>
                        <p className="text-sm text-slate-300 mt-1">
                          Event success rate is 94.2%, exceeding industry average of 85%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-400">Optimization Opportunity</h4>
                        <p className="text-sm text-slate-300 mt-1">
                          Booking conversion could improve by focusing on mobile experience
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-400">Growing Trend</h4>
                        <p className="text-sm text-slate-300 mt-1">
                          Repeat customer rate increased 25% month-over-month
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-green-400" />
                    Revenue by Source
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.revenue.bySource.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ 
                            backgroundColor: [
                              'rgb(34, 197, 94)', 
                              'rgb(59, 130, 246)', 
                              'rgb(168, 85, 247)', 
                              'rgb(251, 191, 36)'
                            ][index % 4]
                          }}
                        />
                        <span className="text-slate-300">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${source.amount.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">{source.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Performing Events */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-400" />
                    Top Revenue Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.revenue.topEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{event.name}</h4>
                        <p className="text-sm text-slate-400">{event.venue} • {new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">${event.revenue.toLocaleString()}</p>
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Revenue Trend */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-blue-400" />
                  Monthly Revenue vs Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  {analyticsData.revenue.monthly.map((month, index) => (
                    <div key={index} className="text-center space-y-2">
                      <p className="text-sm text-slate-400">{month.month}</p>
                      <div className="relative h-32">
                        <div className="absolute bottom-0 w-full bg-slate-800 rounded-t">
                          <div 
                            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-700"
                            style={{ height: `${(month.revenue / month.target) * 100}%` }}
                          />
                        </div>
                        <div 
                          className="absolute w-full border-t-2 border-dashed border-yellow-400"
                          style={{ bottom: '100%' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-white">
                          ${(month.revenue / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-slate-400">
                          vs ${(month.target / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographics */}
              <TrendChart
                data={analyticsData.audience.demographics.map(d => ({ label: d.age, value: d.percentage }))}
                title="Age Demographics"
                color="rgb(168, 85, 247)"
              />

              {/* Geographic Distribution */}
              <TrendChart
                data={analyticsData.audience.geography.map(g => ({ label: g.region, value: g.users }))}
                title="Geographic Distribution"
                color="rgb(34, 197, 94)"
              />
            </div>

            {/* Engagement Metrics */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-cyan-400" />
                  User Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {analyticsData.audience.engagement.map((metric, index) => (
                    <div key={index} className="text-center space-y-2">
                      <p className="text-sm text-slate-400">{metric.metric}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <div className="flex items-center justify-center">
                        {metric.trend > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${metric.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Genres */}
              <TrendChart
                data={analyticsData.trends.popularGenres.map(g => ({ label: g.genre, value: g.events }))}
                title="Popular Genres"
                color="rgb(251, 191, 36)"
              />

              {/* Peak Booking Times */}
              <TrendChart
                data={analyticsData.trends.peakTimes.map(t => ({ label: t.time, value: t.bookings }))}
                title="Peak Booking Times"
                color="rgb(239, 68, 68)"
              />
            </div>

            {/* Seasonality Trends */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-purple-400" />
                  Seasonal Demand Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  {analyticsData.trends.seasonality.map((month, index) => (
                    <div key={index} className="text-center space-y-2">
                      <p className="text-sm text-slate-400">{month.month}</p>
                      <div className="relative h-24">
                        <div className="absolute bottom-0 w-full bg-slate-800 rounded-t">
                          <div 
                            className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all duration-700"
                            style={{ height: `${month.demand}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white">{month.demand}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="real-time" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <Eye className="h-8 w-8 text-blue-400 mx-auto" />
                    <p className="text-2xl font-bold text-white">1,247</p>
                    <p className="text-sm text-slate-400">Active Users</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <Play className="h-8 w-8 text-green-400 mx-auto" />
                    <p className="text-2xl font-bold text-white">23</p>
                    <p className="text-sm text-slate-400">Live Events</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <Ticket className="h-8 w-8 text-yellow-400 mx-auto" />
                    <p className="text-2xl font-bold text-white">89</p>
                    <p className="text-sm text-slate-400">Tickets/Hour</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <DollarSign className="h-8 w-8 text-green-400 mx-auto" />
                    <p className="text-2xl font-bold text-white">$12.4K</p>
                    <p className="text-sm text-slate-400">Revenue/Hour</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Radio className="h-5 w-5 mr-2 text-red-400" />
                  Live Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { user: "Sarah M.", action: "purchased 2 tickets for Summer Festival", time: "2 min ago", type: "purchase" },
                    { user: "Alex R.", action: "shared Electronic Showcase event", time: "5 min ago", type: "share" },
                    { user: "Mike C.", action: "left a 5-star review for Indie Rock Night", time: "8 min ago", type: "review" },
                    { user: "Lisa K.", action: "added VIP package to cart", time: "12 min ago", type: "cart" },
                    { user: "David L.", action: "followed DJ Luna artist profile", time: "15 min ago", type: "follow" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'purchase' ? 'bg-green-400' :
                        activity.type === 'share' ? 'bg-blue-400' :
                        activity.type === 'review' ? 'bg-yellow-400' :
                        activity.type === 'cart' ? 'bg-purple-400' :
                        'bg-pink-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 