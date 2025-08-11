"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Menu,
  X,
  Home,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Globe,
  Truck,
  Building,
  Music,
  Ticket,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  Target
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
  children?: NavigationItem[]
}

interface AnimatedNavigationProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
  { id: 'teams', label: 'Team Management', icon: Users, href: '/admin/dashboard/staff', badge: 12 },
  { id: 'events', label: 'Events', icon: Calendar, href: '/admin/dashboard/events', badge: 5 },
  { id: 'tours', label: 'Tours', icon: Globe, href: '/admin/dashboard/tours', badge: 3 },
  { id: 'logistics', label: 'Logistics', icon: Truck, href: '/admin/dashboard/logistics' },
  { id: 'artists', label: 'Artists', icon: Music, href: '/admin/dashboard/artists', badge: 8 },
  { id: 'ticketing', label: 'Ticketing', icon: Ticket, href: '/admin/dashboard/ticketing', badge: 156 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/dashboard/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' }
]

export function AnimatedNavigation({ 
  className = "",
  isCollapsed = false,
  onToggleCollapse
}: AnimatedNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isItemActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation Sidebar */}
      <nav
        className={`fixed left-0 top-0 h-full z-40 ${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900/90 border-r border-slate-700/50 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-200 ${className}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-purple-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Admin</h2>
                  <p className="text-xs text-gray-400">Dashboard</p>
                </div>
              </div>
            )}
            {!isCollapsed && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="text-gray-400">
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isItemActive(item.href) ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isItemActive(item.href) ? 'bg-gradient-to-r from-red-500 to-purple-600' : 'bg-slate-700/50'}`}>
                      <item.icon className={`h-4 w-4 ${isItemActive(item.href) ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {!isCollapsed && (
                      <span className={`font-medium ${isItemActive(item.href) ? 'text-white' : 'text-gray-300'}`}>{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && item.badge !== undefined && (
                    <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">{item.badge}</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/admin.png" />
              <AvatarFallback className="bg-gradient-to-r from-red-500 to-purple-600 text-white">A</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@tourify.com</p>
              </div>
            )}
            <Button variant="ghost" size="sm" className="text-gray-400">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-slate-900/90 border-t border-slate-700/50">
          <div className="flex items-center justify-around p-2">
            {navigationItems.slice(0, 4).map((item) => (
              <Link key={item.id} href={item.href}>
                <div className={`p-2 rounded-lg ${isItemActive(item.href) ? 'bg-gradient-to-r from-red-500 to-purple-600' : 'bg-slate-700/50'}`}>
                  <item.icon className={`h-5 w-5 ${isItemActive(item.href) ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default AnimatedNavigation 