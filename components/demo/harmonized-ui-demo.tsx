"use client"

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { LoadingScreen, LoadingSpinner, LoadingSkeleton, LoadingCard } from '@/components/ui/loading-screen'
import { ErrorMessage, NetworkError, NotFoundError } from '@/components/ui/error-boundary'
import { ConnectionStatusIndicator, ConnectionStatusBar } from '@/components/layout/connection-status-indicator'
import { themeUtils } from '@/lib/design-system/theme'
import { 
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Users,
  Zap,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Music,
  Settings,
  Eye
} from 'lucide-react'

// =============================================================================
// DEMO DATA
// =============================================================================

const demoRoles = [
  { id: 'admin', name: 'Admin', icon: Settings, description: 'Full platform access' },
  { id: 'tour_manager', name: 'Tour Manager', icon: Calendar, description: 'Tour coordination' },
  { id: 'artist', name: 'Artist', icon: Music, description: 'Performance management' },
  { id: 'venue_owner', name: 'Venue Owner', icon: MapPin, description: 'Venue operations' },
  { id: 'viewer', name: 'Viewer', icon: Eye, description: 'Browse only access' }
]

const demoData = {
  tours: [
    { id: '1', name: 'Summer Festival Tour 2024', status: 'active', events: 12, revenue: 245000 },
    { id: '2', name: 'Acoustic Sessions', status: 'planning', events: 8, revenue: 89000 },
    { id: '3', name: 'World Tour 2024', status: 'completed', events: 25, revenue: 892000 }
  ],
  stats: {
    totalRevenue: 1226000,
    activeEvents: 15,
    totalStaff: 48,
    onlineUsers: 23
  }
}

// =============================================================================
// HARMONIZED UI DEMO COMPONENT
// =============================================================================

