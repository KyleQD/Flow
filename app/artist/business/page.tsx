"use client"

import { useState, useEffect, useMemo } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Share2, 
  BarChart2,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
  Target,
  Zap,
  CreditCard,
  FileText,
  Calendar,
  Briefcase,
  Music,
  MessageSquare,
  BookOpen,
  Settings,
  Download,
  Upload
} from "lucide-react"

interface BusinessStats {
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  activeProducts: number
  totalEvents: number
  totalTracks: number
  fanEngagement: number
  contractsActive: number
  expenses: number
  profit: number
}

interface Transaction {
  id: string
  type: 'revenue' | 'expense' | 'royalty' | 'merchandise' | 'event'
  description: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'failed'
  category: string
}

const businessFeatures = [
  { 
    label: "Financial Dashboard", 
    icon: DollarSign, 
    href: "/artist/business/financial", 
    description: "Track revenue, expenses, and financial analytics",
    color: "from-green-500 to-emerald-600",
    category: "finance",
    isActive: true
  },
  { 
    label: "Merchandise Store", 
    icon: ShoppingBag, 
    href: "/artist/features/merchandise", 
    description: "Manage products and online store",
    color: "from-blue-500 to-cyan-600",
    category: "commerce",
    isActive: true
  },
  { 
    label: "Contracts & Legal", 
    icon: FileText, 
    href: "/artist/business/contracts", 
    description: "Manage contracts and legal documents",
    color: "from-purple-500 to-violet-600",
    category: "legal",
    isActive: true
  },
  { 
    label: "Marketing Hub", 
    icon: Share2, 
    href: "/artist/business/marketing", 
    description: "Run campaigns and social media management",
    color: "from-pink-500 to-rose-600",
    category: "marketing",
    isActive: true
  },
  { 
    label: "Business Analytics", 
    icon: BarChart2, 
    href: "/artist/business/analytics", 
    description: "Revenue and business performance insights",
    color: "from-orange-500 to-red-600",
    category: "analytics",
    isActive: true
  },
  {
    label: "Team Collaboration",
    icon: Users,
    href: "/artist/business/collaboration",
    description: "Project management and team coordination",
    color: "from-indigo-500 to-purple-600",
    category: "projects",
    isActive: true
  },
  {
    label: "Fan Engagement",
    icon: MessageSquare,
    href: "/artist/business/fans",
    description: "Connect with fans and build community",
    color: "from-cyan-500 to-blue-600",
    category: "marketing",
    isActive: true
  },
  {
    label: "Business Education",
    icon: BookOpen,
    href: "/artist/business/education",
    description: "Learn business skills and industry insights",
    color: "from-yellow-500 to-orange-600",
    category: "education",
    isActive: true
  }
]

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

