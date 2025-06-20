"use client"

import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, CreditCard, Bell, Mail, Phone, Globe, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface BusinessSettings {
  businessName: string
  email: string
  phone: string
  website: string
  currency: string
  paymentMethods: {
    creditCard: boolean
    paypal: boolean
    applePay: boolean
    googlePay: boolean
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

// Mock data - replace with actual API calls
const mockSettings: BusinessSettings = {
  businessName: "Event Productions Inc.",
  email: "contact@eventproductions.com",
  phone: "+1 (555) 123-4567",
  website: "www.eventproductions.com",
  currency: "USD",
  paymentMethods: {
    creditCard: true,
    paypal: true,
    applePay: false,
    googlePay: false
  },
  notifications: {
    email: true,
    push: true,
    sms: false
  }
}

export default function BusinessSettingsPage() {
  const [settings, setSettings] = React.useState<BusinessSettings>(mockSettings)
  const [isSaving, setIsSaving] = React.useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/business/settings")
        if (!response.ok) {
          throw new Error("Failed to load settings")
        }
        const data = await response.json()
        if (Object.keys(data).length > 0) {
          setSettings(data)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive"
        })
      }
    }

    loadSettings()
  }, [toast])

  const handleInputChange = (field: keyof BusinessSettings, value: string) => {
    setSettings({ ...settings, [field]: value })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof BusinessSettings) => {
    handleInputChange(field, e.target.value)
  }

  const handlePaymentMethodToggle = (method: keyof BusinessSettings["paymentMethods"]) => {
    setSettings({
      ...settings,
      paymentMethods: {
        ...settings.paymentMethods,
        [method]: !settings.paymentMethods[method]
      }
    })
  }

  const handleNotificationToggle = (type: keyof BusinessSettings["notifications"]) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/business/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Success",
        description: "Settings saved successfully"
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Business Settings</h1>
        <p className="text-gray-400">Manage your business profile and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Business Profile */}
        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-white">Business Profile</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Update your business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, "businessName")}
                className="bg-[#1a1c23] border-gray-800"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, "email")}
                    className="pl-10 bg-[#1a1c23] border-gray-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, "phone")}
                    className="pl-10 bg-[#1a1c23] border-gray-800"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="website"
                  value={settings.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, "website")}
                  className="pl-10 bg-[#1a1c23] border-gray-800"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value: string) => handleInputChange("currency", value)}
              >
                <SelectTrigger className="bg-[#1a1c23] border-gray-800">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-white">Payment Methods</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Configure accepted payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Credit Card</Label>
                  <p className="text-sm text-gray-400">Accept Visa, Mastercard, etc.</p>
                </div>
                <Switch
                  checked={settings.paymentMethods.creditCard}
                  onCheckedChange={() => handlePaymentMethodToggle("creditCard")}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>PayPal</Label>
                  <p className="text-sm text-gray-400">Accept PayPal payments</p>
                </div>
                <Switch
                  checked={settings.paymentMethods.paypal}
                  onCheckedChange={() => handlePaymentMethodToggle("paypal")}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Apple Pay</Label>
                  <p className="text-sm text-gray-400">Accept Apple Pay</p>
                </div>
                <Switch
                  checked={settings.paymentMethods.applePay}
                  onCheckedChange={() => handlePaymentMethodToggle("applePay")}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Google Pay</Label>
                  <p className="text-sm text-gray-400">Accept Google Pay</p>
                </div>
                <Switch
                  checked={settings.paymentMethods.googlePay}
                  onCheckedChange={() => handlePaymentMethodToggle("googlePay")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-white">Notifications</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={() => handleNotificationToggle("email")}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-400">Receive browser notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={() => handleNotificationToggle("push")}
                />
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-400">Receive text messages</p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={() => handleNotificationToggle("sms")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="mr-2">Saving...</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 