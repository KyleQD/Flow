"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  PieChart,
  BarChart3,
  Target,
  CreditCard,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Building,
  Music,
  Ticket,
  Truck,
  Coffee,
  Award,
  Star,
  Activity,
  Eye,
  Settings,
  Filter,
  Search,
  RefreshCw,
  FileText,
  BookOpen,
  Bookmark,
  Flag,
  Zap,
  Crown,
  Shield
} from "lucide-react"

interface FinancialData {
  overview: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
    revenueGrowth: number
    expenseGrowth: number
  }
  budgets: Array<{
    category: string
    allocated: number
    spent: number
    remaining: number
    percentage: number
    status: 'on_track' | 'warning' | 'over_budget'
  }>
  expenses: Array<{
    id: string
    category: string
    amount: number
    description: string
    date: string
    vendor: string
    status: 'pending' | 'approved' | 'paid'
    receipt_url?: string
  }>
  revenue: Array<{
    source: string
    amount: number
    percentage: number
    growth: number
  }>
  cashFlow: Array<{
    month: string
    income: number
    expenses: number
    net: number
  }>
}

export default function FinancesPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isBudgetOpen, setIsBudgetOpen] = useState(false)

  const [financialData, setFinancialData] = useState<FinancialData>({
    overview: {
      totalRevenue: 2485000,
      totalExpenses: 1745000,
      netProfit: 740000,
      profitMargin: 29.8,
      revenueGrowth: 15.3,
      expenseGrowth: 8.7
    },
    budgets: [
      {
        category: "Artist Fees",
        allocated: 850000,
        spent: 720000,
        remaining: 130000,
        percentage: 84.7,
        status: 'on_track'
      },
      {
        category: "Venue Costs",
        allocated: 480000,
        spent: 445000,
        remaining: 35000,
        percentage: 92.7,
        status: 'warning'
      },
      {
        category: "Marketing",
        allocated: 250000,
        spent: 185000,
        remaining: 65000,
        percentage: 74.0,
        status: 'on_track'
      },
      {
        category: "Production",
        allocated: 180000,
        spent: 195000,
        remaining: -15000,
        percentage: 108.3,
        status: 'over_budget'
      },
      {
        category: "Staff",
        allocated: 320000,
        spent: 280000,
        remaining: 40000,
        percentage: 87.5,
        status: 'on_track'
      },
      {
        category: "Equipment",
        allocated: 150000,
        spent: 125000,
        remaining: 25000,
        percentage: 83.3,
        status: 'on_track'
      }
    ],
    expenses: [
      {
        id: '1',
        category: 'Artist Fees',
        amount: 45000,
        description: 'DJ Luna - Electronic Showcase',
        date: '2025-06-25',
        vendor: 'DJ Luna Management',
        status: 'pending'
      },
      {
        id: '2',
        category: 'Venue Costs',
        amount: 25000,
        description: 'Madison Square Garden - Venue Rental',
        date: '2025-06-24',
        vendor: 'MSG Entertainment',
        status: 'approved'
      },
      {
        id: '3',
        category: 'Marketing',
        amount: 8500,
        description: 'Summer Festival - Social Media Campaign',
        date: '2025-06-23',
        vendor: 'Digital Marketing Pro',
        status: 'paid'
      },
      {
        id: '4',
        category: 'Production',
        amount: 15000,
        description: 'Sound & Lighting Equipment',
        date: '2025-06-22',
        vendor: 'TechPro Audio',
        status: 'paid'
      }
    ],
    revenue: [
      {
        source: 'Ticket Sales',
        amount: 1580000,
        percentage: 63.6,
        growth: 18.5
      },
      {
        source: 'Merchandise',
        amount: 485000,
        percentage: 19.5,
        growth: 25.2
      },
      {
        source: 'Sponsorships',
        amount: 280000,
        percentage: 11.3,
        growth: 8.7
      },
      {
        source: 'VIP Packages',
        amount: 140000,
        percentage: 5.6,
        growth: 35.8
      }
    ],
    cashFlow: [
      { month: 'Jan', income: 180000, expenses: 145000, net: 35000 },
      { month: 'Feb', income: 220000, expenses: 168000, net: 52000 },
      { month: 'Mar', income: 280000, expenses: 195000, net: 85000 },
      { month: 'Apr', income: 320000, expenses: 225000, net: 95000 },
      { month: 'May', income: 380000, expenses: 265000, net: 115000 },
      { month: 'Jun', income: 485000, expenses: 340000, net: 145000 }
    ]
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'over_budget': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'approved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    prefix = "", 
    suffix = "",
    color = "text-blue-400",
    isNegative = false
  }: {
    title: string
    value: number | string
    growth?: number
    icon: any
    prefix?: string
    suffix?: string
    color?: string
    isNegative?: boolean
  }) => (
    <Card className="bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className={`text-2xl font-bold ${isNegative ? 'text-red-400' : 'text-white'}`}>
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {growth !== undefined && (
              <div className="flex items-center">
                {growth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                )}
                <span className={`text-sm font-medium ${growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Financial Management
            </h1>
            <p className="text-slate-400 mt-2">
              Comprehensive budgeting, expense tracking, and revenue analytics
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
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={financialData.overview.totalRevenue}
            growth={financialData.overview.revenueGrowth}
            icon={DollarSign}
            prefix="$"
            color="text-green-400"
          />
          <MetricCard
            title="Total Expenses"
            value={financialData.overview.totalExpenses}
            growth={financialData.overview.expenseGrowth}
            icon={Receipt}
            prefix="$"
            color="text-red-400"
            isNegative={true}
          />
          <MetricCard
            title="Net Profit"
            value={financialData.overview.netProfit}
            icon={Target}
            prefix="$"
            color="text-blue-400"
          />
          <MetricCard
            title="Profit Margin"
            value={financialData.overview.profitMargin}
            icon={Calculator}
            suffix="%"
            color="text-purple-400"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800/50 p-1 grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Flow Chart */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                    Monthly Cash Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {financialData.cashFlow.map((month, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">{month.month}</span>
                          <span className={`text-sm font-medium ${month.net > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${month.net.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="flex h-6 bg-slate-800 rounded">
                            <div 
                              className="bg-green-500 rounded-l"
                              style={{ width: `${(month.income / Math.max(...financialData.cashFlow.map(m => m.income))) * 100}%` }}
                            />
                            <div 
                              className="bg-red-500 rounded-r"
                              style={{ width: `${(month.expenses / Math.max(...financialData.cashFlow.map(m => m.income))) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Income: ${month.income.toLocaleString()}</span>
                          <span>Expenses: ${month.expenses.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Sources */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-green-400" />
                    Revenue Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {financialData.revenue.map((source, index) => (
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
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-400">{source.percentage}%</span>
                          <div className="flex items-center">
                            {source.growth > 0 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-400" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-400" />
                            )}
                            <span className={`text-xs ${source.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {source.growth}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Budget Overview</h2>
              <Button 
                onClick={() => setIsBudgetOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financialData.budgets.map((budget, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{budget.category}</h3>
                        <Badge className={getStatusColor(budget.status)}>
                          {budget.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Spent</span>
                          <span className="text-white">${budget.spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Budget</span>
                          <span className="text-white">${budget.allocated.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={Math.min(budget.percentage, 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{budget.percentage.toFixed(1)}% used</span>
                          <span className={`${budget.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${Math.abs(budget.remaining).toLocaleString()} {budget.remaining >= 0 ? 'remaining' : 'over'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-white">Expense Management</h2>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Artist Fees">Artist Fees</SelectItem>
                    <SelectItem value="Venue Costs">Venue Costs</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => setIsAddExpenseOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {financialData.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium text-white">{expense.description}</h4>
                            <p className="text-sm text-slate-400">{expense.vendor} • {new Date(expense.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="text-xs">
                          {expense.category}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-white">${expense.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(expense.status)}>
                            {expense.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <h2 className="text-xl font-bold text-white">Revenue Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialData.revenue.map((source, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{source.source}</h3>
                        <div className="flex items-center space-x-2">
                          {source.growth > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-sm ${source.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {source.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Revenue</span>
                          <span className="text-white font-bold">${source.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Share</span>
                          <span className="text-white">{source.percentage}%</span>
                        </div>
                        <Progress value={source.percentage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-xl font-bold text-white">Financial Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Profit & Loss Statement", icon: FileText, description: "Comprehensive P&L report" },
                { title: "Cash Flow Report", icon: BarChart3, description: "Monthly cash flow analysis" },
                { title: "Budget vs Actual", icon: Target, description: "Budget performance report" },
                { title: "Expense Analysis", icon: Receipt, description: "Detailed expense breakdown" },
                { title: "Revenue Forecast", icon: TrendingUp, description: "Revenue projections" },
                { title: "Tax Summary", icon: Calculator, description: "Tax preparation report" }
              ].map((report, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <report.icon className="h-8 w-8 text-blue-400" />
                      <div>
                        <h3 className="font-medium text-white">{report.title}</h3>
                        <p className="text-sm text-slate-400">{report.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
