"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Award,
  Target,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  DollarSign,
  UserCheck,
  UserX,
  Activity,
  Zap
} from "lucide-react"

interface AnalyticsMetric {
  label: string
  value: string | number
  change: number
  period: string
  icon: any
  color: string
}

interface DepartmentMetrics {
  department: string
  staffCount: number
  avgPerformance: number
  utilization: number
  turnoverRate: number
  avgSalary: number
}

export default function StaffAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30d")

  // Mock analytics data
  const overviewMetrics: AnalyticsMetric[] = [
    {
      label: "Total Staff",
      value: 124,
      change: 8.2,
      period: "vs last month",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Avg Performance",
      value: "4.6/5",
      change: 0.3,
      period: "vs last quarter",
      icon: Award,
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Utilization Rate",
      value: "87%",
      change: -2.1,
      period: "vs last month",
      icon: Activity,
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Turnover Rate",
      value: "12%",
      change: -15.4,
      period: "vs last year",
      icon: UserX,
      color: "from-orange-500 to-red-500"
    }
  ]

  const departmentMetrics: DepartmentMetrics[] = [
    {
      department: "Technical",
      staffCount: 28,
      avgPerformance: 4.7,
      utilization: 92,
      turnoverRate: 8,
      avgSalary: 68000
    },
    {
      department: "Security",
      staffCount: 32,
      avgPerformance: 4.4,
      utilization: 88,
      turnoverRate: 15,
      avgSalary: 42000
    },
    {
      department: "Operations",
      staffCount: 24,
      avgPerformance: 4.5,
      utilization: 85,
      turnoverRate: 10,
      avgSalary: 52000
    },
    {
      department: "Service",
      staffCount: 40,
      avgPerformance: 4.3,
      utilization: 83,
      turnoverRate: 18,
      avgSalary: 38000
    }
  ]

  const performanceTrends = [
    { month: "Jan", performance: 4.2, hiring: 8, retention: 92 },
    { month: "Feb", performance: 4.3, hiring: 12, retention: 89 },
    { month: "Mar", performance: 4.4, hiring: 6, retention: 94 },
    { month: "Apr", performance: 4.5, hiring: 15, retention: 91 },
    { month: "May", performance: 4.6, hiring: 9, retention: 93 },
    { month: "Jun", performance: 4.6, hiring: 11, retention: 88 }
  ]

  const getPerformanceColor = (performance: number) => {
    if (performance >= 4.5) return "text-green-400"
    if (performance >= 4.0) return "text-blue-400"
    if (performance >= 3.5) return "text-yellow-400"
    return "text-red-400"
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-green-400"
    if (utilization >= 80) return "text-blue-400"
    if (utilization >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Staff Analytics
          </h1>
          <p className="text-slate-400 mt-1">Comprehensive insights into staff performance and operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="bg-slate-800/50 border-slate-600">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" className="bg-slate-800/50 border-slate-600">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overviewMetrics.map((metric, i) => (
          <Card key={i} className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-slate-500">{metric.period}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Distribution */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-cyan-400">Staff Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentMetrics.map((dept, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          i === 0 ? 'bg-blue-500' :
                          i === 1 ? 'bg-green-500' :
                          i === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}></div>
                        <span className="text-slate-300">{dept.department}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{dept.staffCount}</div>
                        <div className="text-slate-400 text-xs">
                          {((dept.staffCount / departmentMetrics.reduce((acc, d) => acc + d.staffCount, 0)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-green-400">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">Performance trend chart</p>
                    <p className="text-slate-500 text-sm">Interactive charts coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-slate-800/30 border-slate-700/50 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-yellow-400">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Positive Trend</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Overall performance increased by 0.3 points this quarter
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-5 w-5 text-blue-400" />
                      <span className="text-blue-400 font-semibold">Top Performer</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Technical department leads with 4.7/5 average performance
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <span className="text-orange-400 font-semibold">Attention Needed</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Service department has highest turnover at 18%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {departmentMetrics.map((dept, i) => (
              <Card key={i} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{dept.department}</h3>
                      <p className="text-slate-400">{dept.staffCount} staff members</p>
                    </div>
                    <Badge variant="outline" className={`${getPerformanceColor(dept.avgPerformance)} border-current`}>
                      {dept.avgPerformance}/5 Performance
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className="text-white font-semibold text-lg">{dept.staffCount}</div>
                      <div className="text-slate-400 text-sm">Staff Count</div>
                    </div>
                    
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className={`text-lg font-semibold ${getPerformanceColor(dept.avgPerformance)}`}>
                        {dept.avgPerformance}
                      </div>
                      <div className="text-slate-400 text-sm">Avg Performance</div>
                    </div>
                    
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className={`text-lg font-semibold ${getUtilizationColor(dept.utilization)}`}>
                        {dept.utilization}%
                      </div>
                      <div className="text-slate-400 text-sm">Utilization</div>
                    </div>
                    
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className={`text-lg font-semibold ${
                        dept.turnoverRate <= 10 ? 'text-green-400' :
                        dept.turnoverRate <= 15 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {dept.turnoverRate}%
                      </div>
                      <div className="text-slate-400 text-sm">Turnover</div>
                    </div>
                    
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className="text-green-400 font-semibold text-lg">
                        ${dept.avgSalary.toLocaleString()}
                      </div>
                      <div className="text-slate-400 text-sm">Avg Salary</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">Department Utilization</span>
                      <span className="text-white font-medium">{dept.utilization}%</span>
                    </div>
                    <Progress value={dept.utilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-purple-400">Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: "4.5 - 5.0", count: 45, percentage: 36 },
                    { range: "4.0 - 4.4", count: 38, percentage: 31 },
                    { range: "3.5 - 3.9", count: 28, percentage: 23 },
                    { range: "3.0 - 3.4", count: 13, percentage: 10 }
                  ].map((perf, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300">{perf.range} stars</span>
                        <span className="text-white font-medium">{perf.count} staff</span>
                      </div>
                      <Progress value={perf.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-blue-400">Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceTrends.slice(-3).map((trend, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-medium">{trend.month}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${getPerformanceColor(trend.performance)}`}>
                          {trend.performance}/5
                        </div>
                        <div className="text-slate-400 text-sm">{trend.retention}% retention</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-orange-400">Staffing Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCheck className="h-5 w-5 text-blue-400" />
                      <span className="text-blue-400 font-semibold">Hiring Forecast</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      Based on current trends, you'll need to hire:
                    </p>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• 8-12 new staff members in Q3</li>
                      <li>• Focus on Service and Security departments</li>
                      <li>• Peak hiring period: July-August</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Performance Outlook</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Performance expected to improve by 0.2 points with current training programs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-red-400">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      risk: "High turnover in Service dept",
                      impact: "High",
                      probability: 75,
                      mitigation: "Improve compensation & training"
                    },
                    {
                      risk: "Skills gap in Technical roles",
                      impact: "Medium",
                      probability: 60,
                      mitigation: "Expand certification programs"
                    },
                    {
                      risk: "Seasonal staffing shortage",
                      impact: "High",
                      probability: 80,
                      mitigation: "Early recruitment for peak season"
                    }
                  ].map((risk, i) => (
                    <div key={i} className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{risk.risk}</h4>
                        <Badge variant="outline" className={`text-xs ${
                          risk.impact === 'High' ? 'text-red-400 border-red-400' :
                          risk.impact === 'Medium' ? 'text-yellow-400 border-yellow-400' :
                          'text-green-400 border-green-400'
                        }`}>
                          {risk.impact}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Probability</span>
                          <span>{risk.probability}%</span>
                        </div>
                        <Progress value={risk.probability} className="h-1" />
                      </div>
                      <p className="text-slate-400 text-xs">{risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 