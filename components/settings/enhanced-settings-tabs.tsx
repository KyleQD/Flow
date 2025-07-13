"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedProfileSettings } from "@/components/settings/enhanced-profile-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { BillingSettings } from "@/components/settings/billing-settings"
import { IntegrationSettings } from "@/components/settings/integration-settings"
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Plug,
  Sparkles,
  Zap
} from "lucide-react"

export function EnhancedSettingsTabs() {
  const tabs = [
    {
      value: "profile",
      label: "Profile",
      icon: User,
      description: "Personal information & custom URL",
      component: <EnhancedProfileSettings />,
      badge: "New",
      badgeColor: "bg-green-500/20 text-green-300 border-green-500/30"
    },
    {
      value: "account",
      label: "Account",
      icon: Settings,
      description: "General account settings",
      component: <AccountSettings />,
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Communication preferences",
      component: <NotificationSettings />,
    },
    {
      value: "security",
      label: "Security",
      icon: Shield,
      description: "Privacy & authentication",
      component: <SecuritySettings />,
      badge: "Pro",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    },
    {
      value: "billing",
      label: "Billing",
      icon: CreditCard,
      description: "Subscription & payments",
      component: <BillingSettings />,
    },
    {
      value: "integrations",
      label: "Integrations",
      icon: Plug,
      description: "Connected services",
      component: <IntegrationSettings />,
    },
  ]

  return (
    <div className="space-y-8">
      <Tabs defaultValue="profile" className="space-y-8">
        {/* Enhanced Tab Navigation */}
        <div className="relative">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-transparent h-auto p-0">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative flex flex-col items-center gap-2 p-4 rounded-lg text-gray-400 hover:text-white transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/30 data-[state=active]:text-white data-[state=active]:shadow-lg min-h-[80px]"
                  >
                    <div className="relative">
                      <div className="p-2 rounded-lg bg-white/10 group-data-[state=active]:bg-white/20 transition-colors">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      {tab.badge && (
                        <Badge className={`absolute -top-2 -right-2 text-xs px-1.5 py-0.5 ${tab.badgeColor}`}>
                          {tab.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div className="text-xs text-gray-500 mt-1 hidden lg:block">
                        {tab.description}
                      </div>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="relative">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0 space-y-6">
              <div className="relative">
                {/* Enhanced content container */}
                <div className="relative z-10">
                  {tab.component}
                </div>
                
                {/* Floating decorative elements for active tab */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-1000" />
                </div>
              </div>
            </TabsContent>
          ))}
        </div>

        {/* Quick Actions Footer */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Need help with settings?</h3>
                  <p className="text-gray-400 text-sm">Our support team is here to assist you</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20">
                  Contact Support
                </button>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-200 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Setup
                </button>
              </div>
            </div>
          </div>
        </Card>
      </Tabs>
    </div>
  )
} 