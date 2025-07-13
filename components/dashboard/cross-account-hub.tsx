"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMultiAccount } from "@/hooks/use-multi-account"
import { AccountDetailsModal } from "./account-details-modal"
import {
  Bell,
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  Music,
  Building,
  ArrowRight,
  Clock,
  DollarSign,
  Star,
  Zap,
  BarChart3,
  Eye
} from "lucide-react"

interface CrossAccountActivity {
  id: string
  accountType: 'artist' | 'venue'
  accountName: string
  type: 'booking' | 'message' | 'follower' | 'event' | 'revenue'
  title: string
  description: string
  timestamp: string
  priority: 'low' | 'medium' | 'high'
  actionRequired?: boolean
  value?: number
}

export function CrossAccountHub() {
  const { accounts, currentAccount } = useMultiAccount()
  const [activities, setActivities] = useState<CrossAccountActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter to only show accounts other than general
  const otherAccounts = accounts.filter(acc => acc.account_type !== 'general')

  useEffect(() => {
    // Simulate loading cross-account activities
    const loadActivities = () => {
      const mockActivities: CrossAccountActivity[] = [
        {
          id: '1',
          accountType: 'artist',
          accountName: 'Luna Rivers',
          type: 'booking',
          title: 'New Booking Request',
          description: 'The Blue Note wants to book you for Saturday night',
          timestamp: '2 hours ago',
          priority: 'high',
          actionRequired: true
        },
        {
          id: '2',
          accountType: 'venue',
          accountName: 'Sunset Lounge',
          type: 'message',
          title: 'Artist Inquiry',
          description: 'Jazz Collective wants to discuss availability',
          timestamp: '4 hours ago',
          priority: 'medium',
          actionRequired: true
        },
        {
          id: '3',
          accountType: 'artist',
          accountName: 'Luna Rivers',
          type: 'follower',
          title: 'New Followers',
          description: '15 new followers this week',
          timestamp: '1 day ago',
          priority: 'low',
          value: 15
        },
        {
          id: '4',
          accountType: 'venue',
          accountName: 'Sunset Lounge',
          type: 'revenue',
          title: 'Weekly Revenue',
          description: 'Generated $2,450 from 3 events',
          timestamp: '2 days ago',
          priority: 'medium',
          value: 2450
        }
      ]
      setActivities(mockActivities)
      setIsLoading(false)
    }

    setTimeout(loadActivities, 1000)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar
      case 'message': return MessageSquare
      case 'follower': return Users
      case 'event': return Music
      case 'revenue': return DollarSign
      default: return Bell
    }
  }

  const getAccountIcon = (accountType: string) => {
    return accountType === 'artist' ? Music : Building
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  if (otherAccounts.length === 0) {
    return null
  }

  const handleAccountClick = (account: any) => {
    setSelectedAccount(account)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Account Updates
          </CardTitle>
        </CardHeader>
              <CardContent>
          {/* Quick Account Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {otherAccounts.map((account) => {
              const AccountIcon = getAccountIcon(account.account_type)
              const accountActivities = activities.filter(a => a.accountType === account.account_type)
              const urgentCount = accountActivities.filter(a => a.actionRequired).length
              
              return (
                <Card 
                  key={account.profile_id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleAccountClick(account)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                        <AccountIcon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-white">
                          {account.profile_data?.name || account.profile_data?.artist_name || account.profile_data?.venue_name}
                        </h4>
                        <p className="text-gray-400 text-xs capitalize">{account.account_type} Account</p>
                      </div>
                      
                      <div className="text-right">
                        {urgentCount > 0 && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs mb-1">
                            {urgentCount} urgent
                          </Badge>
                        )}
                        <div className="text-white font-medium text-sm">{accountActivities.length}</div>
                        <div className="text-gray-400 text-xs">Updates</div>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-2xl p-1">
            <TabsTrigger value="recent" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="urgent" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl">
              Urgent ({activities.filter(a => a.actionRequired).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-2xl bg-white/5 animate-pulse">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-xl"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-white/10 rounded w-3/4"></div>
                            <div className="h-2 bg-white/10 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  activities.slice(0, 3).map((activity) => {
                    const IconComponent = getActivityIcon(activity.type)
                    const AccountIcon = getAccountIcon(activity.accountType)
                    
                    return (
                      <div
                        key={activity.id}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center border border-white/20">
                              <AccountIcon className="h-2 w-2 text-purple-400" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-white text-xs">{activity.title}</h4>
                                <p className="text-gray-400 text-xs">{activity.accountName}</p>
                              </div>
                              {activity.actionRequired && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs rounded-lg">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-300 text-xs mt-1 line-clamp-2">{activity.description}</p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center text-gray-400 text-xs">
                                <Clock className="h-2 w-2 mr-1" />
                                {activity.timestamp}
                              </div>
                              {activity.value && (
                                <div className="text-green-400 text-xs font-medium">
                                  {activity.type === 'revenue' ? `$${activity.value.toLocaleString()}` : `+${activity.value}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="urgent" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {activities.filter(a => a.actionRequired).map((activity) => {
                  const IconComponent = getActivityIcon(activity.type)
                  const AccountIcon = getAccountIcon(activity.accountType)
                  
                  return (
                    <div
                      key={activity.id}
                      className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center border border-white/20">
                            <AccountIcon className="h-2 w-2 text-red-400" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-white text-xs">{activity.title}</h4>
                              <p className="text-gray-400 text-xs">{activity.accountName}</p>
                            </div>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs px-2 py-1">
                              Action
                            </Button>
                          </div>
                          
                          <p className="text-gray-300 text-xs mt-1 line-clamp-2">{activity.description}</p>
                          
                          <div className="flex items-center text-gray-400 text-xs mt-2">
                            <Clock className="h-2 w-2 mr-1" />
                            {activity.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <AccountDetailsModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      account={selectedAccount}
    />
  </>
  )
} 