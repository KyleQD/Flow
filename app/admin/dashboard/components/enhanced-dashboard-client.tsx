"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { EnhancedMetricCard, RevenueMetricCard, TeamMetricCard, PerformanceMetricCard } from "../../components/enhanced-metric-card"
import { themeUtils } from "../../utils/theme-utils"
import DashboardCalendar from "./dashboard-calendar"
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Truck,
  Target,
  CheckCircle,
  Search,
  Plus,
  RefreshCw,
  Ticket,
  Globe,
  Building,
  Music,
  BarChart3,
  MessageSquare,
  AlertCircle,
  Clock
} from "lucide-react"

interface DashboardStats {
  totalTours: number
  activeTours: number
  totalEvents: number
  upcomingEvents: number
  totalArtists: number
  totalVenues: number
  totalRevenue: number
  monthlyRevenue: number
  ticketsSold: number
  totalCapacity: number
  staffMembers: number
  completedTasks: number
  pendingTasks: number
  averageRating: number
  totalTravelGroups: number
  totalTravelers: number
  confirmedTravelers: number
  coordinationCompletionRate: number
  fullyCoordinatedGroups: number
  activeTransportation: number
  completedTransportation: number
  logisticsCompletionRate: number
}

export default function EnhancedDashboardClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItemData[]>([])

  const [threadsLoading, setThreadsLoading] = useState(true)
  const [threadsError, setThreadsError] = useState<string | null>(null)
  const [groupMessages, setGroupMessages] = useState<MessageItemData[]>([])

  const mockStats: DashboardStats = {
    totalTours: 12,
    activeTours: 5,
    totalEvents: 48,
    upcomingEvents: 15,
    totalArtists: 24,
    totalVenues: 18,
    totalRevenue: 1250000,
    monthlyRevenue: 180000,
    ticketsSold: 15420,
    totalCapacity: 25000,
    staffMembers: 156,
    completedTasks: 89,
    pendingTasks: 23,
    averageRating: 4.8,
    totalTravelGroups: 8,
    totalTravelers: 156,
    confirmedTravelers: 142,
    coordinationCompletionRate: 91,
    fullyCoordinatedGroups: 6,
    activeTransportation: 12,
    completedTransportation: 8,
    logisticsCompletionRate: 87
  }

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/admin/dashboard/stats')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed'))) 
      .then(json => setStats(json.stats || mockStats))
      .catch(() => setStats(mockStats))
      .finally(() => {
        setIsLoading(false)
        setLastUpdate(new Date())
      })
  }, [])

  useEffect(() => {
    setTasksLoading(true)
    fetch('/api/admin/tasks?range=week')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed')))
      .then(json => {
        const mapped: TaskItemData[] = (json.tasks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          priority: (t.priority || 'medium') as TaskItemData['priority'],
          dueLabel: new Date(t.dueAt).toDateString().slice(0, 10),
          assignee: t.assignee || 'Unassigned',
          progress: t.progress || 0
        }))
        setUpcomingTasks(mapped)
      })
      .catch(err => setTasksError(err.message))
      .finally(() => setTasksLoading(false))
  }, [])

  useEffect(() => {
    setThreadsLoading(true)
    fetch('/api/admin/messages/threads')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed')))
      .then(json => {
        const mapped: MessageItemData[] = (json.threads || []).map((th: any) => ({
          id: th.id,
          group: th.groupName,
          last: th.lastMessage,
          unread: th.unreadCount || 0
        }))
        setGroupMessages(mapped)
      })
      .catch(err => setThreadsError(err.message))
      .finally(() => setThreadsLoading(false))
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsLoading(false)
    }, 400)
  }

  const recentActivities = [
    { id: 1, type: 'event', title: 'New event created', description: 'Summer Music Festival 2024', time: '2m ago', icon: Calendar },
    { id: 2, type: 'team', title: 'Team member added', description: 'Sarah Johnson joined as Coordinator', time: '15m ago', icon: Users },
    { id: 3, type: 'revenue', title: 'Revenue milestone', description: 'Monthly revenue target exceeded', time: '1h ago', icon: DollarSign },
    { id: 4, type: 'logistics', title: 'Transportation confirmed', description: 'Weekend tour vehicles confirmed', time: '2h ago', icon: Truck }
  ]

  const quickAccess = [
    { id: 'tours', title: 'Tours', href: '/admin/dashboard/tours', icon: Globe, metric: stats?.activeTours || 0, sub: 'Active' },
    { id: 'events', title: 'Events', href: '/admin/dashboard/events', icon: Calendar, metric: stats?.upcomingEvents || 0, sub: 'Upcoming' },
    { id: 'artists', title: 'Artists', href: '/admin/dashboard/artists', icon: Music, metric: stats?.totalArtists || 0, sub: 'Total' },
    { id: 'venues', title: 'Venues', href: '/admin/dashboard/venues', icon: Building, metric: stats?.totalVenues || 0, sub: 'Total' },
    { id: 'ticketing', title: 'Ticketing', href: '/admin/dashboard/ticketing', icon: Ticket, metric: stats?.ticketsSold || 0, sub: 'Sold' },
    { id: 'logistics', title: 'Logistics', href: '/admin/dashboard/logistics', icon: Truck, metric: stats?.logisticsCompletionRate || 0, sub: 'Completion %' },
    { id: 'teams', title: 'Team Mgmt', href: '/admin/dashboard/staff', icon: Users, metric: stats?.staffMembers || 0, sub: 'Members' },
    { id: 'analytics', title: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3, metric: stats?.monthlyRevenue || 0, sub: 'Monthly $' }
  ]

  const upcomingEvents = [
    { id: 'ev1', title: 'Summer Music Night', date: 'Mon 12', venue: 'Main Hall' },
    { id: 'ev2', title: 'Indie Fest', date: 'Wed 14', venue: 'City Arena' },
    { id: 'ev3', title: 'Jazz Evening', date: 'Fri 16', venue: 'Blue Note' },
    { id: 'ev4', title: 'Rock Live', date: 'Sun 18', venue: 'Open Stage' },
    { id: 'ev5', title: 'Acoustic Session', date: 'Tue 20', venue: 'Lounge' }
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Comprehensive event and tour management platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} disabled={isLoading} className={themeUtils.getButtonClasses('outline')}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className={themeUtils.getButtonClasses('primary')}>
            <Link href="/admin/dashboard/events/new"><Plus className="h-4 w-4 mr-2" />New Event</Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events, teams, or analytics..." className="pl-10 admin-metric-card border-slate-700 text-white placeholder:text-gray-400" />
      </div>

      {/* Three-column primary layout: Tasks | Calendar (center) | Group Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Tasks */}
        <WindowCard
          title="Upcoming Tasks"
          icon={CheckCircle}
          actions={
            <div className="flex items-center gap-2">
              <Badge className={themeUtils.getPriorityClasses('urgent' as any)} aria-label="pending-tasks">
                {stats?.pendingTasks || upcomingTasks.length} pending
              </Badge>
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Link href="/admin/dashboard/staff">Manage</Link>
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {tasksLoading && (
              <div className="space-y-2">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            )}
            {!tasksLoading && tasksError && (
              <EmptyState icon={AlertCircle} title="Failed to load tasks" subtitle={tasksError} actionLabel="Retry" onAction={() => location.reload()} />
            )}
            {!tasksLoading && !tasksError && upcomingTasks.length === 0 && (
              <EmptyState icon={CheckCircle} title="No tasks for this range" subtitle="Great job!" actionLabel="Create task" onAction={() => (window.location.href = '/admin/dashboard/staff/tasks/new')} />
            )}
            {!tasksLoading && !tasksError && upcomingTasks.map(task => (
              <TaskItem key={task.id} data={task} />
            ))}
            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm"><Link href="/admin/dashboard/staff/tasks">View all tasks</Link></Button>
            </div>
          </div>
        </WindowCard>

        {/* Center: Prominent Calendar */}
        <WindowCard
          title="Calendar"
          icon={Calendar}
          actions={
            <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white"><Link href="/admin/dashboard/calendar">Open</Link></Button>
          }
        >
          <DashboardCalendar className="rounded-xl" />
        </WindowCard>

        {/* Right: Group Messages Snapshot */}
        <WindowCard
          title="Group Messages"
          icon={MessageSquare}
          actions={
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white"><Link href="/admin/dashboard/messages">Open</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/admin/dashboard/messages/new">Broadcast</Link></Button>
            </div>
          }
        >
          <div className="space-y-3">
            {threadsLoading && (
              <div className="space-y-2">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            )}
            {!threadsLoading && threadsError && (
              <EmptyState icon={AlertCircle} title="Failed to load messages" subtitle={threadsError} actionLabel="Retry" onAction={() => location.reload()} />
            )}
            {!threadsLoading && !threadsError && groupMessages.length === 0 && (
              <EmptyState icon={MessageSquare} title="No recent group messages" subtitle="Start a broadcast to reach your team" actionLabel="Broadcast" onAction={() => (window.location.href = '/admin/dashboard/messages/new')} />
            )}
            {!threadsLoading && !threadsError && groupMessages.map(g => (
              <MessageItem key={g.id} data={g} />
            ))}
          </div>
        </WindowCard>
      </div>

      {/* Quick Access Windows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickAccess.map((qa) => (
          <QuickAccessCard key={qa.id} title={qa.title} href={qa.href} icon={qa.icon} metric={qa.metric} sub={qa.sub} />
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueMetricCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} change={12.5} trend="up" progress={75} lastUpdated={lastUpdate} status="success" />
        <TeamMetricCard title="Active Team Members" value={stats?.staffMembers || 0} change={8.2} trend="up" progress={85} lastUpdated={lastUpdate} status="info" />
        <PerformanceMetricCard title="Upcoming Events" value={stats?.upcomingEvents || 0} change={-2.1} trend="down" progress={60} lastUpdated={lastUpdate} status="warning" />
        <EnhancedMetricCard title="Tickets Sold" value={stats?.ticketsSold || 0} change={15.3} trend="up" progress={92} icon={Ticket} variant="accent" lastUpdated={lastUpdate} status="success" />
      </div>

      {/* Overview Tabs (kept minimal) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="admin-metric-card p-1 grid grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">Overview</TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-slate-700">Teams</TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-slate-700">Events</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Analytics</TabsTrigger>
          <TabsTrigger value="logistics" className="data-[state=active]:bg-slate-700">Logistics</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WindowCard title="Recent Activity" icon={AlertCircle}>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-500/20"><activity.icon className="h-4 w-4 text-white" /></div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </WindowCard>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <WindowCard title="Team Management" icon={Users}>
            <p className="text-gray-400">Team management content coming soon...</p>
          </WindowCard>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <WindowCard title="Event Management" icon={Calendar}>
            <p className="text-gray-400">Event management content coming soon...</p>
          </WindowCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <WindowCard title="Analytics Dashboard" icon={BarChart3}>
            <p className="text-gray-400">Analytics content coming soon...</p>
          </WindowCard>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-6">
          <WindowCard title="Logistics Management" icon={Truck}>
            <p className="text-gray-400">Logistics content coming soon...</p>
          </WindowCard>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <WindowCard title="Activity Feed" icon={AlertCircle}>
            <p className="text-gray-400">Activity feed content coming soon...</p>
          </WindowCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Subcomponents

interface WindowCardProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
  children: React.ReactNode
}

function WindowCard({ title, icon: Icon, actions, children }: WindowCardProps) {
  return (
    <Card className={themeUtils.getCardClasses('elevated')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-purple-600"><Icon className="h-4 w-4 text-white" /></div>
            <CardTitle className="text-white text-base">{title}</CardTitle>
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface TaskItemData {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueLabel: string
  assignee: string
  progress: number
}

function TaskItem({ data }: { data: TaskItemData }) {
  const priorityColor = {
    urgent: 'bg-red-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-500'
  }[data.priority]

  return (
    <div className="relative p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityColor} rounded-l-lg`} />
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-white font-medium pr-2 truncate" title={data.title}>{data.title}</h4>
        <div className="flex items-center gap-2">
          <Badge className={themeUtils.getPriorityClasses(data.priority)}>{data.priority}</Badge>
          <Badge className="bg-slate-700 text-slate-300 border-0">Due {data.dueLabel}</Badge>
        </div>
      </div>
      <p className="text-gray-400 text-xs mb-2 truncate">Assigned to {data.assignee}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{data.progress}%</span>
        </div>
        <Progress value={data.progress} className="h-2" />
      </div>
    </div>
  )
}

interface MessageItemData {
  id: string
  group: string
  last: string
  unread: number
}

function MessageItem({ data }: { data: MessageItemData }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className="min-w-0">
        <p className="text-white font-medium truncate" title={data.group}>{data.group}</p>
        <p className="text-gray-400 text-sm truncate max-w-[240px]" title={data.last}>{data.last}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={data.unread > 0 ? "bg-red-500/20 text-red-400 border-0" : "bg-slate-700 text-slate-300 border-0"}>{data.unread} new</Badge>
        <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white"><Link href="/admin/dashboard/messages">Open</Link></Button>
      </div>
    </div>
  )
}

interface QuickAccessCardProps {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  metric: number
  sub: string
}

function QuickAccessCard({ title, href, icon: Icon, metric, sub }: QuickAccessCardProps) {
  return (
    <Card className={themeUtils.getCardClasses('elevated')}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-purple-600"><Icon className="h-4 w-4 text-white" /></div>
            <span>{title}</span>
          </div>
          <Badge className="bg-slate-700 text-slate-200 border-0 text-xs">{metric} {sub}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" size="sm"><Link href={href}>Open</Link></Button>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white"><Link href={`${href}`}>Manage</Link></Button>
            <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white"><Link href={`${href}/new`}>Create</Link></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 

// Utility skeleton and empty components
function SkeletonRow() {
  return <div className="h-12 rounded-lg bg-slate-800/60" />
}

function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="rounded-xl border border-slate-700/50 p-4 text-center">
      <div className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80">
        <Icon className="h-4 w-4 text-slate-300" />
      </div>
      <p className="text-white font-medium">{title}</p>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      {actionLabel && (
        <Button size="sm" variant="outline" className="mt-3" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
} 