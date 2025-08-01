"use client"

import { useRouter } from 'next/navigation'
import { UserProfile } from '@/lib/auth/role-based-auth'
import { themeUtils } from '@/lib/design-system/theme'
import { navigationConfig } from './navigation-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'

// =============================================================================
// MOBILE NAVIGATION PROPS
// =============================================================================

interface MobileNavigationProps {
  user: UserProfile
  isOpen: boolean
  onClose: () => void
  roleTheme: string
  bottomNav?: boolean
}

// =============================================================================
// MOBILE NAVIGATION COMPONENT
// =============================================================================

export function MobileNavigation({ 
  user, 
  isOpen, 
  onClose, 
  roleTheme, 
  bottomNav = false 
}: MobileNavigationProps) {
  const router = useRouter()
  const navConfig = navigationConfig[user.role] || navigationConfig.viewer
  const roleClasses = themeUtils.getRoleClasses(user.role)

  // Handle navigation
  const handleNavigate = (href: string) => {
    router.push(href)
    if (!bottomNav) onClose()
  }

  // Bottom navigation variant
  if (bottomNav) {
    const primaryItems = navConfig.primary.slice(0, 4) // Limit to 4 items for bottom nav
    
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50">
        <div className="flex items-center justify-around px-2 py-2">
          {primaryItems.map((item) => {
            const Icon = item.icon
            const isActive = typeof window !== 'undefined' && window.location.pathname === item.href
            
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate(item.href)}
                className={`flex-1 flex-col h-auto p-2 space-y-1 ${
                  isActive 
                    ? `${roleClasses}` 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  // Full mobile navigation overlay
  return (
    <div className="fixed left-0 top-0 w-72 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg ${roleClasses.split(' ')[1]} flex items-center justify-center`}>
            <span className="text-sm font-bold text-white">T</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Tourify</h2>
            <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Primary Navigation */}
          <div>
            <h3 className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Primary
            </h3>
            <div className="space-y-1">
              {navConfig.primary.map((item) => {
                const Icon = item.icon
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.href
                
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="default"
                    onClick={() => handleNavigate(item.href)}
                    className={`w-full justify-start text-left h-auto p-3 ${
                      isActive 
                        ? `${roleClasses} shadow-sm` 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
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
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Secondary Navigation */}
          {navConfig.secondary.length > 0 && (
            <>
              <Separator className="bg-slate-700/50" />
              <div>
                <h3 className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Secondary
                </h3>
                <div className="space-y-1">
                  {navConfig.secondary.map((item) => {
                    const Icon = item.icon
                    const isActive = typeof window !== 'undefined' && window.location.pathname === item.href
                    
                    return (
                      <Button
                        key={item.href}
                        variant="ghost"
                        size="default"
                        onClick={() => handleNavigate(item.href)}
                        className={`w-full justify-start text-left h-auto p-3 ${
                          isActive 
                            ? `${roleClasses} shadow-sm` 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate">{item.label}</span>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-1 truncate">{item.description}</p>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Tools */}
          {navConfig.tools.length > 0 && (
            <>
              <Separator className="bg-slate-700/50" />
              <div>
                <h3 className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tools
                </h3>
                <div className="space-y-1">
                  {navConfig.tools.map((item) => {
                    const Icon = item.icon
                    const isActive = typeof window !== 'undefined' && window.location.pathname === item.href
                    
                    return (
                      <Button
                        key={item.href}
                        variant="ghost"
                        size="default"
                        onClick={() => handleNavigate(item.href)}
                        className={`w-full justify-start text-left h-auto p-3 ${
                          isActive 
                            ? `${roleClasses} shadow-sm` 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate">{item.label}</span>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-1 truncate">{item.description}</p>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
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
      </div>
    </div>
  )
}