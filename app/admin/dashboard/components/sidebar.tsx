"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Globe,
  Calendar,
  Ticket,
  Truck,
  Users,
  DollarSign,
  Package,
  MessageSquare,
  Settings as SettingsIcon,
  Music,
  Building,
  BarChart3,
  Shield,
  FileText,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
  Award,
  Crown,
  Target,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Eye,
  Heart,
  Sparkles,
  Coffee,
  Headphones,
  Radio,
  Mic,
  Camera,
  Volume2,
  Plus,
  Menu,
  X,
  Handshake,
  Settings
} from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Separator } from "./ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { Suspense } from "react"

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
  badgeColor?: string
  children?: NavItem[]
  isNew?: boolean
  isPro?: boolean
}

interface ActiveEvent {
  id: string
  title: string
  date: string
  status: 'live' | 'upcoming' | 'preparing'
  venue: string
  artist: string
  progress: number
}

const navItems: NavItem[] = [
  { 
    label: "Dashboard", 
    href: "/admin/dashboard", 
    icon: Home,
    badge: "Overview"
  },
  { 
    label: "Tours", 
    href: "/admin/dashboard/tours", 
    icon: Globe,
    badge: "3",
    badgeColor: "bg-purple-500/20 text-purple-400",
    children: [
      { label: "Active Tours", href: "/admin/dashboard/tours/active", icon: Activity },
      { label: "Planning", href: "/admin/dashboard/tours/planning", icon: Target },
      { label: "Archive", href: "/admin/dashboard/tours/archive", icon: Package }
    ]
  },
  { 
    label: "Events", 
    href: "/admin/dashboard/events", 
    icon: Calendar,
    badge: "12",
    badgeColor: "bg-green-500/20 text-green-400",
    children: [
      { label: "Upcoming", href: "/admin/dashboard/events/upcoming", icon: Clock },
      { label: "Live Events", href: "/admin/dashboard/events/live", icon: Radio },
      { label: "Past Events", href: "/admin/dashboard/events/past", icon: Award }
    ]
  },
  { 
    label: "Artists", 
    href: "/admin/dashboard/artists", 
    icon: Music,
    badge: "156",
    badgeColor: "bg-pink-500/20 text-pink-400",
    children: [
      { label: "Active Artists", href: "/admin/dashboard/artists/active", icon: Mic },
      { label: "Bookings", href: "/admin/dashboard/artists/bookings", icon: Calendar },
      { label: "Contracts", href: "/admin/dashboard/artists/contracts", icon: FileText }
    ]
  },
  { 
    label: "Venues", 
    href: "/admin/dashboard/venues", 
    icon: Building,
    badge: "89",
    badgeColor: "bg-orange-500/20 text-orange-400",
    children: [
      { label: "Partner Venues", href: "/admin/dashboard/venues/partners", icon: Sparkles },
      { label: "Requests", href: "/admin/dashboard/venues/requests", icon: Bell },
      { label: "Contracts", href: "/admin/dashboard/venues/contracts", icon: FileText }
    ]
  },
  { 
    label: "Ticketing", 
    href: "/admin/dashboard/ticketing", 
    icon: Ticket,
    badge: "18.7K",
    badgeColor: "bg-blue-500/20 text-blue-400",
    children: [
      { label: "Sales Dashboard", href: "/admin/dashboard/ticketing/sales", icon: TrendingUp },
      { label: "Pricing", href: "/admin/dashboard/ticketing/pricing", icon: DollarSign },
      { label: "Distribution", href: "/admin/dashboard/ticketing/distribution", icon: Package }
    ]
  },
  { 
    label: "Staff & Crew", 
    href: "/admin/dashboard/staff", 
    icon: Users,
    badge: "28",
    badgeColor: "bg-cyan-500/20 text-cyan-400",
    children: [
      { label: "Team Members", href: "/admin/dashboard/staff/team", icon: Users },
      { label: "Contractors", href: "/admin/dashboard/staff/contractors", icon: Handshake },
      { label: "Schedules", href: "/admin/dashboard/staff/schedules", icon: Calendar }
    ]
  },
  { 
    label: "Logistics", 
    href: "/admin/dashboard/logistics", 
    icon: Truck,
    badge: "Active",
    badgeColor: "bg-yellow-500/20 text-yellow-400",
    children: [
      { label: "Transportation", href: "/admin/dashboard/logistics/transport", icon: Truck },
      { label: "Equipment", href: "/admin/dashboard/logistics/equipment", icon: Package },
      { label: "Catering", href: "/admin/dashboard/logistics/catering", icon: Coffee }
    ]
  },
  { 
    label: "Finances", 
    href: "/admin/dashboard/finances", 
    icon: DollarSign,
    badge: "$485K",
    badgeColor: "bg-green-500/20 text-green-400",
    children: [
      { label: "Revenue", href: "/admin/dashboard/finances/revenue", icon: TrendingUp },
      { label: "Expenses", href: "/admin/dashboard/finances/expenses", icon: DollarSign },
      { label: "Budgets", href: "/admin/dashboard/finances/budgets", icon: Target }
    ]
  },
  { 
    label: "Inventory", 
    href: "/admin/dashboard/inventory", 
    icon: Package,
    badge: "248",
    badgeColor: "bg-indigo-500/20 text-indigo-400",
    children: [
      { label: "Equipment", href: "/admin/dashboard/inventory/equipment", icon: Headphones },
      { label: "Supplies", href: "/admin/dashboard/inventory/supplies", icon: Package },
      { label: "Maintenance", href: "/admin/dashboard/inventory/maintenance", icon: SettingsIcon }
    ]
  },
  { 
    label: "Communications", 
    href: "/admin/dashboard/communications", 
    icon: MessageSquare,
    badge: "5",
    badgeColor: "bg-purple-500/20 text-purple-400",
    children: [
      { label: "Messages", href: "/admin/dashboard/communications/messages", icon: MessageSquare },
      { label: "Announcements", href: "/admin/dashboard/communications/announcements", icon: Bell },
      { label: "Templates", href: "/admin/dashboard/communications/templates", icon: FileText }
    ]
  },
  { 
    label: "Analytics", 
    href: "/admin/dashboard/analytics", 
    icon: BarChart3,
    badge: "Reports",
    badgeColor: "bg-cyan-500/20 text-cyan-400",
    children: [
      { label: "Performance", href: "/admin/dashboard/analytics/performance", icon: TrendingUp },
      { label: "Audience", href: "/admin/dashboard/analytics/audience", icon: Eye },
      { label: "Revenue", href: "/admin/dashboard/analytics/revenue", icon: DollarSign }
    ]
  },
  { 
    label: "Settings", 
    href: "/admin/dashboard/settings", 
    icon: SettingsIcon,
    children: [
      { label: "General", href: "/admin/dashboard/settings/general", icon: SettingsIcon },
      { label: "Security", href: "/admin/dashboard/settings/security", icon: Shield },
      { label: "Integrations", href: "/admin/dashboard/settings/integrations", icon: Zap }
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([
    {
      id: '1',
      title: 'Summer Music Festival',
      date: 'Today',
      status: 'live',
      venue: 'Central Park',
      artist: 'The Electric Waves',
      progress: 75
    },
    {
      id: '2',
      title: 'Indie Rock Night',
      date: 'Tomorrow',
      status: 'preparing',
      venue: 'Madison Square Garden',
      artist: 'Acoustic Soul',
      progress: 90
    },
    {
      id: '3',
      title: 'Electronic Showcase',
      date: 'Jul 22',
      status: 'upcoming',
      venue: 'Brooklyn Warehouse',
      artist: 'DJ Luna',
      progress: 45
    }
  ])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.children?.some(child => 
      child.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'preparing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Radio className="h-3 w-3" />
      case 'preparing': return <Clock className="h-3 w-3" />
      case 'upcoming': return <Calendar className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  return (
    <div className={`flex flex-col h-screen bg-slate-950/95 backdrop-blur-sm border-r border-slate-800/50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-slate-400">Event Management</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isExpanded = expandedItems.includes(item.href)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.href}>
                <div className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30' 
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} />
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <Badge className={`text-xs ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                            {item.badge}
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            New
                          </Badge>
                        )}
                        {item.isPro && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                        {hasChildren && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault()
                              toggleExpanded(item.href)
                            }}
                            className="p-0 h-auto text-slate-400 hover:text-white"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </Link>
                </div>

                {/* Submenu */}
                {hasChildren && isExpanded && !isCollapsed && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-4 mt-2 space-y-1"
                    >
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${
                              isChildActive 
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                                : 'hover:bg-slate-800/30 text-slate-400 hover:text-white'
                            }`}
                          >
                            <child.icon className="h-4 w-4" />
                            <span className="text-sm">{child.label}</span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Active Events */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/50">
          <Suspense fallback={<div className="animate-pulse bg-slate-800 h-48 rounded-lg"></div>}>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Live Events</h3>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <Radio className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <div className="space-y-3">
                  {activeEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded-full ${getStatusColor(event.status)}`}>
                            {getStatusIcon(event.status)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {event.venue}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {event.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${event.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">
                          {event.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-slate-400 hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </Suspense>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="flex space-x-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
