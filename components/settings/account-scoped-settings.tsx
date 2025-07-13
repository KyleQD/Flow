"use client"

import React, { useState, useEffect } from 'react'
import { useMultiAccount } from '@/hooks/use-multi-account'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  User, 
  Music, 
  Building, 
  Shield,
  Bell,
  CreditCard,
  Lock,
  Palette,
  Zap,
  Globe,
  Camera,
  Sparkles,
  Calendar,
  Users
} from 'lucide-react'

// Import account-specific settings components
import { GeneralAccountSettings } from './general-account-settings'
import { ArtistAccountSettings } from './artist-account-settings'
import { VenueAccountSettings } from './venue-account-settings'
import { AdminAccountSettings } from './admin-account-settings'
import { AccountManagementSettings } from './account-management-settings'

interface AccountScopedSettingsProps {
  className?: string
}

export function AccountScopedSettings({ className = '' }: AccountScopedSettingsProps) {
  const { currentAccount, userAccounts, isLoading } = useMultiAccount()
  const [activeTab, setActiveTab] = useState('profile')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!currentAccount) {
    return (
      <Card className="bg-red-500/10 border-red-500/20">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">No Active Account</h3>
          <p className="text-gray-400">Please select an account to manage settings.</p>
        </CardContent>
      </Card>
    )
  }

  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
      case 'artist':
        return <Music className="h-5 w-5 text-purple-400" />
      case 'venue':
        return <Building className="h-5 w-5 text-green-400" />
      case 'admin':
        return <Shield className="h-5 w-5 text-red-400" />
      default:
        return <User className="h-5 w-5 text-blue-400" />
    }
  }

  const getAccountLabel = (accountType: string) => {
    switch (accountType) {
      case 'artist':
        return 'Artist Account'
      case 'venue':
        return 'Venue Account'
      case 'admin':
        return 'Admin Account'
      default:
        return 'Personal Account'
    }
  }

  const getAccountColor = (accountType: string) => {
    switch (accountType) {
      case 'artist':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'venue':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  const getSettingsTabs = (accountType: string) => {
    const baseTabs = [
      {
        value: 'profile',
        label: 'Profile',
        icon: User,
        description: 'Personal information & visibility'
      },
      {
        value: 'accounts',
        label: 'Account Management',
        icon: Users,
        description: 'Manage your accounts and delete unwanted ones'
      },
      {
        value: 'notifications',
        label: 'Notifications',
        icon: Bell,
        description: 'Communication preferences'
      },
      {
        value: 'privacy',
        label: 'Privacy',
        icon: Lock,
        description: 'Security & privacy settings'
      },
      {
        value: 'appearance',
        label: 'Appearance',
        icon: Palette,
        description: 'Customize your experience'
      }
    ]

    // Add account-specific tabs
    switch (accountType) {
      case 'artist':
        return [
          ...baseTabs,
          {
            value: 'music',
            label: 'Music',
            icon: Music,
            description: 'Music & content settings'
          },
          {
            value: 'booking',
            label: 'Booking',
            icon: Calendar,
            description: 'Booking & availability'
          },
          {
            value: 'analytics',
            label: 'Analytics',
            icon: Zap,
            description: 'Performance tracking'
          }
        ]
      case 'venue':
        return [
          ...baseTabs,
          {
            value: 'venue',
            label: 'Venue Info',
            icon: Building,
            description: 'Venue details & capacity'
          },
          {
            value: 'booking',
            label: 'Booking',
            icon: Calendar,
            description: 'Booking policies & rates'
          },
          {
            value: 'payments',
            label: 'Payments',
            icon: CreditCard,
            description: 'Payment methods & billing'
          }
        ]
      case 'admin':
        return [
          ...baseTabs,
          {
            value: 'system',
            label: 'System',
            icon: Settings,
            description: 'Platform administration'
          },
          {
            value: 'moderation',
            label: 'Moderation',
            icon: Shield,
            description: 'Content moderation tools'
          },
          {
            value: 'analytics',
            label: 'Analytics',
            icon: Zap,
            description: 'Platform analytics'
          }
        ]
      default:
        return baseTabs
    }
  }

  const renderSettingsContent = (accountType: string, tabValue: string) => {
    // Account Management is available for all account types
    if (tabValue === 'accounts') {
      return <AccountManagementSettings activeTab={tabValue} />
    }
    
    switch (accountType) {
      case 'artist':
        return <ArtistAccountSettings activeTab={tabValue} />
      case 'venue':
        return <VenueAccountSettings activeTab={tabValue} />
      case 'admin':
        return <AdminAccountSettings activeTab={tabValue} />
      default:
        return <GeneralAccountSettings activeTab={tabValue} />
    }
  }

  const settingsTabs = getSettingsTabs(currentAccount.account_type)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Account Context Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                {getAccountIcon(currentAccount.account_type)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {getAccountLabel(currentAccount.account_type)} Settings
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Manage your {currentAccount.account_type} account preferences and configuration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getAccountColor(currentAccount.account_type)}>
                {currentAccount.account_type.charAt(0).toUpperCase() + currentAccount.account_type.slice(1)}
              </Badge>
              {currentAccount.account_type === 'admin' && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Privileged
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <TabsList className="grid w-full auto-cols-fr grid-flow-col bg-slate-800/50 rounded-xl p-1">
              {settingsTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg flex items-center gap-2 px-4 py-3 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 transition-all"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {settingsTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-6 mt-0">
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <tab.icon className="h-5 w-5 text-purple-400" />
                    {tab.label} Settings
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{tab.description}</p>
                </CardHeader>
                <CardContent>
                  {renderSettingsContent(currentAccount.account_type, tab.value)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
} 