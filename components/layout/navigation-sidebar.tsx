"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { UserProfile } from '@/lib/auth/role-based-auth'
import { themeUtils } from '@/lib/design-system/theme'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  Music,
  Truck,
  Building2,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  Search,
  Plus
} from 'lucide-react'

// =============================================================================
// NAVIGATION CONFIGURATION BY ROLE
// =============================================================================

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string | number
  description?: string
  children?: NavItem[]
}

interface RoleNavConfig {
  primary: NavItem[]
  secondary: NavItem[]
  tools: NavItem[]
}

const navigationConfig: Record<string, RoleNavConfig> = {
  admin: {
    primary: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: Home, description: 'Platform overview' },
      { label: 'Tours', href: '/admin/tours', icon: Calendar, description: 'Manage all tours' },
      { label: 'Events', href: '/admin/events', icon: MapPin, description: 'Event management' },
      { label: 'Communications', href: '/admin/communications', icon: MessageSquare, badge: 'Live', description: 'Real-time messaging' },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'Platform insights' }
    ],
    secondary: [
      { label: 'Staff Management', href: '/admin/staff', icon: Users, description: 'Team coordination' },
      { label: 'Venues', href: '/admin/venues', icon: Building2, description: 'Venue directory' },
      { label: 'Vendors', href: '/admin/vendors', icon: Truck, description: 'Vendor management' }
    ],
    tools: [
      { label: 'Settings', href: '/admin/settings', icon: Settings, description: 'Platform configuration' },
      { label: 'User Management', href: '/admin/users', icon: Shield, description: 'Access control' }
    ]
  },

  manager: {
    primary: [
      { label: 'Dashboard', href: '/manager/dashboard', icon: Home, description: 'Management overview' },
      { label: 'Tours', href: '/manager/tours', icon: Calendar, description: 'Tour operations' },
      { label: 'Team', href: '/manager/team', icon: Users, description: 'Team management' },
      { label: 'Communications', href: '/manager/communications', icon: MessageSquare, badge: 'Live', description: 'Team coordination' },
      { label: 'Reports', href: '/manager/reports', icon: BarChart3, description: 'Performance reports' }
    ],
    secondary: [
      { label: 'Events', href: '/manager/events', icon: MapPin, description: 'Event oversight' },
      { label: 'Venues', href: '/manager/venues', icon: Building2, description: 'Venue coordination' }
    ],
    tools: [
      { label: 'Settings', href: '/manager/settings', icon: Settings, description: 'Preferences' }
    ]
  },

  tour_manager: {
    primary: [
      { label: 'Tour Dashboard', href: '/tour/dashboard', icon: Home, description: 'Current tour status' },
      { label: 'Schedule', href: '/tour/schedule', icon: Calendar, description: 'Tour timeline' },
      { label: 'Crew', href: '/tour/crew', icon: Users, description: 'Crew coordination' },
      { label: 'Communications', href: '/tour/communications', icon: MessageSquare, badge: 'Live', description: 'Team chat' },
      { label: 'Logistics', href: '/tour/logistics', icon: Truck, description: 'Transportation & equipment' }
    ],
    secondary: [
      { label: 'Venues', href: '/tour/venues', icon: Building2, description: 'Venue coordination' },
      { label: 'Budget', href: '/tour/budget', icon: BarChart3, description: 'Financial tracking' }
    ],
    tools: [
      { label: 'Settings', href: '/tour/settings', icon: Settings, description: 'Tour preferences' }
    ]
  },

  event_coordinator: {
    primary: [
      { label: 'Events', href: '/events/dashboard', icon: Home, description: 'Event management' },
      { label: 'Schedule', href: '/events/schedule', icon: Calendar, description: 'Event timeline' },
      { label: 'Staff', href: '/events/staff', icon: Users, description: 'Event staffing' },
      { label: 'Communications', href: '/events/communications', icon: MessageSquare, description: 'Event coordination' }
    ],
    secondary: [
      { label: 'Venues', href: '/events/venues', icon: Building2, description: 'Venue management' },
      { label: 'Reports', href: '/events/reports', icon: BarChart3, description: 'Event reports' }
    ],
    tools: [
      { label: 'Settings', href: '/events/settings', icon: Settings, description: 'Preferences' }
    ]
  },

  artist: {
    primary: [
      { label: 'My Dashboard', href: '/artist/dashboard', icon: Home, description: 'Performance overview' },
      { label: 'Schedule', href: '/artist/schedule', icon: Calendar, description: 'Upcoming performances' },
      { label: 'Music & Media', href: '/artist/music', icon: Music, description: 'Content management' },
      { label: 'Messages', href: '/artist/messages', icon: MessageSquare, description: 'Communications' }
    ],
    secondary: [
      { label: 'EPK', href: '/artist/epk', icon: Eye, description: 'Electronic press kit' },
      { label: 'Analytics', href: '/artist/analytics', icon: BarChart3, description: 'Performance metrics' }
    ],
    tools: [
      { label: 'Settings', href: '/artist/settings', icon: Settings, description: 'Profile settings' }
    ]
  },

  crew_member: {
    primary: [
      { label: 'My Tasks', href: '/crew/dashboard', icon: Home, description: 'Daily assignments' },
      { label: 'Schedule', href: '/crew/schedule', icon: Calendar, description: 'Work schedule' },
      { label: 'Team Chat', href: '/crew/messages', icon: MessageSquare, badge: 'Live', description: 'Crew coordination' }
    ],
    secondary: [
      { label: 'Equipment', href: '/crew/equipment', icon: Truck, description: 'Equipment tracking' },
      { label: 'Training', href: '/crew/training', icon: Shield, description: 'Safety & training' }
    ],
    tools: [
      { label: 'Settings', href: '/crew/settings', icon: Settings, description: 'Personal settings' }
    ]
  },

  vendor: {
    primary: [
      { label: 'Deliveries', href: '/vendor/dashboard', icon: Home, description: 'Delivery schedule' },
      { label: 'Orders', href: '/vendor/orders', icon: Calendar, description: 'Order management' },
      { label: 'Messages', href: '/vendor/messages', icon: MessageSquare, description: 'Client communication' }
    ],
    secondary: [
      { label: 'Inventory', href: '/vendor/inventory', icon: Truck, description: 'Stock management' },
      { label: 'Reports', href: '/vendor/reports', icon: BarChart3, description: 'Business reports' }
    ],
    tools: [
      { label: 'Settings', href: '/vendor/settings', icon: Settings, description: 'Business settings' }
    ]
  },

  venue_owner: {
    primary: [
      { label: 'Venue Dashboard', href: '/venue/dashboard', icon: Home, description: 'Venue operations' },
      { label: 'Bookings', href: '/venue/bookings', icon: Calendar, description: 'Event bookings' },
      { label: 'Staff', href: '/venue/staff', icon: Users, description: 'Venue staff' },
      { label: 'Communications', href: '/venue/communications', icon: MessageSquare, description: 'Guest & staff messaging' }
    ],
    secondary: [
      { label: 'Analytics', href: '/venue/analytics', icon: BarChart3, description: 'Venue performance' },
      { label: 'Equipment', href: '/venue/equipment', icon: Truck, description: 'Venue equipment' }
    ],
    tools: [
      { label: 'Settings', href: '/venue/settings', icon: Settings, description: 'Venue management' }
    ]
  },

  viewer: {
    primary: [
      { label: 'Browse', href: '/browse', icon: Eye, description: 'Explore content' },
      { label: 'Events', href: '/events', icon: Calendar, description: 'Upcoming events' },
      { label: 'Artists', href: '/artists', icon: Music, description: 'Artist profiles' }
    ],
    secondary: [
      { label: 'Venues', href: '/venues', icon: Building2, description: 'Venue directory' }
    ],
    tools: [
      { label: 'Settings', href: '/settings', icon: Settings, description: 'Account settings' }
    ]
  }
}

