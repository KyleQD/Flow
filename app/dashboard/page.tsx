"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useMultiAccount } from "@/hooks/use-multi-account"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Music, 
  Calendar, 
  Users, 
  BarChart3, 
  Plus, 
  Heart, 
  MessageCircle, 
  Share, 
  TrendingUp,
  Sparkles,
  Activity,
  Award,
  Zap,
  Eye,
  Globe,
  Play,
  Star,
  Clock,
  CheckCircle,
  Building,
  Mic,
  Target,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  User
} from "lucide-react"

interface DashboardData {
  stats: {
    likes: number
    followers: number
    shares: number
    views: number
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    icon: any
  }>
  quickLinks: Array<{
    title: string
    description: string
    href: string
    icon: any
    color: string
  }>
}

interface UserProfile {
  id: string
  metadata: {
    full_name?: string
    username?: string
  }
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { accounts, currentAccount, switchAccount } = useMultiAccount()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get('welcome') === 'true'
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const supabase = createClientComponentClient()

  // Get the display name from profile or fallback to user metadata
  const getDisplayName = () => {
    if (userProfile?.metadata?.full_name) {
      return userProfile.metadata.full_name
    }
    if (userProfile?.metadata?.username) {
      return userProfile.metadata.username
    }
    return user?.user_metadata?.name || user?.email?.split('@')[0] || "Creator"
  }

