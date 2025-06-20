"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for analytics
const deliveryData = [
  { name: "Mon", delivered: 120, opened: 95, clicked: 60 },
  { name: "Tue", delivered: 150, opened: 110, clicked: 75 },
  { name: "Wed", delivered: 180, opened: 130, clicked: 90 },
  { name: "Thu", delivered: 170, opened: 125, clicked: 85 },
  { name: "Fri", delivered: 190, opened: 145, clicked: 100 },
  { name: "Sat", delivered: 110, opened: 80, clicked: 50 },
  { name: "Sun", delivered: 85, opened: 60, clicked: 35 },
]

const engagementData = [
  { name: "Event Updates", rate: 85 },
  { name: "Promotional", rate: 65 },
  { name: "Transactional", rate: 92 },
  { name: "Reminders", rate: 78 },
  { name: "Follow-ups", rate: 70 },
]

const channelData = [
  { name: "Email", value: 65 },
  { name: "SMS", value: 25 },
  { name: "Push", value: 10 },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Communication Analytics</h2>
        <div className="flex gap-4">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Delivery Rate</CardTitle>
            <CardDescription>Average message delivery rate</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Open Rate</CardTitle>
            <CardDescription>Average message open rate</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">72.4%</div>
            <p className="text-xs text-muted-foreground">+5.1% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Click Rate</CardTitle>
            <CardDescription>Average link click rate</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">45.8%</div>
            <p className="text-xs text-muted-foreground">+1.7% from last period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="delivery">
        <TabsList>
          <TabsTrigger value="delivery">Delivery Metrics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>
        <TabsContent value="delivery" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Performance</CardTitle>
              <CardDescription>Delivery, open, and click rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  delivered: {
                    label: "Delivered",
                    color: "hsl(var(--chart-1))",
                  },
                  opened: {
                    label: "Opened",
                    color: "hsl(var(--chart-2))",
                  },
                  clicked: {
                    label: "Clicked",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="delivered" stroke="var(--color-delivered)" strokeWidth={2} />
                    <Line type="monotone" dataKey="opened" stroke="var(--color-opened)" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicked" stroke="var(--color-clicked)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Message Type</CardTitle>
              <CardDescription>Open rates by message category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  rate: {
                    label: "Open Rate (%)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="rate" fill="var(--color-rate)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="channels" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
              <CardDescription>Distribution by channel type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
