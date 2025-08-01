"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  HelpCircle, 
  Moon, 
  Sun,
  ChevronDown,
  Plus,
  Filter,
  RefreshCw,
  Bookmark,
  ExternalLink,
  Zap,
  Crown,
  Shield
} from "lucide-react"
import { EnhancedNotificationCenter } from "@/components/notifications/enhanced-notification-center"



interface UserProfile {
  name: string
  email: string
  avatar?: string
  role: string
  lastActive: string
}

export function OptimizedHeader() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Kyle Daley',
    email: 'kyle@tourify.com',
    role: 'Admin',
    lastActive: '2 minutes ago'
  })

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded"></div>
            <span className="text-white font-semibold text-sm">Event & Tour Management</span>
            <Badge className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              ADMIN
            </Badge>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search events, tours, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <EnhancedNotificationCenter className="relative" />

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-slate-400 hover:text-white h-8 px-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">{userProfile.name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userProfile.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          {userProfile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{userProfile.name}</p>
                        <p className="text-xs text-slate-400">{userProfile.email}</p>
                        <p className="text-xs text-purple-400">{userProfile.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-400 hover:text-white"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-400 hover:text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-400 hover:text-white"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help & Support
                    </Button>
                    <Separator className="my-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-400 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
} 