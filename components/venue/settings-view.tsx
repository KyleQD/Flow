"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Palette, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SettingsViewProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export function SettingsView({ darkMode, toggleDarkMode }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("account")
  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    })
  }

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value="alex.johnson@example.com"
                    className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value="+1 (555) 123-4567"
                    className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}
                  />
                </div>
              </div>
            </div>

            <Separator className={darkMode ? "bg-gray-700" : "bg-gray-200"} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Password</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value="********"
                    className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">Update Password</Button>
            </div>

            <Separator className={darkMode ? "bg-gray-700" : "bg-gray-200"} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Danger Zone</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-messages">Messages</Label>
                    <p className="text-sm text-gray-500">Receive email notifications for new messages</p>
                  </div>
                  <Switch id="email-messages" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-connections">Connection Requests</Label>
                    <p className="text-sm text-gray-500">Receive email notifications for new connection requests</p>
                  </div>
                  <Switch id="email-connections" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-events">Event Invitations</Label>
                    <p className="text-sm text-gray-500">Receive email notifications for event invitations</p>
                  </div>
                  <Switch id="email-events" defaultChecked />
                </div>
              </div>
            </div>

            <Separator className={darkMode ? "bg-gray-700" : "bg-gray-200"} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Push Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-all">All Notifications</Label>
                    <p className="text-sm text-gray-500">Enable or disable all push notifications</p>
                  </div>
                  <Switch id="push-all" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-mentions">Mentions</Label>
                    <p className="text-sm text-gray-500">Receive notifications when you are mentioned</p>
                  </div>
                  <Switch id="push-mentions" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-comments">Comments</Label>
                    <p className="text-sm text-gray-500">Receive notifications for comments on your posts</p>
                  </div>
                  <Switch id="push-comments" defaultChecked />
                </div>
              </div>
            </div>

            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveSettings}>
              Save Notification Settings
            </Button>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Privacy Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <p className="text-sm text-gray-500">Control who can see your profile</p>
                  </div>
                  <select
                    id="profile-visibility"
                    className={`rounded-md ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                  >
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="connection-requests">Connection Requests</Label>
                    <p className="text-sm text-gray-500">Control who can send you connection requests</p>
                  </div>
                  <select
                    id="connection-requests"
                    className={`rounded-md ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="connections-of-connections">Connections of Connections</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-visibility">Activity Visibility</Label>
                    <p className="text-sm text-gray-500">Control who can see your activity</p>
                  </div>
                  <select
                    id="activity-visibility"
                    className={`rounded-md ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                  >
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>

            <Separator className={darkMode ? "bg-gray-700" : "bg-gray-200"} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Blocked Users</h3>
              <p className="text-sm text-gray-500">You haven't blocked any users yet.</p>
              <Button variant="outline">Manage Blocked Users</Button>
            </div>

            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveSettings}>
              Save Privacy Settings
            </Button>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme</h3>
              <div className="flex items-center space-x-4">
                <Button
                  variant={darkMode ? "outline" : "default"}
                  className={`flex items-center ${!darkMode ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  onClick={toggleDarkMode}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={darkMode ? "default" : "outline"}
                  className={`flex items-center ${darkMode ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  onClick={toggleDarkMode}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  System
                </Button>
              </div>
            </div>

            <Separator className={darkMode ? "bg-gray-700" : "bg-gray-200"} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Accent Color</h3>
              <div className="flex items-center space-x-4">
                <div
                  className="h-8 w-8 rounded-full bg-purple-600 cursor-pointer ring-2 ring-offset-2 ring-offset-gray-800 ring-purple-600"
                  onClick={() => {
                    toast({
                      title: "Accent color changed",
                      description: "Purple accent color applied",
                    })
                  }}
                ></div>
                <div
                  className="h-8 w-8 rounded-full bg-blue-600 cursor-pointer"
                  onClick={() => {
                    toast({
                      title: "Accent color changed",
                      description: "Blue accent color applied",
                    })
                  }}
                ></div>
                <div
                  className="h-8 w-8 rounded-full bg-green-600 cursor-pointer"
                  onClick={() => {
                    toast({
                      title: "Accent color changed",
                      description: "Green accent color applied",
                    })
                  }}
                ></div>
                <div
                  className="h-8 w-8 rounded-full bg-red-600 cursor-pointer"
                  onClick={() => {
                    toast({
                      title: "Accent color changed",
                      description: "Red accent color applied",
                    })
                  }}
                ></div>
              </div>
            </div>

            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveSettings}>
              Save Appearance Settings
            </Button>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Data & Storage</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-download">Auto-download Media</Label>
                    <p className="text-sm text-gray-500">Automatically download media in messages</p>
                  </div>
                  <Switch id="auto-download" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-saver">Data Saver</Label>
                    <p className="text-sm text-gray-500">Reduce data usage when browsing</p>
                  </div>
                  <Switch id="data-saver" />
                </div>
              </div>
            </div>

            <Separator className={darkMode ? "bg-gray-700" : "bg-gray-200"} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out of All Devices
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download Your Data
                </Button>
              </div>
            </div>

            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveSettings}>
              Save Advanced Settings
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