export function HarmonizedUIDemo() {
  const [selectedRole, setSelectedRole] = useState('admin')
  const [activeTab, setActiveTab] = useState('layouts')
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean
    quality: 'excellent' | 'good' | 'poor' | 'disconnected'
  }>({ isConnected: true, quality: 'excellent' })
  const [showLoading, setShowLoading] = useState(false)
  const [showError, setShowError] = useState(false)

  // Get role styling
  const selectedRoleData = demoRoles.find(r => r.id === selectedRole)
  const roleClasses = themeUtils.getRoleClasses(selectedRole)

  // =============================================================================
  // COMPONENTS SHOWCASE
  // =============================================================================

  const LayoutShowcase = () => (
    <div className="space-y-6">
      {/* Role-Based Layout Preview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Layout className="mr-2 h-5 w-5" />
            Role-Based Layouts
          </CardTitle>
          <CardDescription>
            Each user role gets a customized layout with relevant navigation and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              Select Role to Preview:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {demoRoles.map((role) => {
                const Icon = role.icon
                return (
                  <Button
                    key={role.id}
                    variant={selectedRole === role.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex-col h-auto p-3 space-y-2 ${
                      selectedRole === role.id ? themeUtils.getRoleClasses(role.id) : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-medium text-xs">{role.name}</div>
                      <div className="text-xs opacity-70">{role.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Layout Preview */}
          <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-900">
            <div className="h-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700" />
            <div className={`h-1 ${roleClasses.split(' ')[1]} opacity-60`} />
            
            <div className="flex h-64">
              {/* Sidebar Preview */}
              <div className="w-48 bg-slate-800/50 border-r border-slate-700 p-3">
                <div className={`w-6 h-6 rounded-md ${roleClasses.split(' ')[1]} mb-3`} />
                <div className="space-y-2">
                  {['Dashboard', 'Primary', 'Secondary', 'Tools'].map((item, i) => (
                    <div key={item} className={`h-6 rounded ${
                      i === 0 ? roleClasses : 'bg-slate-700'
                    }`} />
                  ))}
                </div>
              </div>
              
              {/* Main Content Preview */}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-slate-700 rounded w-32" />
                  <div className="flex space-x-2">
                    <div className="h-6 w-6 bg-slate-700 rounded" />
                    <div className="h-6 w-6 bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-slate-700/50 rounded-lg p-2">
                      <div className="h-3 bg-slate-600 rounded mb-2" />
                      <div className="h-2 bg-slate-600 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Role Features */}
          <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
            <h4 className="font-medium text-white mb-2 flex items-center">
              {selectedRoleData && <selectedRoleData.icon className="mr-2 h-4 w-4" />}
              {selectedRoleData?.name} Layout Features
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Role-specific navigation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Contextual quick actions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Permission-based features</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Mobile-optimized design</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Design Preview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Smartphone className="mr-2 h-5 w-5" />
            Responsive Design System
          </CardTitle>
          <CardDescription>
            Consistent experience across desktop, tablet, and mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Desktop */}
            <div className="text-center">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <h4 className="font-medium text-white mb-2">Desktop</h4>
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-600">
                <div className="h-20 bg-slate-700 rounded mb-1" />
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-slate-700 rounded" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Full sidebar navigation</p>
            </div>

            {/* Tablet */}
            <div className="text-center">
              <div className="h-8 w-6 mx-auto mb-2 bg-purple-400 rounded" />
              <h4 className="font-medium text-white mb-2">Tablet</h4>
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-600 max-w-24 mx-auto">
                <div className="h-16 bg-slate-700 rounded mb-1" />
                <div className="grid grid-cols-2 gap-1">
                  {[1, 2].map(i => (
                    <div key={i} className="h-6 bg-slate-700 rounded" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Collapsible sidebar</p>
            </div>

            {/* Mobile */}
            <div className="text-center">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <h4 className="font-medium text-white mb-2">Mobile</h4>
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-600 max-w-16 mx-auto">
                <div className="h-12 bg-slate-700 rounded mb-1" />
                <div className="space-y-1">
                  {[1, 2].map(i => (
                    <div key={i} className="h-4 bg-slate-700 rounded" />
                  ))}
                </div>
                <div className="h-3 bg-slate-600 rounded mt-1" />
              </div>
              <p className="text-xs text-slate-400 mt-2">Bottom navigation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const ComponentsShowcase = () => (
    <div className="space-y-6">
      {/* Color System */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Unified Color System
          </CardTitle>
          <CardDescription>
            Role-based colors with consistent states and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {demoRoles.slice(0, 4).map((role) => (
              <div key={role.id} className="text-center">
                <div className={`w-12 h-12 rounded-lg mx-auto mb-2 ${
                  themeUtils.getRoleClasses(role.id).split(' ')[1]
                }`} />
                <p className="text-sm font-medium text-white">{role.name}</p>
                <Badge 
                  variant="outline" 
                  className={`mt-1 text-xs ${themeUtils.getRoleClasses(role.id)}`}
                >
                  {role.id}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Status & Connection Indicators</CardTitle>
          <CardDescription>
            Real-time status feedback with consistent visual language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Connection Status</h4>
              <div className="flex flex-wrap gap-3">
                <ConnectionStatusIndicator isConnected={true} quality="excellent" showText />
                <ConnectionStatusIndicator isConnected={true} quality="good" showText />
                <ConnectionStatusIndicator isConnected={true} quality="poor" showText />
                <ConnectionStatusIndicator isConnected={false} quality="disconnected" showText />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Status Indicators</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { status: 'active', label: 'Active' },
                  { status: 'pending', label: 'Pending' },
                  { status: 'completed', label: 'Completed' },
                  { status: 'cancelled', label: 'Cancelled' }
                ].map(({ status, label }) => (
                  <Badge 
                    key={status}
                    variant="outline" 
                    className={themeUtils.getStatusClasses(status)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Connection Status Bar</h4>
              <ConnectionStatusBar
                isConnected={connectionStatus.isConnected}
                quality={connectionStatus.quality}
                onlineUsers={demoData.stats.onlineUsers}
                lastUpdate={new Date()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading States */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Loading States</CardTitle>
          <CardDescription>
            Consistent loading indicators across all components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Spinners & Indicators</h4>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <LoadingSpinner size="sm" />
                  <p className="text-xs text-slate-400 mt-1">Small</p>
                </div>
                <div className="text-center">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-slate-400 mt-1">Medium</p>
                </div>
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs text-slate-400 mt-1">Large</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Skeleton Loading</h4>
              <div className="space-y-3">
                <LoadingSkeleton width="w-3/4" height="h-4" />
                <LoadingSkeleton width="w-1/2" height="h-4" />
                <LoadingSkeleton width="w-2/3" height="h-4" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Card Loading State</h4>
              <div className="max-w-md">
                <LoadingCard />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const InteractiveDemo = () => (
    <div className="space-y-6">
      {/* Demo Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Interactive Demo Controls</CardTitle>
          <CardDescription>
            Test different states and see the harmonized responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowLoading(!showLoading)}
              className="h-auto p-4 flex-col space-y-2"
            >
              <LoadingSpinner size="sm" />
              <span>Toggle Loading State</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowError(!showError)}
              className="h-auto p-4 flex-col space-y-2"
            >
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span>Toggle Error State</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setConnectionStatus(prev => ({
                isConnected: !prev.isConnected,
                quality: prev.isConnected ? 'disconnected' : 'excellent'
              }))}
              className="h-auto p-4 flex-col space-y-2"
            >
              <Zap className="h-5 w-5 text-purple-400" />
              <span>Toggle Connection</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* State Demonstrations */}
      {showLoading && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Loading State Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingScreen 
              message="Loading harmonized UI components..." 
              subMessage="Please wait while we sync your data"
              fullScreen={false}
              variant="card"
            />
          </CardContent>
        </Card>
      )}

      {showError && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Error State Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ErrorMessage
                title="Component Error"
                message="This demonstrates our harmonized error handling"
                onRetry={() => setShowError(false)}
              />
              <NetworkError onRetry={() => setShowError(false)} />
              <NotFoundError resource="demo data" onGoBack={() => setShowError(false)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Data Demo */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Live Data Showcase</CardTitle>
          <CardDescription>
            Real-time synchronized data with consistent presentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                ${(demoData.stats.totalRevenue / 1000).toFixed(0)}K
              </div>
              <p className="text-sm text-slate-400">Total Revenue</p>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {demoData.stats.activeEvents}
              </div>
              <p className="text-sm text-slate-400">Active Events</p>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {demoData.stats.totalStaff}
              </div>
              <p className="text-sm text-slate-400">Team Members</p>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {demoData.stats.onlineUsers}
              </div>
              <p className="text-sm text-slate-400">Users Online</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {demoData.tours.map((tour, index) => (
              <div key={tour.id} className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <div>
                    <h4 className="font-medium text-white">{tour.name}</h4>
                    <p className="text-sm text-slate-400">{tour.events} events</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={themeUtils.getStatusClasses(tour.status)}>
                    {tour.status}
                  </Badge>
                  <span className="text-sm font-medium text-white">
                    ${(tour.revenue / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Palette className="mr-3 h-7 w-7 text-purple-400" />
            Harmonized UI/UX System Demo
          </CardTitle>
          <CardDescription className="text-lg">
            Explore the unified design system that creates consistent experiences across all platform features and user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
              <Users className="h-6 w-6 text-green-400" />
              <div>
                <p className="font-medium text-white">Role-Based Design</p>
                <p className="text-sm text-slate-400">Customized for each user type</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-400" />
              <div>
                <p className="font-medium text-white">Mobile-First</p>
                <p className="text-sm text-slate-400">Responsive across all devices</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
              <Zap className="h-6 w-6 text-purple-400" />
              <div>
                <p className="font-medium text-white">Real-Time Sync</p>
                <p className="text-sm text-slate-400">Live updates everywhere</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layouts">Layouts & Navigation</TabsTrigger>
          <TabsTrigger value="components">Components & States</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="layouts" className="mt-6">
          <LayoutShowcase />
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <ComponentsShowcase />
        </TabsContent>

        <TabsContent value="interactive" className="mt-6">
          <InteractiveDemo />
        </TabsContent>
      </Tabs>

      {/* Demo Footer */}
      <Card className="bg-slate-800/30 border-slate-600">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              🎨 Harmonized UI/UX System Complete!
            </h3>
            <p className="text-slate-400 mb-4">
              Every component, layout, and interaction follows consistent design patterns while adapting to user roles and contexts.
            </p>
            <div className="flex justify-center space-x-2">
              <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                Design System ✨
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                Role-Based UX 🎯
              </Badge>
              <Badge variant="outline" className="text-green-400 border-green-500/30">
                Mobile-Optimized 📱
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}