  // Fetch user profile function
  const fetchUserProfile = async () => {
    if (!user) return

    try {
      console.log('Fetching profile for user:', user.id)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        console.log('Profile fetched:', profile)
        setUserProfile(profile)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    // Simulate loading dashboard data
    const loadDashboardData = () => {
      setDashboardData({
        stats: {
          likes: Math.floor(Math.random() * 1000) + 100,
          followers: Math.floor(Math.random() * 500) + 50,
          shares: Math.floor(Math.random() * 200) + 20,
          views: Math.floor(Math.random() * 5000) + 500
        },
        recentActivity: [
          {
            id: '1',
            type: 'like',
            description: 'Your latest track received 15 new likes',
            timestamp: '2 hours ago',
            icon: Heart
          },
          {
            id: '2',
            type: 'booking',
            description: 'New booking request from Blue Moon Venue',
            timestamp: '4 hours ago',
            icon: Calendar
          },
          {
            id: '3',
            type: 'follow',
            description: '3 new followers joined your community',
            timestamp: '6 hours ago',
            icon: Users
          },
          {
            id: '4',
            type: 'achievement',
            description: 'You reached 1K profile views milestone!',
            timestamp: '1 day ago',
            icon: Award
          }
        ],
        quickLinks: [
          {
            title: 'Analytics',
            description: 'Track your performance',
            href: '/analytics',
            icon: BarChart3,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            title: 'Events',
            description: 'Manage your shows',
            href: '/events',
            icon: Calendar,
            color: 'from-purple-500 to-pink-500'
          },
          {
            title: 'Network',
            description: 'Connect with others',
            href: '/network',
            icon: Users,
            color: 'from-green-500 to-emerald-500'
          },
          {
            title: 'Profile',
            description: 'Update your profile',
            href: '/profile',
            icon: User,
            color: 'from-orange-500 to-red-500'
          }
        ]
      })
    }

    if (user) {
      fetchUserProfile()
      setTimeout(loadDashboardData, 1000)
    }

    // Add focus event listener to refresh profile when user returns to dashboard
    const handleFocus = () => {
      if (user) {
        fetchUserProfile()
      }
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, loading, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur opacity-20 animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading Dashboard</h2>
          <p className="text-gray-400">Preparing your creative workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center bg-repeat opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg font-semibold">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Welcome back, {getDisplayName()}
                  </h1>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Account Switcher */}
              {accounts.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400">Active Account:</span>
                  <select
                    value={currentAccount?.account_type || ''}
                    onChange={(e) => {
                      const account = accounts.find(acc => acc.account_type === e.target.value)
                      if (account) switchAccount(account.profile_id, account.account_type)
                    }}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                  >
                    {accounts.map(account => (
                      <option key={account.account_type} value={account.account_type} className="bg-slate-800 text-white">
                        {account.account_type === 'artist' && '🎵'} 
                        {account.account_type === 'venue' && '🏢'}
                        {account.account_type === 'general' && '👤'}
                        {account.account_type === 'admin' && '⚡'}
                        {' '}
                        {account.profile_data?.name || account.profile_data?.artist_name || account.profile_data?.venue_name || 'General'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Alert */}
        {isNewUser && (
          <div className="container mx-auto px-6 py-6">
            <Alert className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 backdrop-blur-sm">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <AlertDescription className="text-green-200">
                🎉 Welcome to Tourify! Your account has been successfully created. 
                Start by exploring the platform and connecting with other creators.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Stats & Quick Actions */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Stats Cards */}
              {dashboardData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{dashboardData.stats.likes.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Likes</div>
                      <div className="flex items-center justify-center text-green-400 text-sm mt-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{dashboardData.stats.followers.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Followers</div>
                      <div className="flex items-center justify-center text-green-400 text-sm mt-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Share className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{dashboardData.stats.shares.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Shares</div>
                      <div className="flex items-center justify-center text-green-400 text-sm mt-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +15%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{dashboardData.stats.views.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Views</div>
                      <div className="flex items-center justify-center text-green-400 text-sm mt-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +23%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Jump into your most common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      className="h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-white/20 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-white"
                      onClick={() => router.push('/feed')}
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">Create Post</span>
                    </Button>

                    <Button 
                      className="h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-white/20 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-white"
                      onClick={() => router.push('/events')}
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Events</span>
                    </Button>

                    <Button 
                      className="h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-white/20 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-white"
                      onClick={() => router.push('/network')}
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Network</span>
                    </Button>

                    <Button 
                      className="h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-white/20 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-white"
                      onClick={() => router.push('/analytics')}
                    >
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    Insights
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Platform Overview</CardTitle>
                      <CardDescription className="text-gray-400">
                        Your creative journey at a glance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-400" />
                            Your Goals
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Complete Profile</span>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                Complete
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">First Post</span>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                In Progress
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">100 Followers</span>
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                                Pending
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            Recent Achievements
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Award className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">Profile Complete</div>
                                <div className="text-xs text-gray-400">2 days ago</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-6">
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-400" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        What's been happening with your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.recentActivity.length ? (
                        <div className="space-y-4">
                          {dashboardData.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <activity.icon className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm">{activity.description}</p>
                                <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="insights" className="mt-6">
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Performance Insights</CardTitle>
                      <CardDescription className="text-gray-400">
                        Data-driven insights to grow your presence
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium text-white">Growing Reach</span>
                            </div>
                            <p className="text-sm text-green-300">Your content is reaching 23% more people this week</p>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium text-white">Engagement Up</span>
                            </div>
                            <p className="text-sm text-blue-300">People are interacting more with your posts</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar - Quick Links & Account Info */}
            <div className="space-y-6">
              
              {/* Account Status */}
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Profile</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Verification</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <Separator className="bg-white/10" />
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    onClick={() => router.push('/profile')}
                  >
                    View Profile
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Links */}
              {dashboardData && (
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Quick Access</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your most used features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboardData.quickLinks.map((link) => (
                      <Button
                        key={link.title}
                        variant="ghost"
                        className="w-full justify-start p-4 h-auto hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                        onClick={() => router.push(link.href)}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                          <link.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-white">{link.title}</div>
                          <div className="text-xs text-gray-400">{link.description}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-white transition-colors" />
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Create Account CTA */}
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Expand Your Presence</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Create additional accounts to reach different audiences
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={() => router.push('/create')}
                  >
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
} 