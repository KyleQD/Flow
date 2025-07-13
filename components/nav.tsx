"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Music, 
  Building2, 
  Crown,
  Settings, 
  LogOut, 
  Home,
  Bell,
  Search,
  Plus,
  Grid3x3,
  ChevronDown,
  Zap,
  Activity
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"
import { useMultiAccount } from "@/hooks/use-multi-account"
import { AccountSwitcher } from "@/components/account-switcher"
import { TourifyLogo } from "@/components/tourify-logo"
import { supabase } from "@/lib/supabase"

export function Nav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { profileData } = useProfile()
  const [notifications, setNotifications] = useState(0)

  // Don't show nav on auth pages or onboarding
  const hideNav = pathname.startsWith('/auth') || 
                  pathname.startsWith('/login') || 
                  pathname.startsWith('/signup') ||
                  pathname === '/' && !user

  if (hideNav) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-purple-400/20 shadow-lg shadow-purple-500/10">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"></div>
      <div className="relative container flex h-16 items-center justify-between">
        {/* Logo - Home Button */}
        <Link href="/dashboard" className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <TourifyLogo
              variant="white"
              size="xl"
              className="h-12 w-auto relative z-10 group-hover:brightness-110 transition-all duration-300"
            />
          </div>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-full p-1 border border-purple-400/20">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`rounded-full transition-all duration-300 ${
              pathname === '/dashboard' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => router.push('/dashboard')}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`rounded-full transition-all duration-300 ${
              pathname === '/feed' 
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => router.push('/feed')}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Feed
          </Button>
          <Button
            variant="ghost"
            size="sm" 
            className={`rounded-full transition-all duration-300 ${
              pathname === '/search' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => router.push('/search')}
          >
            <Search className="h-4 w-4 mr-2" />
            Discover
          </Button>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-full transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0 animate-pulse">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Create Button */}
            <Button
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            size="sm" 
            onClick={() => router.push('/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>

          {/* Enhanced Account Switcher */}
          <div className="w-64">
            <AccountSwitcher />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-purple-400/30 hover:ring-purple-400/50 transition-all duration-300">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profileData?.profile?.avatar_url || ""} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                    {profileData?.profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full border-2 border-slate-900"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-slate-800/95 backdrop-blur-xl border border-purple-400/20 shadow-xl shadow-purple-500/10"
            >
              <DropdownMenuLabel className="space-y-1">
                <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
                    <AvatarImage src={profileData?.profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                      {profileData?.profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
          </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {profileData?.profile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs border-0">
                    <User className="h-3 w-3 mr-1" />
                    General
                  </Badge>
                  <Badge variant="outline" className="border-green-400/50 text-green-400 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Free
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-purple-400/20" />
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="cursor-pointer hover:bg-slate-700/50 focus:bg-slate-700/50 transition-colors"
              >
                <User className="mr-3 h-4 w-4 text-purple-400" />
                <span className="text-slate-200">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/profile')}
                className="cursor-pointer hover:bg-slate-700/50 focus:bg-slate-700/50 transition-colors"
              >
                <Settings className="mr-3 h-4 w-4 text-blue-400" />
                <span className="text-slate-200">Account Management</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-purple-400/20" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer hover:bg-red-500/20 focus:bg-red-500/20 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4 text-red-400" />
                <span className="text-slate-200">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
} 