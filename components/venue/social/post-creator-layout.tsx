"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { EnhancedPostCreator } from "@/components/social/enhanced-post-creator"
import { UserRecommendation } from "@/components/user-discovery/user-recommendation"
import { TrendingTopics } from "@/components/social/trending-topics"
import { Globe, Calendar, Users, Lightbulb } from "lucide-react"

interface PostCreatorLayoutProps {
  defaultTab?: string
  onTabChange?: (tab: string) => void
  showSidebar?: boolean
  className?: string
}

export function PostCreatorLayout({
  defaultTab = "post",
  onTabChange,
  showSidebar = true,
  className = "",
}: PostCreatorLayoutProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  if (!user) return null

  return (
    <div className={`grid grid-cols-1 ${showSidebar ? "lg:grid-cols-3" : ""} gap-6 ${className}`}>
      <div className={showSidebar ? "lg:col-span-2" : "w-full"}>
        <Card className="bg-gray-900 text-white border-gray-800">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Create Post</CardTitle>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback>
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">{user.fullName}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 mb-4">
                <TabsTrigger value="post" className="flex items-center gap-1">
                  <Globe className="h-4 w-4" /> Post
                </TabsTrigger>
                <TabsTrigger value="event" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Event
                </TabsTrigger>
                <TabsTrigger value="poll" className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> Poll
                </TabsTrigger>
              </TabsList>

              <TabsContent value="post" className="mt-0">
                <EnhancedPostCreator defaultTab="post" showTabs={false} />
              </TabsContent>

              <TabsContent value="event" className="mt-0">
                <EnhancedPostCreator defaultTab="event" showTabs={false} />
              </TabsContent>

              <TabsContent value="poll" className="mt-0">
                <EnhancedPostCreator defaultTab="poll" showTabs={false} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {showSidebar && (
        <div className="space-y-6 hidden lg:block">
          <Card className="bg-gray-900 text-white border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-purple-400" />
                Posting Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    1
                  </span>
                  <span>Add images or videos to increase engagement by up to 150%</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    2
                  </span>
                  <span>Use hashtags to make your posts discoverable (2-3 is optimal)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    3
                  </span>
                  <span>Mention relevant people with @ to notify them about your post</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    4
                  </span>
                  <span>The best times to post are weekdays between 10am-1pm and 4pm-6pm</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <UserRecommendation title="Connect With" description="People in your industry you might know" limit={2} />

          <TrendingTopics limit={5} />
        </div>
      )}
    </div>
  )
}
