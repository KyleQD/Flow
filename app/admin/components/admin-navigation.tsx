"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  BarChart3, 
  Settings, 
  Users, 
  Calendar, 
  Building, 
  Music, 
  Truck, 
  HelpCircle,
  Menu,
  X,
  Home,
  Database,
  Bug,
  RefreshCw
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  description: string
}

const navItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Overview and analytics'
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    description: 'System configuration'
  },
  {
    href: '/admin/request',
    label: 'Requests',
    icon: <Users className="h-5 w-5" />,
    description: 'Manage user requests'
  },
  {
    href: '/admin/debug',
    label: 'Debug',
    icon: <Bug className="h-5 w-5" />,
    description: 'System debugging tools'
  },
  {
    href: '/admin/create-tables',
    label: 'Database',
    icon: <Database className="h-5 w-5" />,
    description: 'Database management'
  },
  {
    href: '/admin/setup',
    label: 'Setup',
    icon: <RefreshCw className="h-5 w-5" />,
    description: 'System setup wizard'
  },
  {
    href: '/admin/reset-onboarding',
    label: 'Reset Onboarding',
    icon: <HelpCircle className="h-5 w-5" />,
    description: 'Reset user onboarding'
  }
]

export function AdminNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-slate-700"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop navigation */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-slate-800 lg:border-r lg:border-slate-700">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">Admin Panel</span>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700">
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold">Admin Panel</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile navigation items */}
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs text-slate-400">{item.description}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 