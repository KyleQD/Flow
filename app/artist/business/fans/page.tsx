"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Heart, 
  Users, 
  TrendingUp,
  ArrowLeft,
  Star,
  Share2,
  Mail,
  Calendar,
  Music,
  Gift,
  Target
} from "lucide-react"
import Link from "next/link"

const fanStats = {
  totalFans: 12540,
  newFansThisMonth: 845,
  engagementRate: 8.5,
  topFanLocation: "Los Angeles, CA",
  averageAge: 26,
  genderSplit: { male: 45, female: 52, other: 3 }
}

const topFans = [
  { id: 1, name: "Sarah Chen", avatar: "", level: "Superfan", engagement: 95, totalSpent: 450 },
  { id: 2, name: "Mike Rodriguez", avatar: "", level: "VIP", engagement: 88, totalSpent: 320 },
  { id: 3, name: "Emma Johnson", avatar: "", level: "Supporter", engagement: 82, totalSpent: 180 },
  { id: 4, name: "Alex Thompson", avatar: "", level: "Fan", engagement: 75, totalSpent: 120 },
  { id: 5, name: "Lisa Park", avatar: "", level: "Superfan", engagement: 92, totalSpent: 380 }
]

const engagementActivities = [
  { type: "comment", content: "Love the new single! Can't wait for the album 🎵", user: "Sarah Chen", time: "2 hours ago" },
  { type: "share", content: "Shared your latest music video", user: "Mike Rodriguez", time: "4 hours ago" },
  { type: "purchase", content: "Bought VIP concert tickets", user: "Emma Johnson", time: "6 hours ago" },
  { type: "follow", content: "Started following you", user: "New Fan", time: "8 hours ago" }
]

export default function FanEngagementPage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artist/business">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Business
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Fan Engagement</h1>
              <p className="text-gray-400">Connect with your community and build relationships</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-700">
            <Mail className="h-4 w-4 mr-2" />
            Send Newsletter
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Gift className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Fans</p>
                <p className="text-2xl font-bold text-white">{fanStats.totalFans.toLocaleString()}</p>
                <p className="text-xs text-green-400">+{fanStats.newFansThisMonth} this month</p>
              </div>
              <Users className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Engagement Rate</p>
                <p className="text-2xl font-bold text-white">{fanStats.engagementRate}%</p>
                <p className="text-xs text-blue-400">Above average</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Top Location</p>
                <p className="text-lg font-bold text-white">{fanStats.topFanLocation}</p>
                <p className="text-xs text-purple-400">18% of fans</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Average Age</p>
                <p className="text-2xl font-bold text-white">{fanStats.averageAge}</p>
                <p className="text-xs text-yellow-400">Prime demographic</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Fans */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Top Fans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topFans.map((fan, index) => (
                  <div key={fan.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-purple-400">#{index + 1}</span>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-cyan-600 text-white">
                            {fan.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{fan.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            fan.level === 'Superfan' ? 'bg-yellow-600/20 text-yellow-300' :
                            fan.level === 'VIP' ? 'bg-purple-600/20 text-purple-300' :
                            fan.level === 'Supporter' ? 'bg-blue-600/20 text-blue-300' :
                            'bg-green-600/20 text-green-300'
                          }>
                            {fan.level}
                          </Badge>
                          <span className="text-xs text-gray-400">${fan.totalSpent} lifetime value</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{fan.engagement}%</div>
                      <div className="text-xs text-gray-400">engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Tools */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {engagementActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className={`p-1 rounded-full ${
                      activity.type === 'comment' ? 'bg-blue-600' :
                      activity.type === 'share' ? 'bg-green-600' :
                      activity.type === 'purchase' ? 'bg-yellow-600' :
                      'bg-purple-600'
                    }`}>
                      {activity.type === 'comment' && <MessageSquare className="h-3 w-3 text-white" />}
                      {activity.type === 'share' && <Share2 className="h-3 w-3 text-white" />}
                      {activity.type === 'purchase' && <Gift className="h-3 w-3 text-white" />}
                      {activity.type === 'follow' && <Heart className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.content}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Tools */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Engagement Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-800/50">
                  <Mail className="h-4 w-4 mr-3" />
                  Send Fan Mail
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-800/50">
                  <Gift className="h-4 w-4 mr-3" />
                  Create Giveaway
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-800/50">
                  <Calendar className="h-4 w-4 mr-3" />
                  Schedule Live Session
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-800/50">
                  <Music className="h-4 w-4 mr-3" />
                  Exclusive Content
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-800/50">
                  <Star className="h-4 w-4 mr-3" />
                  Fan Rewards Program
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demographics */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Fan Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Gender Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Female</span>
                  <span className="text-sm font-medium text-white">{fanStats.genderSplit.female}%</span>
                </div>
                <Progress value={fanStats.genderSplit.female} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Male</span>
                  <span className="text-sm font-medium text-white">{fanStats.genderSplit.male}%</span>
                </div>
                <Progress value={fanStats.genderSplit.male} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Other</span>
                  <span className="text-sm font-medium text-white">{fanStats.genderSplit.other}%</span>
                </div>
                <Progress value={fanStats.genderSplit.other} className="h-2" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Age Groups</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">18-24</span>
                  <span className="text-sm font-medium text-white">35%</span>
                </div>
                <Progress value={35} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">25-34</span>
                  <span className="text-sm font-medium text-white">40%</span>
                </div>
                <Progress value={40} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">35+</span>
                  <span className="text-sm font-medium text-white">25%</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Top Locations</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Los Angeles</span>
                  <span className="text-sm font-medium text-white">18%</span>
                </div>
                <Progress value={18} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">New York</span>
                  <span className="text-sm font-medium text-white">15%</span>
                </div>
                <Progress value={15} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Chicago</span>
                  <span className="text-sm font-medium text-white">12%</span>
                </div>
                <Progress value={12} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 