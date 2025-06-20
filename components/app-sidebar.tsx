"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Home, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Users, 
  CalendarCheck,
  Music2,
  Video,
  ShoppingBag,
  TrendingUp,
  Tag,
  Globe,
  Mic,
  Radio,
  Zap,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TourifyLogo } from "./tourify-logo"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function AppSidebar() {
  const pathname = usePathname()
  
  // Determine if we're on artist pages
  const isArtistPage = pathname.startsWith('/artist')
  
  // Use artist navigation when on artist pages, otherwise use general navigation
  const currentNavigation = isArtistPage ? artistNavigation : generalNavigation

  return (
    <Sidebar collapsible="none" className="border-r border-slate-800/50 bg-gradient-to-b from-black via-slate-950 to-black relative overflow-hidden w-64 min-w-64 flex-shrink-0">
      {/* Sidebar Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      <SidebarHeader className="border-b border-slate-800/50 py-6 relative z-10">
        <div className="flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <TourifyLogo className="h-8 filter drop-shadow-lg" />
          </motion.div>
        </div>
        
        {/* Artist Mode Indicator */}
        {isArtistPage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl flex items-center space-x-2"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
            </motion.div>
            <span className="text-xs font-medium text-purple-300">Artist Mode</span>
          </motion.div>
        )}
      </SidebarHeader>
      
      <SidebarContent className="bg-transparent relative z-10">
        <SidebarMenu className="space-y-2 p-2">
          {currentNavigation.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <SidebarMenuItem key={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                >
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center px-4 py-3 mx-1 rounded-2xl",
                        "transition-all duration-500 ease-out",
                        "hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/30",
                        "hover:shadow-lg hover:shadow-slate-900/50",
                        "border border-transparent hover:border-slate-700/30",
                        isActive && [
                          "bg-gradient-to-r from-slate-800/80 to-slate-700/50",
                          "border-slate-600/50 shadow-xl shadow-slate-900/50",
                          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-blue-500/10 before:rounded-2xl"
                        ]
                      )}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-600 rounded-r-full"
                          layoutId="activeIndicator"
                        />
                      )}
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      
                      <div className="flex items-center space-x-3 relative z-10">
                        <motion.div
                          className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            isActive 
                              ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30" 
                              : "bg-slate-800/30 border border-slate-700/30 group-hover:bg-slate-700/50 group-hover:border-slate-600/50"
                          )}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 transition-all duration-300",
                              isActive 
                                ? "text-purple-400 drop-shadow-sm" 
                                : "text-slate-400 group-hover:text-slate-200"
                            )}
                          />
                        </motion.div>
                        <span className={cn(
                          "font-medium transition-all duration-300",
                          isActive 
                            ? "text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent" 
                            : "text-slate-300 group-hover:text-white"
                        )}>
                          {item.name}
                        </span>
                      </div>
                      
                      {/* Active Shine Effect */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </motion.div>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-slate-800/50 p-4 bg-gradient-to-t from-black/50 to-transparent relative z-10">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            asChild
            className="w-full justify-between bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-slate-700/50 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/70 hover:to-slate-600/50 hover:text-white hover:border-slate-600/50 transition-all duration-300 rounded-xl h-12"
          >
            <Link href="/settings">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Settings</span>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-4 w-4 text-slate-500" />
              </motion.div>
            </Link>
          </Button>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}

// General navigation for non-artist pages
const generalNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Bookings', href: '/bookings', icon: CalendarCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

// Artist-specific navigation
const artistNavigation = [
  { name: 'Dashboard', href: '/artist', icon: LayoutDashboard },
  { name: 'Feed', href: '/artist/feed', icon: Home },
  { name: 'Content', href: '/artist/content', icon: Video },
  { name: 'Community', href: '/artist/community', icon: Users },
  { name: 'Business', href: '/artist/business', icon: ShoppingBag },
  { name: 'Events', href: '/artist/events', icon: Calendar },
  { name: 'Features', href: '/artist/features', icon: TrendingUp },
  { name: 'EPK', href: '/artist/epk', icon: Tag },
  { name: 'Profile', href: '/artist/profile', icon: Settings },
]
