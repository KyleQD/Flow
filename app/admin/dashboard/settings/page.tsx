"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Settings,
  Shield,
  Zap,
  Bell,
  Users,
  Globe,
  Key,
  Database,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Search,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  FileText,
  ExternalLink,
  Wifi,
  Server,
  HardDrive,
  Cpu,
  MemoryStick
} from "lucide-react"

interface SystemStatus {
  api: 'online' | 'offline' | 'maintenance'
  database: 'connected' | 'disconnected' | 'slow'
  storage: number // percentage used
  memory: number // percentage used
  cpu: number // percentage used
  uptime: string
  lastBackup: string
  version: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  tourUpdates: boolean
  systemAlerts: boolean
  financialReports: boolean
  staffNotifications: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  ipWhitelist: string[]
  auditLogging: boolean
  passwordExpiry: number
  loginAttempts: number
}

export default function SettingsPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'online',
    database: 'connected',
    storage: 65,
    memory: 42,
    cpu: 28,
    uptime: '15 days, 8 hours',
    lastBackup: '2 hours ago',
    version: 'v2.4.1'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    tourUpdates: true,
    systemAlerts: true,
    financialReports: true,
    staffNotifications: false
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: true,
    sessionTimeout: 30,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    auditLogging: true,
    passwordExpiry: 90,
    loginAttempts: 5
  })

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'text-green-400'
      case 'slow':
      case 'maintenance':
        return 'text-yellow-400'
      case 'offline':
      case 'disconnected':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400">Online</Badge>
      case 'slow':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Slow</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Maintenance</Badge>
      case 'offline':
      case 'disconnected':
        return <Badge className="bg-red-500/20 text-red-400">Offline</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-xl font-bold text-white">Loading Settings</h2>
            <p className="text-slate-400">Setting up configuration panel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Settings & Configuration
          </h1>
          <p className="text-slate-400 mt-2">
            Manage system settings, security, integrations, and user preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* System Status Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">System Status</p>
                <p className="text-lg font-bold text-white">All Systems</p>
                <p className="text-xs text-green-400">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                <Server className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Uptime</p>
                <p className="text-lg font-bold text-white">{systemStatus.uptime}</p>
                <p className="text-xs text-slate-500">Since last restart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
                <HardDrive className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Storage Used</p>
                <p className="text-lg font-bold text-white">{systemStatus.storage}%</p>
                <Progress value={systemStatus.storage} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                <MemoryStick className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Memory Usage</p>
                <p className="text-lg font-bold text-white">{systemStatus.memory}%</p>
                <Progress value={systemStatus.memory} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 p-1 w-full max-w-2xl">
            <TabsTrigger value="general" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
              <Zap className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
              <Database className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-400" />
                    Organization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Organization Name</Label>
                    <Input className="bg-slate-800 border-slate-700 text-white" defaultValue="Tourify Event Management" />
                  </div>
                  <div>
                    <Label className="text-white">Default Time Zone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cst">Central Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Default Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="gbp">GBP</SelectItem>
                        <SelectItem value="cad">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-400" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Auto-approve new users</p>
                      <p className="text-slate-400 text-sm">Automatically approve new user registrations</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Email verification required</p>
                      <p className="text-slate-400 text-sm">Require email verification for new accounts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <Label className="text-white">Default user role</Label>
                    <Select defaultValue="viewer">
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-red-400" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-slate-400 text-sm">Require 2FA for admin accounts</p>
                    </div>
                    <Switch 
                      checked={security.twoFactorAuth}
                      onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Session Timeout (minutes)</Label>
                    <Input 
                      type="number" 
                      className="bg-slate-800 border-slate-700 text-white" 
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Max Login Attempts</Label>
                    <Input 
                      type="number" 
                      className="bg-slate-800 border-slate-700 text-white" 
                      value={security.loginAttempts}
                      onChange={(e) => setSecurity({...security, loginAttempts: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Password Expiry (days)</Label>
                    <Input 
                      type="number" 
                      className="bg-slate-800 border-slate-700 text-white" 
                      value={security.passwordExpiry}
                      onChange={(e) => setSecurity({...security, passwordExpiry: parseInt(e.target.value)})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-yellow-400" />
                    Audit & Logging
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Audit Logging</p>
                      <p className="text-slate-400 text-sm">Log all admin actions and changes</p>
                    </div>
                    <Switch 
                      checked={security.auditLogging}
                      onCheckedChange={(checked) => setSecurity({...security, auditLogging: checked})}
                    />
                  </div>
                  <div>
                    <Label className="text-white">IP Whitelist</Label>
                    <Textarea 
                      className="bg-slate-800 border-slate-700 text-white" 
                      placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                      value={security.ipWhitelist.join('\n')}
                      onChange={(e) => setSecurity({...security, ipWhitelist: e.target.value.split('\n')})}
                    />
                    <p className="text-slate-400 text-xs mt-1">One IP range per line</p>
                  </div>
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300">
                    <Download className="h-4 w-4 mr-2" />
                    Download Audit Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-purple-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Delivery Methods</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">Email Notifications</p>
                            <p className="text-slate-400 text-sm">Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch 
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-green-400" />
                          <div>
                            <p className="text-white font-medium">Push Notifications</p>
                            <p className="text-slate-400 text-sm">Browser and mobile push notifications</p>
                          </div>
                        </div>
                        <Switch 
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-yellow-400" />
                          <div>
                            <p className="text-white font-medium">SMS Notifications</p>
                            <p className="text-slate-400 text-sm">Text message notifications for critical alerts</p>
                          </div>
                        </div>
                        <Switch 
                          checked={notifications.sms}
                          onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Tour Updates</p>
                          <p className="text-slate-400 text-sm">Changes to tour schedules and events</p>
                        </div>
                        <Switch 
                          checked={notifications.tourUpdates}
                          onCheckedChange={(checked) => setNotifications({...notifications, tourUpdates: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">System Alerts</p>
                          <p className="text-slate-400 text-sm">Critical system notifications and outages</p>
                        </div>
                        <Switch 
                          checked={notifications.systemAlerts}
                          onCheckedChange={(checked) => setNotifications({...notifications, systemAlerts: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Financial Reports</p>
                          <p className="text-slate-400 text-sm">Weekly and monthly financial summaries</p>
                        </div>
                        <Switch 
                          checked={notifications.financialReports}
                          onCheckedChange={(checked) => setNotifications({...notifications, financialReports: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Staff Notifications</p>
                          <p className="text-slate-400 text-sm">Staff scheduling and availability updates</p>
                        </div>
                        <Switch 
                          checked={notifications.staffNotifications}
                          onCheckedChange={(checked) => setNotifications({...notifications, staffNotifications: checked})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                    Third-Party Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Email Service</p>
                        <p className="text-slate-400 text-sm">SMTP configuration</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Payment Gateway</p>
                        <p className="text-slate-400 text-sm">Stripe integration</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Analytics</p>
                        <p className="text-slate-400 text-sm">Google Analytics</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400">Disconnected</Badge>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Key className="h-5 w-5 mr-2 text-orange-400" />
                    API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">API Rate Limit</Label>
                    <Select defaultValue="1000">
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="100">100 requests/hour</SelectItem>
                        <SelectItem value="500">500 requests/hour</SelectItem>
                        <SelectItem value="1000">1000 requests/hour</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">API Key Rotation</p>
                      <p className="text-slate-400 text-sm">Automatically rotate API keys</p>
                    </div>
                    <Switch />
                  </div>
                  <div>
                    <Label className="text-white">Webhook URL</Label>
                    <Input 
                      className="bg-slate-800 border-slate-700 text-white" 
                      placeholder="https://your-app.com/webhook"
                    />
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New API Key
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-400" />
                    Database & Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Database Status</p>
                      <p className="text-slate-400 text-sm">Connection and performance</p>
                    </div>
                    {getStatusBadge(systemStatus.database)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Last Backup</p>
                      <p className="text-slate-400 text-sm">{systemStatus.lastBackup}</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Auto Backup</p>
                      <p className="text-slate-400 text-sm">Daily automated backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Manual Backup
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-400" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Version</span>
                    <span className="text-white font-medium">{systemStatus.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Environment</span>
                    <Badge className="bg-green-500/20 text-green-400">Production</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CPU Usage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={systemStatus.cpu} className="w-20 h-2" />
                      <span className="text-white text-sm">{systemStatus.cpu}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Memory Usage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={systemStatus.memory} className="w-20 h-2" />
                      <span className="text-white text-sm">{systemStatus.memory}%</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View System Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
} 