function BusinessFeatureCard({ feature, stats, index }: { 
  feature: typeof businessFeatures[0], 
  stats: any,
  index: number 
}) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={feature.href} className="block group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/10 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                {feature.isActive && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                {feature.label}
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                {feature.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {feature.category === 'finance' && `$${stats.totalRevenue?.toLocaleString() || 0} revenue`}
                  {feature.category === 'commerce' && `${stats.activeProducts || 0} products`}
                  {feature.category === 'legal' && `${stats.contractsActive || 0} contracts`}
                  {feature.category === 'marketing' && `${stats.fanEngagement || 0} engagement`}
                  {feature.category === 'analytics' && `${stats.totalTracks || 0} tracks`}
                  {feature.category === 'projects' && `${stats.totalEvents || 0} events`}
                  {feature.category === 'education' && 'Resources available'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
                  Open Dashboard →
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default function BusinessDashboard() {
  const { user, profile } = useArtist()
  const supabase = createClientComponentClient()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [businessStats, setBusinessStats] = useState<BusinessStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const initializeData = async () => {
      if (!isMounted) return

      if (user) {
        try {
          await loadBusinessData()
        } catch (error) {
          console.error('Error in loadBusinessData:', error)
          if (isMounted) {
            setIsLoading(false)
            setDefaultStats()
          }
        }
      } else {
        // Set default stats when no user
        setDefaultStats()
        setIsLoading(false)
      }
    }

    const setDefaultStats = () => {
      if (!isMounted) return
      
      setBusinessStats({
        totalRevenue: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        activeProducts: 0,
        totalEvents: 0,
        totalTracks: 0,
        fanEngagement: 0,
        contractsActive: 0,
        expenses: 0,
        profit: 0
      })
      setRecentTransactions([])
    }

    // Add timeout protection
    timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Business data loading timed out, using default data')
        setIsLoading(false)
        setDefaultStats()
      }
    }, 10000)

    initializeData()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user]) // Only depend on user

  useEffect(() => {
    return () => {
      setIsMounted(false)
    }
  }, [])

  const loadBusinessData = async () => {
    if (!user || !isMounted) return

    try {
      if (isMounted) {
        setIsLoading(true)
      }
      
      // Load business statistics in parallel with error handling for each query
      const [
        merchandiseData,
        eventsData,
        tracksData,
        // Add more data sources as they become available
      ] = await Promise.allSettled([
        supabase.from('artist_merchandise').select('*').eq('user_id', user.id),
        supabase.from('artist_events').select('*').eq('user_id', user.id),
        supabase.from('artist_works').select('*').eq('user_id', user.id).eq('type', 'music'),
      ])

      // Check if component is still mounted before proceeding
      if (!isMounted) return

      // Extract data from settled promises, providing fallbacks for failed queries
      const merchandiseResult = merchandiseData.status === 'fulfilled' ? merchandiseData.value : { data: [], error: null }
      const eventsResult = eventsData.status === 'fulfilled' ? eventsData.value : { data: [], error: null }
      const tracksResult = tracksData.status === 'fulfilled' ? tracksData.value : { data: [], error: null }

      // Calculate business metrics
      const now = new Date()
      const lastMonth = subMonths(now, 1)
      
      const activeProducts = merchandiseResult.data?.filter((p: any) => p.status === 'active').length || 0
      const totalEvents = eventsResult.data?.length || 0
      const totalTracks = tracksResult.data?.length || 0
      
      // Calculate revenue from merchandise (simplified calculation)
      const merchandiseRevenue = merchandiseResult.data?.reduce((sum: number, item: any) => {
        return sum + ((item.price || 0) * (item.units_sold || 0))
      }, 0) || 0
      
      // Calculate event revenue (simplified calculation)
      const eventRevenue = eventsResult.data?.reduce((sum: number, event: any) => {
        return sum + ((event.ticket_price_min || 0) * (event.expected_attendance || 0))
      }, 0) || 0
      
      const totalRevenue = merchandiseRevenue + eventRevenue
      
      // Mock some additional metrics for demo
      const monthlyRevenue = Math.round(totalRevenue * 0.3) // Assume 30% is from this month
      const revenueGrowth = Math.round(Math.random() * 20 + 5) // 5-25% growth
      const fanEngagement = Math.round(totalTracks * 150 + Math.random() * 500) // Simulate engagement
      const contractsActive = Math.floor(Math.random() * 5) + 1 // 1-5 contracts
      const expenses = Math.round(totalRevenue * 0.4) // 40% expenses
      const profit = totalRevenue - expenses

      // Only update state if component is still mounted
      if (isMounted) {
        setBusinessStats({
          totalRevenue,
          monthlyRevenue,
          revenueGrowth,
          activeProducts,
          totalEvents,
          totalTracks,
          fanEngagement,
          contractsActive,
          expenses,
          profit
        })

        // Generate mock transactions based on real data
        const transactions: Transaction[] = []
        
        // Add merchandise transactions
        merchandiseResult.data?.slice(0, 3).forEach((item: any, index: number) => {
          if (item.units_sold && item.units_sold > 0) {
            transactions.push({
              id: `merch-${item.id}`,
              type: 'merchandise',
              description: `${item.name} sales`,
              amount: (item.price || 0) * Math.min(item.units_sold, 5), // Show recent sales
              date: format(subMonths(now, Math.random() * 2), 'yyyy-MM-dd'),
              status: 'completed',
              category: 'merchandise'
            })
          }
        })
        
        // Add event transactions
        eventsResult.data?.slice(0, 2).forEach((event: any) => {
          if (event.ticket_price_min && event.expected_attendance) {
            transactions.push({
              id: `event-${event.id}`,
              type: 'event',
              description: `${event.title} tickets`,
              amount: event.ticket_price_min * Math.min(event.expected_attendance, 50), // Show partial sales
              date: format(new Date(event.event_date), 'yyyy-MM-dd'),
              status: event.status === 'completed' ? 'completed' : 'pending',
              category: 'events'
            })
          }
        })
        
        // Add some mock expenses
        transactions.push({
          id: 'expense-1',
          type: 'expense',
          description: 'Marketing campaign',
          amount: -250,
          date: format(subMonths(now, 0.5), 'yyyy-MM-dd'),
          status: 'completed',
          category: 'marketing'
        })
        
        setRecentTransactions(transactions.slice(0, 5))
      }
      
    } catch (error) {
      console.error('Error loading business data:', error)
      if (isMounted) {
        toast.error('Failed to load business data')
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  const filteredFeatures = useMemo(() => {
    return businessFeatures.filter(feature => {
      const matchesSearch = feature.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           feature.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || feature.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const categories = useMemo(() => {
    const cats = ["all", ...new Set(businessFeatures.map(f => f.category))]
    return cats.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: cat === "all" ? businessFeatures.length : businessFeatures.filter(f => f.category === cat).length
    }))
  }, [])

  const quickStats = useMemo(() => {
    if (!businessStats) return []
    
    return [
      { 
        label: "Total Revenue", 
        value: `$${businessStats.totalRevenue.toLocaleString()}`, 
        change: `+${businessStats.revenueGrowth}%`, 
        icon: DollarSign, 
        progress: Math.min((businessStats.totalRevenue / 10000) * 100, 100)
      },
      { 
        label: "Active Products", 
        value: businessStats.activeProducts.toString(), 
        change: `+${businessStats.totalEvents}`, 
        icon: ShoppingBag, 
        progress: Math.min((businessStats.activeProducts / 20) * 100, 100)
      },
      { 
        label: "Monthly Profit", 
        value: `$${businessStats.profit.toLocaleString()}`, 
        change: `+${Math.round((businessStats.profit / businessStats.totalRevenue) * 100)}%`, 
        icon: TrendingUp, 
        progress: Math.min((businessStats.profit / 5000) * 100, 100)
      },
    ]
  }, [businessStats])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-slate-700 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-96 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-blue-500">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Business Hub</h1>
            <p className="text-gray-400">Manage your music business and grow your revenue</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search business tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[250px] bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50"
            />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {businessStats && (
        <div className="grid gap-6 md:grid-cols-3">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-green-400 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Business Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filters */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-purple-400" />
                Business Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className={`transition-all duration-200 ${
                      selectedCategory === category.value
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-slate-700 text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    {category.label}
                    <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Features Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AnimatePresence mode="wait">
              {filteredFeatures.map((feature, index) => (
                <BusinessFeatureCard
                  key={feature.label}
                  feature={feature}
                  stats={businessStats}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-500 mb-4">No business tools found matching your criteria</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Recent Transactions & Quick Actions */}
        <div className="space-y-6">
          {/* Recent Transactions */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-400" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-400">
                Latest financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {transaction.description}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              transaction.status === "completed" 
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }`}
                          >
                            {transaction.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(transaction.date), 'MMM d')}
                          </span>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${
                        transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No recent transactions</p>
                  </div>
                )}
              </div>
              <Link href="/artist/business/financial">
                <Button variant="outline" className="w-full mt-4 border-slate-700 text-slate-300 hover:bg-slate-800/50">
                  View All Transactions
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Add Product", icon: ShoppingBag, href: "/artist/features/merchandise" },
                  { label: "Create Contract", icon: FileText, href: "/artist/business/contracts" },
                  { label: "New Campaign", icon: Target, href: "/artist/business/marketing" },
                  { label: "View Analytics", icon: BarChart2, href: "/artist/business/analytics" }
                ].map((action, index) => (
                  <Link key={action.label} href={action.href}>
                    <Button
                      variant="ghost"
                      className="h-16 w-full flex flex-col items-center justify-center space-y-1 hover:bg-slate-800/50 transition-all duration-200"
                    >
                      <action.icon className="h-5 w-5 text-purple-400" />
                      <span className="text-xs text-slate-300">{action.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 