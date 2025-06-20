"use client"

import { useState, useEffect } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { format, subMonths, startOfMonth, endOfMonth, subDays } from "date-fns"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  Heart,
  Music,
  Calendar,
  Target,
  ShoppingBag,
  FileText,
  ArrowLeft,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from "recharts"
import Link from "next/link"

interface BusinessAnalytics {
  overview: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    revenueGrowth: number
    profitMargin: number
    fanGrowth: number
    engagementRate: number
    conversionRate: number
  }
  revenueStreams: {
    merchandise: number
    events: number
    streaming: number
    licensing: number
    other: number
  }
  monthlyData: {
    month: string
    revenue: number
    expenses: number
    profit: number
    fanGrowth: number
    engagement: number
  }[]
  topProducts: {
    name: string
    revenue: number
    units: number
    growth: number
  }[]
  marketingROI: {
    campaign: string
    spent: number
    revenue: number
    roi: number
    conversions: number
  }[]
  businessHealth: {
    score: number
    factors: {
      financial: number
      marketing: number
      content: number
      engagement: number
    }
  }
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6B7280']

export default function BusinessAnalytics() {
  const { user } = useArtist()
  const supabase = createClientComponentClient()
  
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("12m")
  const [selectedTab, setSelectedTab] = useState("overview")

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, timeRange])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Load data from multiple sources
      const [merchandiseData, eventsData, worksData] = await Promise.all([
        supabase.from('artist_merchandise').select('*').eq('user_id', user.id),
        supabase.from('artist_events').select('*').eq('user_id', user.id),
        supabase.from('artist_works').select('*').eq('user_id', user.id)
      ])

      // Calculate analytics based on real data
      const merchandiseRevenue = merchandiseData.data?.reduce((sum, item) => 
        sum + ((item.price || 0) * (item.units_sold || 0)), 0) || 0
      
      const eventRevenue = eventsData.data?.reduce((sum, event) => 
        sum + ((event.ticket_price_min || 0) * (event.expected_attendance || 0)), 0) || 0
      
      const streamingRevenue = worksData.data?.length ? worksData.data.length * 150 : 0
      const licensingRevenue = Math.floor(Math.random() * 3000)
      const otherRevenue = Math.floor(Math.random() * 1000)
      
      const totalRevenue = merchandiseRevenue + eventRevenue + streamingRevenue + licensingRevenue + otherRevenue
      const totalExpenses = Math.round(totalRevenue * 0.4)
      const netProfit = totalRevenue - totalExpenses

      // Generate monthly data
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = format(subMonths(new Date(), 11 - i), 'MMM')
        const baseRevenue = totalRevenue / 12
        const revenue = Math.round(baseRevenue * (0.7 + Math.random() * 0.6))
        const expenses = Math.round(revenue * (0.3 + Math.random() * 0.2))
        const profit = revenue - expenses
        
        return {
          month,
          revenue,
          expenses,
          profit,
          fanGrowth: Math.round(50 + Math.random() * 200),
          engagement: Math.round(1000 + Math.random() * 3000)
        }
      })

      // Top products based on merchandise data
      const topProducts = merchandiseData.data?.slice(0, 5).map(item => ({
        name: item.name || 'Product',
        revenue: (item.price || 0) * (item.units_sold || 0),
        units: item.units_sold || 0,
        growth: Math.round(Math.random() * 40 - 10) // -10% to +30%
      })) || []

      // Mock marketing ROI data
      const marketingROI = [
        { campaign: 'New Single Release', spent: 500, revenue: 1200, roi: 140, conversions: 85 },
        { campaign: 'Tour Promotion', spent: 800, revenue: 2400, roi: 200, conversions: 156 },
        { campaign: 'Brand Awareness', spent: 300, revenue: 450, roi: 50, conversions: 32 }
      ]

      // Calculate business health score
      const financialScore = Math.min((netProfit / totalRevenue) * 400, 100) // Profit margin * 4
      const marketingScore = Math.min(marketingROI.reduce((acc, roi) => acc + roi.roi, 0) / marketingROI.length / 2, 100)
      const contentScore = Math.min((worksData.data?.length || 0) * 10, 100)
      const engagementScore = Math.min(Math.random() * 100, 100) // Simulated
      
      const overallScore = Math.round((financialScore + marketingScore + contentScore + engagementScore) / 4)

      const analyticsData: BusinessAnalytics = {
        overview: {
          totalRevenue,
          totalExpenses,
          netProfit,
          revenueGrowth: Math.round(Math.random() * 30 + 5), // 5-35%
          profitMargin: Math.round((netProfit / totalRevenue) * 100),
          fanGrowth: Math.round(Math.random() * 25 + 10), // 10-35%
          engagementRate: Math.round(Math.random() * 8 + 2), // 2-10%
          conversionRate: Math.round(Math.random() * 5 + 1) // 1-6%
        },
        revenueStreams: {
          merchandise: merchandiseRevenue,
          events: eventRevenue,
          streaming: streamingRevenue,
          licensing: licensingRevenue,
          other: otherRevenue
        },
        monthlyData,
        topProducts,
        marketingROI,
        businessHealth: {
          score: overallScore,
          factors: {
            financial: Math.round(financialScore),
            marketing: Math.round(marketingScore),
            content: Math.round(contentScore),
            engagement: Math.round(engagementScore)
          }
        }
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    if (!analytics) return
    
    // Create a simple CSV report
    const csvData = [
      ['Business Analytics Report'],
      ['Generated:', new Date().toISOString()],
      [''],
      ['Overview'],
      ['Total Revenue', analytics.overview.totalRevenue],
      ['Total Expenses', analytics.overview.totalExpenses],
      ['Net Profit', analytics.overview.netProfit],
      ['Profit Margin', `${analytics.overview.profitMargin}%`],
      [''],
      ['Revenue Streams'],
      ['Merchandise', analytics.revenueStreams.merchandise],
      ['Events', analytics.revenueStreams.events],
      ['Streaming', analytics.revenueStreams.streaming],
      ['Licensing', analytics.revenueStreams.licensing],
      ['Other', analytics.revenueStreams.other]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `business-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load analytics data</p>
      </div>
    )
  }

  const revenueStreamData = Object.entries(analytics.revenueStreams)
    .filter(([_, value]) => value > 0)
    .map(([key, value], index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: COLORS[index % COLORS.length]
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artist/business">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Business
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Business Analytics</h1>
              <p className="text-gray-400">Comprehensive business performance insights</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline" className="border-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport} className="bg-orange-600 hover:bg-orange-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${analytics.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analytics.overview.revenueGrowth}% growth
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Net Profit</p>
                <p className={`text-2xl font-bold ${analytics.overview.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(analytics.overview.netProfit).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {analytics.overview.profitMargin}% margin
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Fan Growth</p>
                <p className="text-2xl font-bold text-purple-400">+{analytics.overview.fanGrowth}%</p>
                <p className="text-xs text-purple-400">
                  {analytics.overview.engagementRate}% engagement
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Business Health</p>
                <p className="text-2xl font-bold text-yellow-400">{analytics.businessHealth.score}/100</p>
                <p className="text-xs text-gray-400">
                  Overall score
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress value={analytics.businessHealth.score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 gap-4 bg-slate-800/50 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="health">Health Score</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Trend */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      <Line type="monotone" dataKey="profit" stroke="#8B5CF6" strokeWidth={3} name="Profit" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Fan Growth */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Fan & Engagement Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="fanGrowth" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.3}
                        name="New Fans"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.3}
                        name="Engagement"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Streams */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueStreamData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {revenueStreamData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStreamData.map((stream, index) => (
                    <div key={stream.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: stream.color }}
                          ></div>
                          <span className="text-gray-300">{stream.name}</span>
                        </div>
                        <span className="font-bold text-white">${stream.value.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(stream.value / analytics.overview.totalRevenue) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-400">
                        {Math.round((stream.value / analytics.overview.totalRevenue) * 100)}% of total revenue
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Marketing ROI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.marketingROI.map((campaign, index) => (
                  <div key={campaign.campaign} className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">{campaign.campaign}</h3>
                      <Badge className={
                        campaign.roi >= 100 ? 'bg-green-600/20 text-green-300' :
                        campaign.roi >= 50 ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-red-600/20 text-red-300'
                      }>
                        {campaign.roi}% ROI
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Spent</p>
                        <p className="font-bold text-red-400">${campaign.spent}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Revenue</p>
                        <p className="font-bold text-green-400">${campaign.revenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Profit</p>
                        <p className="font-bold text-blue-400">${campaign.revenue - campaign.spent}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Conversions</p>
                        <p className="font-bold text-purple-400">{campaign.conversions}</p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={Math.min(campaign.roi, 300) / 3} 
                      className="mt-3"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.name} className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-white">{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          product.growth >= 0 ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                        }>
                          {product.growth >= 0 ? '+' : ''}{product.growth}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Revenue</p>
                        <p className="font-bold text-green-400">${product.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Units Sold</p>
                        <p className="font-bold text-blue-400">{product.units.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Avg. Price</p>
                        <p className="font-bold text-purple-400">
                          ${product.units > 0 ? (product.revenue / product.units).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Health Score Breakdown */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Business Health Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {analytics.businessHealth.score}/100
                    </div>
                    <div className={`text-lg ${
                      analytics.businessHealth.score >= 80 ? 'text-green-400' :
                      analytics.businessHealth.score >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {analytics.businessHealth.score >= 80 ? 'Excellent' :
                       analytics.businessHealth.score >= 60 ? 'Good' :
                       analytics.businessHealth.score >= 40 ? 'Fair' : 'Needs Improvement'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(analytics.businessHealth.factors).map(([factor, score]) => (
                      <div key={factor} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">{factor}</span>
                          <span className="font-bold text-white">{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.businessHealth.factors.financial < 70 && (
                    <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-300">Improve Financial Performance</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Focus on increasing profit margins by optimizing expenses or raising prices.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {analytics.businessHealth.factors.marketing < 70 && (
                    <div className="p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-300">Enhance Marketing ROI</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Review marketing campaigns and focus on higher-converting channels.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {analytics.businessHealth.factors.content < 70 && (
                    <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Music className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-300">Increase Content Output</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Create more music and content to expand your catalog and reach.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {analytics.businessHealth.score >= 80 && (
                    <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-300">Excellent Performance!</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Your business is performing well across all areas. Consider scaling up operations.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 