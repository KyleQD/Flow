"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

interface MarketingChannel {
  name: string
  visitors: number
  conversions: number
  conversionRate: number
}

interface SocialMedia {
  platform: string
  followers: number
  engagement: number
  growth: number
}

interface MarketingAnalyticsProps {
  channels: MarketingChannel[]
  socialMedia: SocialMedia[]
}

export function MarketingAnalytics({ channels, socialMedia }: MarketingAnalyticsProps) {
  // Prepare data for the charts
  const channelData = channels.map((channel) => ({
    name: channel.name,
    visitors: channel.visitors,
    conversions: channel.conversions,
    rate: channel.conversionRate,
  }))

  const socialData = socialMedia.map((platform) => ({
    name: platform.platform,
    followers: platform.followers,
    engagement: platform.engagement,
    growth: platform.growth,
  }))

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardHeader className="pb-2">
          <CardTitle>Marketing Channel Performance</CardTitle>
          <CardDescription className="text-white/60">
            Analysis of marketing channels and conversion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="channels" className="space-y-4">
            <TabsList className="bg-[#0f1117] p-1">
              <TabsTrigger
                value="channels"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Channel Performance
              </TabsTrigger>
              <TabsTrigger
                value="conversion"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Conversion Rates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="channels">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={channelData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        value,
                        name === "visitors" ? "Visitors" : "Conversions",
                      ]}
                      contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Bar dataKey="visitors" name="Visitors" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="conversions" name="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="conversion">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={channelData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Conversion Rate"]}
                      contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="rate" name="Conversion Rate" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Channel Performance</h3>
            <div className="space-y-3">
              {channels.map((channel) => (
                <div key={channel.name} className="p-3 bg-[#0f1117] rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{channel.name}</h4>
                    <Badge
                      className={`${
                        channel.conversionRate > 7
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      } border-0`}
                    >
                      {channel.conversionRate}% conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-white/60">Visitors</p>
                      <p className="font-medium">{channel.visitors.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Conversions</p>
                      <p className="font-medium">{channel.conversions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardHeader className="pb-2">
          <CardTitle>Social Media Performance</CardTitle>
          <CardDescription className="text-white/60">Analysis of social media platforms and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={socialData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis yAxisId="left" orientation="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "followers" ? value.toLocaleString() : `${value}%`,
                    name === "followers" ? "Followers" : name === "engagement" ? "Engagement Rate" : "Growth Rate",
                  ]}
                  contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="followers" name="Followers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="engagement" name="Engagement Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="growth" name="Growth Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media Platforms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialMedia.map((platform) => (
                <div key={platform.platform} className="p-3 bg-[#0f1117] rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{platform.platform}</h4>
                    <Badge className="bg-blue-500/20 text-blue-400 border-0">{platform.growth}% growth</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-white/60">Followers</p>
                      <p className="font-medium">{platform.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Engagement</p>
                      <p className="font-medium">{platform.engagement}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
