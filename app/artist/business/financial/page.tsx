"use client"

import { useState, useEffect } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { format, subMonths, startOfYear, endOfYear } from "date-fns"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Receipt, 
  FileText,
  PieChart,
  BarChart3,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  CreditCard,
  Wallet,
  Target
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import Link from "next/link"

interface FinancialData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  monthlyRevenue: number[]
  monthlyExpenses: number[]
  revenueBySource: { source: string; amount: number; color: string }[]
  expensesByCategory: { category: string; amount: number; color: string }[]
  recentTransactions: Transaction[]
}

interface Transaction {
  id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  date: string
  status: 'completed' | 'pending'
}

const EXPENSE_CATEGORIES = [
  'Studio & Recording',
  'Marketing & Promotion',
  'Equipment',
  'Travel',
  'Software & Subscriptions',
  'Legal & Professional',
  'Venue & Events',
  'Other'
]

const INCOME_SOURCES = [
  'Music Sales',
  'Streaming Royalties',
  'Live Performances',
  'Merchandise',
  'Licensing',
  'Teaching',
  'Session Work',
  'Other'
]

export default function FinancialDashboard() {
  const { user } = useArtist()
  const supabase = createClientComponentClient()
  
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (user) {
      loadFinancialData()
    }
  }, [user, selectedYear])

  const loadFinancialData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Load real data from various sources
      const [merchandiseData, eventsData, worksData] = await Promise.all([
        supabase.from('artist_merchandise').select('*').eq('user_id', user.id),
        supabase.from('artist_events').select('*').eq('user_id', user.id),
        supabase.from('artist_works').select('*').eq('user_id', user.id)
      ])

      // Calculate revenue streams
      const merchandiseRevenue = merchandiseData.data?.reduce((sum, item) => 
        sum + ((item.price || 0) * (item.units_sold || 0)), 0) || 0
      
      const eventRevenue = eventsData.data?.reduce((sum, event) => 
        sum + ((event.ticket_price_min || 0) * (event.expected_attendance || 0)), 0) || 0
      
      // Simulate streaming and other revenue
      const streamingRevenue = worksData.data?.length ? worksData.data.length * 125 : 0
      const licensingRevenue = Math.floor(Math.random() * 2000)
      
      const totalRevenue = merchandiseRevenue + eventRevenue + streamingRevenue + licensingRevenue
      
      // Simulate expenses (40% of revenue typically)
      const totalExpenses = Math.round(totalRevenue * 0.4)
      const netProfit = totalRevenue - totalExpenses

      // Generate monthly data
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const baseAmount = totalRevenue / 12
        return Math.round(baseAmount * (0.7 + Math.random() * 0.6))
      })

      const monthlyExpenses = Array.from({ length: 12 }, (_, i) => {
        return Math.round(monthlyRevenue[i] * (0.3 + Math.random() * 0.2))
      })

      // Revenue by source
      const revenueBySource = [
        { source: 'Merchandise', amount: merchandiseRevenue, color: '#8B5CF6' },
        { source: 'Live Events', amount: eventRevenue, color: '#10B981' },
        { source: 'Streaming', amount: streamingRevenue, color: '#F59E0B' },
        { source: 'Licensing', amount: licensingRevenue, color: '#EF4444' }
      ].filter(item => item.amount > 0)

      // Expenses by category
      const expensesByCategory = [
        { category: 'Marketing', amount: Math.round(totalExpenses * 0.3), color: '#8B5CF6' },
        { category: 'Equipment', amount: Math.round(totalExpenses * 0.25), color: '#10B981' },
        { category: 'Studio', amount: Math.round(totalExpenses * 0.2), color: '#F59E0B' },
        { category: 'Travel', amount: Math.round(totalExpenses * 0.15), color: '#EF4444' },
        { category: 'Other', amount: Math.round(totalExpenses * 0.1), color: '#6B7280' }
      ]

      // Recent transactions (mix of real and simulated)
      const recentTransactions: Transaction[] = []
      
      // Add merchandise sales
      merchandiseData.data?.slice(0, 3).forEach((item, index) => {
        if (item.units_sold && item.units_sold > 0) {
          recentTransactions.push({
            id: `merch-${item.id}`,
            type: 'income',
            description: `${item.name} sales`,
            amount: (item.price || 0) * Math.min(item.units_sold, 10),
            category: 'Merchandise',
            date: format(subMonths(new Date(), Math.random() * 3), 'yyyy-MM-dd'),
            status: 'completed'
          })
        }
      })

      // Add some expenses
      const expenseItems = [
        { desc: 'Marketing campaign', amount: 250, category: 'Marketing' },
        { desc: 'Studio rental', amount: 150, category: 'Studio' },
        { desc: 'Equipment purchase', amount: 800, category: 'Equipment' }
      ]

      expenseItems.forEach((item, index) => {
        recentTransactions.push({
          id: `exp-${index}`,
          type: 'expense',
          description: item.desc,
          amount: item.amount,
          category: item.category,
          date: format(subMonths(new Date(), Math.random() * 2), 'yyyy-MM-dd'),
          status: 'completed'
        })
      })

      setFinancialData({
        totalRevenue,
        totalExpenses,
        netProfit,
        monthlyRevenue,
        monthlyExpenses,
        revenueBySource,
        expensesByCategory,
        recentTransactions: recentTransactions.slice(0, 10)
      })

    } catch (error) {
      console.error('Error loading financial data:', error)
      toast.error('Failed to load financial data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast.error('Please fill in all required fields')
      return
    }

    // In a real app, save to a transactions table
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      description: newTransaction.description,
      amount: newTransaction.amount,
      category: newTransaction.category,
      date: newTransaction.date,
      status: 'completed'
    }

    setFinancialData(prev => prev ? {
      ...prev,
      recentTransactions: [transaction, ...prev.recentTransactions.slice(0, 9)],
      totalRevenue: prev.totalRevenue + (transaction.type === 'income' ? transaction.amount : 0),
      totalExpenses: prev.totalExpenses + (transaction.type === 'expense' ? transaction.amount : 0),
      netProfit: prev.netProfit + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
    } : null)

    setNewTransaction({
      type: 'income',
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0]
    })
    
    setShowAddTransaction(false)
    toast.success('Transaction added successfully')
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const chartData = financialData ? monthNames.map((month, index) => ({
    month,
    revenue: financialData.monthlyRevenue[index] || 0,
    expenses: financialData.monthlyExpenses[index] || 0,
    profit: (financialData.monthlyRevenue[index] || 0) - (financialData.monthlyExpenses[index] || 0)
  })) : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!financialData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load financial data</p>
      </div>
    )
  }

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
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
              <p className="text-gray-400">Track revenue, expenses, and profitability</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2023, 2022].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddTransaction(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${financialData.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last year
                </p>
              </div>
              <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-400">${financialData.totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-red-400 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5% vs last year
                </p>
              </div>
              <div className="h-12 w-12 bg-red-600 rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Net Profit</p>
                <p className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(financialData.netProfit).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {Math.round((financialData.netProfit / financialData.totalRevenue) * 100)}% margin
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                financialData.netProfit >= 0 ? 'bg-green-600' : 'bg-red-600'
              }`}>
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Monthly</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${Math.round(financialData.totalRevenue / 12).toLocaleString()}
                </p>
                <p className="text-xs text-blue-400">Monthly revenue</p>
              </div>
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4 bg-slate-800/50 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Performance */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
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
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
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
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Sources */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={financialData.revenueBySource}
                        dataKey="amount"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {financialData.revenueBySource.map((entry, index) => (
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
                    </RechartsPieChart>
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
                  {financialData.revenueBySource.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{source.source}</span>
                        <span className="font-bold text-white">${source.amount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(source.amount / financialData.totalRevenue) * 100} 
                        className="h-2"
                        style={{ backgroundColor: source.color }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expense Categories */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={financialData.expensesByCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {financialData.expensesByCategory.map((entry, index) => (
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
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.expensesByCategory.map((expense) => (
                    <div key={expense.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{expense.category}</span>
                        <span className="font-bold text-white">${expense.amount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(expense.amount / financialData.totalExpenses) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-white" />
                        ) : (
                          <Receipt className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{transaction.description}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                          <Badge variant="outline" className={
                            transaction.status === 'completed' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Modal */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Type</Label>
                <Select 
                  value={newTransaction.type} 
                  onValueChange={(value: 'income' | 'expense') => 
                    setNewTransaction(prev => ({ ...prev, type: value, category: '' }))
                  }
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Category</Label>
                <Select 
                  value={newTransaction.category} 
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(newTransaction.type === 'income' ? INCOME_SOURCES : EXPENSE_CATEGORIES).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Input
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Transaction description..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTransaction.amount || ''}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Date</Label>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction} className="bg-green-600 hover:bg-green-700">
                Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 