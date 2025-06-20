"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  Star,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Activity,
  BrainCircuit,
  Sparkles,
  Calendar,
  Shield
} from "lucide-react"

interface PerformanceMetric {
  id: string
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface StaffAnalytics {
  id: string
  name: string
  role: string
  avatar?: string
  performance: number
  efficiency: number
  reliability: number
  communicationScore: number
  hoursWorked: number
  eventsCompleted: number
  avgRating: number
  strengths: string[]
  improvements: string[]
  nextReview: string
}

export function StaffAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  const metrics: PerformanceMetric[] = [
    { id: "overall", name: "Overall Performance", value: 94.2, change: 5.3, trend: "up", color: "from-green-500 to-emerald-500" },
    { id: "efficiency", name: "Team Efficiency", value: 89.7, change: 2.1, trend: "up", color: "from-blue-500 to-cyan-500" },
    { id: "communication", name: "Communication Score", value: 96.1, change: -1.2, trend: "down", color: "from-purple-500 to-pink-500" },
    { id: "reliability", name: "Reliability Index", value: 97.8, change: 0.8, trend: "stable", color: "from-orange-500 to-red-500" }
  ]

  const staffAnalytics: StaffAnalytics[] = [
    {
      id: "1",
      name: "Alex Chen",
      role: "Venue Manager",
      avatar: "/placeholder.svg",
      performance: 98,
      efficiency: 96,
      reliability: 99,
      communicationScore: 95,
      hoursWorked: 2240,
      eventsCompleted: 124,
      avgRating: 4.9,
      strengths: ["Leadership", "Problem Solving", "Team Management"],
      improvements: ["Time Management", "Delegation"],
      nextReview: "2024-02-15"
    },
    {
      id: "2",
      name: "Maya Rodriguez",
      role: "Sound Engineer",
      avatar: "/placeholder.svg",
      performance: 95,
      efficiency: 97,
      reliability: 97,
      communicationScore: 92,
      hoursWorked: 1680,
      eventsCompleted: 89,
      avgRating: 4.8,
      strengths: ["Technical Skills", "Innovation", "Quality Control"],
      improvements: ["Documentation", "Training Others"],
      nextReview: "2024-02-20"
    },
    {
      id: "3",
      name: "Jordan Kim",
      role: "Bar Manager",
      avatar: "/placeholder.svg",
      performance: 92,
      efficiency: 94,
      reliability: 94,
      communicationScore: 98,
      hoursWorked: 1920,
      eventsCompleted: 156,
      avgRating: 4.7,
      strengths: ["Customer Service", "Inventory Management", "Team Training"],
      improvements: ["Cost Control", "Vendor Relations"],
      nextReview: "2024-02-25"
    }
  ]

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

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Staff Intelligence Analytics
            </h2>
            <p className="text-slate-400">Advanced performance insights & predictive analytics</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend)
          return (
            <Card key={metric.id} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                    <BarChart3 className="h-5 w-5 text-white" />
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

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600"
          >
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600"
          >
            <Target className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600"
          >
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger 
            value="predictions" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Predictions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Performance Chart */}
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Team Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-cyan-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">Performance chart visualization</p>
                    <p className="text-sm text-slate-500">Chart integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-semibold">Performance Boost</span>
                  </div>
                  <p className="text-slate-300 text-sm">Team efficiency increased by 12% this month due to improved communication protocols.</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-semibold">Optimization Opportunity</span>
                  </div>
                  <p className="text-slate-300 text-sm">Scheduling optimization could reduce overtime costs by 15% while maintaining service quality.</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">Training Recommendation</span>
                  </div>
                  <p className="text-slate-300 text-sm">Cross-training in technical skills recommended for 40% improvement in team flexibility.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {staffAnalytics.map((staff) => (
              <Card key={staff.id} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
                <CardContent className="p-6">
                  {/* Staff Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-12 w-12 ring-2 ring-slate-600">
                      <AvatarImage src={staff.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
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
                        <span className="text-slate-400">Overall Performance</span>
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
                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-white font-semibold">{staff.eventsCompleted}</div>
                      <div className="text-xs text-slate-400">Events</div>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{staff.hoursWorked.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Hours</div>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="mb-4">
                    <div className="text-xs text-slate-400 mb-2">Strengths</div>
                    <div className="flex flex-wrap gap-1">
                      {staff.strengths.map((strength, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Next Review */}
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-cyan-400" />
                      <span className="text-xs text-slate-400">Next Review:</span>
                      <span className="text-xs text-white">{staff.nextReview}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-cyan-400" />
                <span className="text-cyan-400">AI-Powered Insights</span>
                <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">BETA</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BrainCircuit className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Advanced AI Analytics Engine</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Machine learning algorithms analyze staff performance patterns, predict optimal scheduling, 
                  and provide actionable insights for team optimization.
                </p>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <p className="text-slate-300 text-sm">Team performance expected to improve by 8% next month based on current training programs.</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-semibold">Risk Assessment</span>
                    <Badge className="bg-yellow-500 text-white">Monitor</Badge>
                  </div>
                  <p className="text-slate-300 text-sm">Potential burnout risk detected for 2 staff members. Recommend schedule adjustment.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 