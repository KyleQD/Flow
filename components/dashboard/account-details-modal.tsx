"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Music,
  Building,
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Clock,
  Bell,
  BarChart3,
  Activity,
  Zap,
  ArrowRight,
  ExternalLink
} from "lucide-react"

interface AccountDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  account: {
    account_type: 'artist' | 'venue'
    profile_data: any
    profile_id: string
  } | null
}

export function AccountDetailsModal({ isOpen, onClose, account }: AccountDetailsModalProps) {
  if (!account) return null

  const isArtist = account.account_type === 'artist'
  const accountName = account.profile_data?.artist_name || account.profile_data?.venue_name || 'Account'
  
  // Mock data - would come from API
  const mockData = {
    stats: {
      followers: isArtist ? 2547 : 1832,
      views: isArtist ? 45231 : 23456,
      engagement: isArtist ? 8.5 : 12.3,
      revenue: isArtist ? 12450 : 34567
    },
    recentActivity: [
      {
        id: '1',
        type: isArtist ? 'booking' : 'inquiry',
        title: isArtist ? 'New Booking Request' : 'Artist Inquiry',
        description: isArtist ? 'The Blue Note wants to book you for Saturday' : 'Jazz Collective interested in your venue',
        timestamp: '2 hours ago',
        priority: 'high'
      },
      {
        id: '2',
        type: 'message',
        title: 'New Message',
        description: isArtist ? 'Fan message about upcoming show' : 'Event coordinator asking about availability',
        timestamp: '4 hours ago',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'analytics',
        title: 'Weekly Report',
        description: `Your ${isArtist ? 'music' : 'venue'} reached ${isArtist ? '1.2K' : '890'} new people`,
        timestamp: '1 day ago',
        priority: 'low'
      }
    ],
    upcomingEvents: [
      {
        id: '1',
        title: isArtist ? 'Jazz Night Performance' : 'Electronic Music Showcase',
        date: '2024-12-25',
        time: '20:00',
        venue: isArtist ? 'Blue Note NYC' : accountName,
        status: 'confirmed'
      },
      {
        id: '2',
        title: isArtist ? 'Acoustic Session' : 'Indie Rock Night',
        date: '2024-12-28',
        time: '19:30',
        venue: isArtist ? 'Brooklyn Bowl' : accountName,
        status: 'pending'
      }
    ]
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar
      case 'inquiry': return MessageSquare
      case 'message': return MessageSquare
      case 'analytics': return BarChart3
      default: return Bell
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 border border-white/20 backdrop-blur-xl rounded-3xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-white/20">
                <AvatarImage src={account.profile_data?.avatar_url} />
                <AvatarFallback className={`bg-gradient-to-br ${isArtist ? 'from-purple-500 to-pink-500' : 'from-green-500 to-emerald-500'} text-white text-lg font-semibold`}>
                  {accountName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-white/20">
                {isArtist ? (
                  <Music className="h-3 w-3 text-purple-400" />
                ) : (
                  <Building className="h-3 w-3 text-green-400" />
                )}
              </div>
            </div>
            <div>
              <h2 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {accountName}
              </h2>
              <p className="text-sm text-gray-400 font-normal capitalize">
                {account.account_type} Account
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm rounded-2xl p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl"
            >
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-white">{mockData.stats.followers.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-white">{mockData.stats.views.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Views</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-white">{mockData.stats.engagement}%</div>
                  <div className="text-xs text-gray-400">Engagement</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-white">${mockData.stats.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Revenue</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl">
                  <Calendar className="h-4 w-4 mr-2" />
                  {isArtist ? 'Book Shows' : 'Manage Events'}
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {mockData.recentActivity.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type)
                  
                  return (
                    <Card key={activity.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                                <p className="text-gray-300 text-sm mt-1">{activity.description}</p>
                              </div>
                              <Badge className={`${getPriorityColor(activity.priority)} text-xs border rounded-lg`}>
                                {activity.priority}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center text-gray-400 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.timestamp}
                              </div>
                              <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 rounded-lg">
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-3">
              {mockData.upcomingEvents.map((event) => (
                <Card key={event.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{event.title}</h4>
                          <p className="text-gray-400 text-sm">{event.venue}</p>
                          <p className="text-gray-400 text-xs">{event.date} at {event.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${event.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'} border rounded-lg`}>
                          {event.status}
                        </Badge>
                        <Button size="sm" className="mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">This Week</span>
                      <span className="text-green-400 font-medium">+23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">This Month</span>
                      <span className="text-green-400 font-medium">+15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">This Year</span>
                      <span className="text-green-400 font-medium">+45%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Top Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Best Day</span>
                      <span className="text-purple-400 font-medium">Saturday</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Peak Hour</span>
                      <span className="text-purple-400 font-medium">8-9 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Top Location</span>
                      <span className="text-purple-400 font-medium">NYC</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 