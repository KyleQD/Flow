"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountSettings } from "@/components/settings/account-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { BillingSettings } from "@/components/settings/billing-settings"
import { IntegrationSettings } from "@/components/settings/integration-settings"

export function SettingsTabs() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex lg:h-10">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <div className="space-y-6">
          <TabsContent value="profile" className="space-y-6 mt-0">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6 mt-0">
            <AccountSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6 mt-0">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6 mt-0">
            <SecuritySettings />
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6 mt-0">
            <BillingSettings />
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6 mt-0">
            <IntegrationSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 