// =============================================================================
// SIDEBAR PROPS
// =============================================================================

interface NavigationSidebarProps {
  user: UserProfile
  isOpen: boolean
  onToggle: () => void
  roleTheme: string
}

// =============================================================================
// NAVIGATION SIDEBAR COMPONENT
// =============================================================================

export function NavigationSidebar({ user, isOpen, onToggle, roleTheme }: NavigationSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Get navigation config for user role
  const navConfig = navigationConfig[user.role] || navigationConfig.viewer
  const roleClasses = themeUtils.getRoleClasses(user.role)

  // =============================================================================
  // NAVIGATION ITEM COMPONENT
  // =============================================================================

  const NavItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon
    
    return (
      <Button
        variant="ghost"
        size={collapsed ? "sm" : "default"}
        className={`w-full justify-start text-left h-auto p-3 mb-1 transition-all duration-200 ${
          isActive 
            ? `${roleClasses} shadow-sm` 
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        } ${level > 0 ? 'ml-4 pl-8' : ''}`}
        onClick={() => router.push(item.href)}
      >
        <Icon className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4'} ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
        
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="outline" 
                  className={`ml-2 text-xs ${
                    typeof item.badge === 'string' && item.badge === 'Live'
                      ? 'text-green-400 border-green-500/30 animate-pulse'
                      : 'text-slate-400 border-slate-500/30'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-slate-400 mt-1 truncate">{item.description}</p>
            )}
          </div>
        )}
      </Button>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 z-30 transition-all duration-300 ${
      isOpen ? (collapsed ? 'w-16' : 'w-72') : 'w-0 -translate-x-full'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg ${roleClasses.split(' ')[1]} flex items-center justify-center`}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Tourify</h2>
              <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1.5"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Content */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-6">
          {/* Primary Navigation */}
          <div>
            {!collapsed && (
              <h3 className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Primary
              </h3>
            )}
            <div className="space-y-1">
              {navConfig.primary.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          {navConfig.secondary.length > 0 && (
            <>
              <Separator className="bg-slate-700/50" />
              <div>
                {!collapsed && (
                  <h3 className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Secondary
                  </h3>
                )}
                <div className="space-y-1">
                  {navConfig.secondary.map((item) => (
                    <NavItem key={item.href} item={item} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tools */}
          {navConfig.tools.length > 0 && (
            <>
              <Separator className="bg-slate-700/50" />
              <div>
                {!collapsed && (
                  <h3 className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tools
                  </h3>
                )}
                <div className="space-y-1">
                  {navConfig.tools.map((item) => (
                    <NavItem key={item.href} item={item} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-700/50">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.display_name || user.email}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Export navigation configuration for other components
export { navigationConfig, type NavItem, type RoleNavConfig }