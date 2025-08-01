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
import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { Separator } from "../../../../components/ui/separator"
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
  status: 'live' | 'preparing' | 'upcoming'
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
    badgeColor: "bg-blue-500/20 text-blue-400"
  },
  { 
    label: "Staff & Crew", 
    href: "/admin/dashboard/staff", 
    icon: Users,
    badge: "28",
    badgeColor: "bg-cyan-500/20 text-cyan-400"
  },
  { 
    label: "Logistics", 
    href: "/admin/dashboard/logistics", 
    icon: Truck,
    badge: "Active",
    badgeColor: "bg-yellow-500/20 text-yellow-400"
  },
  { 
    label: "Finances", 
    href: "/admin/dashboard/finances", 
    icon: DollarSign,
    badge: "$485K",
    badgeColor: "bg-green-500/20 text-green-400"
  },
  { 
    label: "Analytics", 
    href: "/admin/dashboard/analytics", 
    icon: BarChart3,
    badge: "Reports",
    badgeColor: "bg-cyan-500/20 text-cyan-400"
  },
  { 
    label: "Settings", 
    href: "/admin/dashboard/settings", 
    icon: SettingsIcon
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
    <div className={`flex flex-col h-screen bg-slate-950/95 backdrop-blur-sm border-r border-slate-800/50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-slate-400">Event Management</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isExpanded = expandedItems.includes(item.href)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.href}>
                <div className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 group text-sm ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30' 
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} />
                      {!isCollapsed && (
                        <span className="font-medium truncate">{item.label}</span>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {item.badge && (
                          <Badge className={`text-xs px-1.5 py-0.5 ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                            {item.badge}
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
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
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
                      className="ml-3 mt-1 space-y-0.5"
                    >
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 text-sm ${
                              isChildActive 
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                                : 'hover:bg-slate-800/30 text-slate-400 hover:text-white'
                            }`}
                          >
                            <child.icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{child.label}</span>
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

      {/* Live Events - Compact */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/50">
          <Suspense fallback={<div className="h-20 bg-slate-800/30 rounded-lg animate-pulse" />}>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    <Radio className="h-3 w-3 mr-1.5 text-red-400" />
                    Live Events
                  </h3>
                  <Badge className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5">
                    {activeEvents.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {activeEvents.slice(0, 1).map((event) => (
                    <div key={event.id} className="bg-slate-800/50 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-medium text-white truncate">{event.title}</h4>
                        <Badge className={`text-xs px-1.5 py-0.5 ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                          <span className="ml-1 capitalize">{event.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{event.venue}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-1">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all duration-500"
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
              </CardContent>
            </Card>
          </Suspense>
        </div>
      )}

      {/* Quick Actions - Compact */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="flex space-x-1.5">
            <Button
              size="sm"
              className="flex-1 h-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
