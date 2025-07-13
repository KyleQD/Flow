"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/auth/admin"
import { 
  Calendar,
  MapPin,
  Users,
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  Music,
  Ticket,
  Globe,
  FileText,
  Home,
  ChevronRight,
  Crown,
  Zap,
  AlertTriangle,
  Activity,
  Headphones,
  Package
} from "lucide-react"

export default function AdminPage() {
  const { adminUser } = useAdminAuth()
  const router = useRouter()
  
  const tourManagementFeatures = [
    {
      title: "Event & Tour Dashboard",
      description: "Comprehensive real-time dashboard for managing tours, events, and logistics",
      icon: <Activity className="h-6 w-6 text-purple-500" />,
      href: "/admin/dashboard",
      status: "Core Feature",
      featured: true
    },
    {
      title: "Event Planning",
      description: "Create, schedule, and manage music events and tours",
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      href: "/admin/dashboard/events",
      status: "Available"
    },
    {
      title: "Tour Logistics",
      description: "Coordinate transportation, equipment, and venue logistics",
      icon: <Truck className="h-6 w-6 text-green-500" />,
      href: "/admin/dashboard/logistics",
      status: "Available"
    },
    {
      title: "Staff Management",
      description: "Manage tour staff, crew schedules, and responsibilities",
      icon: <Users className="h-6 w-6 text-orange-500" />,
      href: "/admin/dashboard/staff",
      status: "Available"
    },
    {
      title: "Financial Tracking",
      description: "Monitor budgets, expenses, and revenue across events",
      icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
      href: "/admin/dashboard/finances",
      status: "Available"
    },
    {
      title: "Venue Coordination",
      description: "Manage venue relationships and booking logistics",
      icon: <MapPin className="h-6 w-6 text-red-500" />,
      href: "/admin/dashboard/venues",
      status: "Available"
    }
  ]

  const systemTools = [
    {
      title: "Analytics & Reports",
      description: "View platform metrics, tour performance, and detailed reports",
      icon: <BarChart3 className="h-6 w-6 text-cyan-500" />,
      href: "/admin/dashboard/analytics",
      status: "Available"
    },
    {
      title: "Artist Management",
      description: "Coordinate with artists, manage contracts and requirements",
      icon: <Music className="h-6 w-6 text-pink-500" />,
      href: "/admin/dashboard/music",
      status: "Available"
    },
    {
      title: "Ticketing System",
      description: "Manage ticket sales, pricing, and distribution",
      icon: <Ticket className="h-6 w-6 text-indigo-500" />,
      href: "/admin/dashboard/ticketing",
      status: "Available"
    },
    {
      title: "Communications",
      description: "Team communication, announcements, and coordination tools",
      icon: <Headphones className="h-6 w-6 text-teal-500" />,
      href: "/admin/dashboard/communications",
      status: "Available"
    }
  ]

  const quickActions = [
    {
      title: "Launch Main Dashboard",
      description: "Access the comprehensive tour and event management dashboard",
      icon: <Activity className="h-5 w-5" />,
      action: () => router.push("/admin/dashboard"),
      buttonText: "Open Dashboard",
      primary: true
    },
    {
      title: "Create New Event",
      description: "Set up a new event or tour date",
      icon: <Calendar className="h-5 w-5" />,
      action: () => router.push("/admin/dashboard/events"),
      buttonText: "New Event"
    },
    {
      title: "Staff Coordination",
      description: "Manage tour staff and crew assignments",
      icon: <Users className="h-5 w-5" />,
      action: () => router.push("/admin/dashboard/staff"),
      buttonText: "Manage Staff"
    }
  ]
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tour & Event Management</h1>
            <p className="text-slate-400">
              Welcome to your organizer dashboard, {adminUser?.email}. Manage tours, events, and logistics.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => router.push("/admin/dashboard")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Activity className="mr-2 h-4 w-4" />
              Open Dashboard
            </Button>
            <Link 
              href="/"
              className="flex items-center px-4 py-2 text-sm rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Dashboard Card */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30 hover:border-purple-400/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-purple-400" />
              <div>
                <CardTitle className="text-xl text-white">Event & Tour Dashboard</CardTitle>
                <CardDescription className="text-purple-200">
                  Your central hub for managing all tour and event operations
                </CardDescription>
              </div>
            </div>
            <span className="px-3 py-1 bg-purple-600/30 text-purple-300 text-sm rounded-full border border-purple-500/50">
              Core Feature
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">
            Real-time dashboard with event timeline, task management, logistics coordination, 
            staff tracking, and financial monitoring. Everything you need to manage successful tours and events.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-green-400">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                Live Data
              </span>
              <span className="flex items-center text-blue-400">
                <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
                Real-time Updates
              </span>
              <span className="flex items-center text-purple-400">
                <div className="h-2 w-2 bg-purple-400 rounded-full mr-2"></div>
                Interactive Timeline
              </span>
            </div>
            <Button
              onClick={() => router.push("/admin/dashboard")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Launch Dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tour Management Features */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Music className="mr-2 h-5 w-5 text-purple-500" />
          Tour Management Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tourManagementFeatures.map((feature, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feature.featured 
                      ? 'bg-purple-600/20 text-purple-400' 
                      : 'bg-green-600/20 text-green-400'
                  }`}>
                    {feature.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 mb-4">
                  {feature.description}
                </CardDescription>
                <Link
                  href={feature.href}
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Access Feature
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Tools */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5 text-slate-400" />
          Additional Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemTools.map((tool, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  {tool.icon}
                  <CardTitle className="text-base text-white">{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 mb-4 text-sm">
                  {tool.description}
                </CardDescription>
                <Link
                  href={tool.href}
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Access
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="mr-2 h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-slate-400">
            Fast access to frequently used tour management functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                action.primary 
                  ? 'bg-purple-600/20 border border-purple-500/50' 
                  : 'bg-slate-700/50'
              }`}>
                <div className="flex items-center mb-2">
                  {action.icon}
                  <h3 className="ml-2 font-medium text-white">{action.title}</h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">{action.description}</p>
                <Button
                  onClick={action.action}
                  variant={action.primary ? "default" : "outline"}
                  size="sm"
                  className={action.primary 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "border-slate-600 text-slate-300 hover:bg-slate-600"
                  }
                >
                  {action.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organizer Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Crown className="mr-2 h-5 w-5 text-purple-500" />
            Organizer Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Access Level:</span>
              <span className="ml-2 text-white font-medium">
                {adminUser?.adminLevel?.toUpperCase() || 'ORGANIZER'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Account Type:</span>
              <span className="ml-2 text-white font-medium">
                Event & Tour Management
              </span>
            </div>
            <div>
              <span className="text-slate-400">Organization:</span>
              <span className="ml-2 text-white font-medium">
                Tour Management Professional
              </span>
            </div>
            <div>
              <span className="text-slate-400">Multi-Account Access:</span>
              <span className="ml-2 text-green-400 font-medium">
                Full Platform Access
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 