"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VenueHeader } from "@/components/venue/venue-header"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { AnalyticsSummary } from "@/components/analytics/analytics-summary"
import { RevenueAnalytics } from "@/components/analytics/revenue-analytics"
import { EventPerformance } from "@/components/analytics/event-performance"
import { AttendanceAnalytics } from "@/components/analytics/attendance-analytics"
import { CostAnalytics } from "@/components/analytics/cost-analytics"
import { MarketingAnalytics } from "@/components/analytics/marketing-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d")
  const [activeTab, setActiveTab] = useState("overview")

  // This would be fetched from an API in a real application
  const analyticsData = {
    summary: {
      totalRevenue: 125750,
      ticketsSold: 3850,
      averageTicketPrice: 32.66,
      totalEvents: 15,
      profitMargin: 42.5,
      revenueGrowth: 18.3,
    },
    revenueBySource: [
      { name: "Ticket Sales", value: 85000 },
      { name: "Bar Sales", value: 25000 },
      { name: "Merchandise", value: 8500 },
      { name: "Sponsorships", value: 5250 },
      { name: "Private Events", value: 2000 },
    ],
    revenueOverTime: [
      { date: "Jan", revenue: 15000, expenses: 9000, profit: 6000 },
      { date: "Feb", revenue: 18500, expenses: 10500, profit: 8000 },
      { date: "Mar", revenue: 16800, expenses: 9800, profit: 7000 },
      { date: "Apr", revenue: 21000, expenses: 12000, profit: 9000 },
      { date: "May", revenue: 24500, expenses: 13500, profit: 11000 },
      { date: "Jun", revenue: 29950, expenses: 16450, profit: 13500 },
    ],
    topEvents: [
      {
        name: "Summer Jam Festival",
        revenue: 32500,
        ticketsSold: 850,
        date: "Jun 15, 2025",
        profitMargin: 48.2,
      },
      {
        name: "Electronic Dance Night",
        revenue: 18750,
        ticketsSold: 750,
        date: "May 12, 2025",
        profitMargin: 45.6,
      },
      {
        name: "Rock Revival",
        revenue: 24600,
        ticketsSold: 820,
        date: "May 20, 2025",
        profitMargin: 52.3,
      },
      {
        name: "Jazz Night",
        revenue: 8250,
        ticketsSold: 275,
        date: "Jun 28, 2025",
        profitMargin: 38.5,
      },
      {
        name: "Midnight Echo",
        revenue: 9750,
        ticketsSold: 325,
        date: "Jun 22, 2025",
        profitMargin: 41.2,
      },
    ],
    attendanceByDay: [
      { day: "Monday", attendance: 120 },
      { day: "Tuesday", attendance: 180 },
      { day: "Wednesday", attendance: 240 },
      { day: "Thursday", attendance: 350 },
      { day: "Friday", attendance: 620 },
      { day: "Saturday", attendance: 780 },
      { day: "Sunday", attendance: 450 },
    ],
    attendanceByTime: [
      { time: "6 PM", attendance: 150 },
      { time: "7 PM", attendance: 280 },
      { time: "8 PM", attendance: 420 },
      { time: "9 PM", attendance: 580 },
      { time: "10 PM", attendance: 650 },
      { time: "11 PM", attendance: 520 },
      { time: "12 AM", attendance: 380 },
      { time: "1 AM", attendance: 220 },
    ],
    costs: {
      staffing: 28500,
      rent: 15000,
      utilities: 8500,
      marketing: 12000,
      equipment: 6500,
      licenses: 3500,
      insurance: 4500,
      maintenance: 5000,
      other: 2500,
    },
    costTrend: [
      { month: "Jan", staffing: 4500, rent: 2500, utilities: 1200, marketing: 1800, other: 3000 },
      { month: "Feb", staffing: 4800, rent: 2500, utilities: 1300, marketing: 2000, other: 3200 },
      { month: "Mar", staffing: 4600, rent: 2500, utilities: 1250, marketing: 1900, other: 3100 },
      { month: "Apr", staffing: 5200, rent: 2500, utilities: 1400, marketing: 2200, other: 3300 },
      { month: "May", staffing: 5800, rent: 2500, utilities: 1550, marketing: 2400, other: 3500 },
      { month: "Jun", staffing: 6600, rent: 2500, utilities: 1800, marketing: 2700, other: 3900 },
    ],
    marketingPerformance: {
      channels: [
        { name: "Social Media", visitors: 4500, conversions: 320, conversionRate: 7.1 },
        { name: "Email", visitors: 2800, conversions: 210, conversionRate: 7.5 },
        { name: "Website", visitors: 6200, conversions: 380, conversionRate: 6.1 },
        { name: "Partnerships", visitors: 1800, conversions: 150, conversionRate: 8.3 },
        { name: "Paid Ads", visitors: 3500, conversions: 280, conversionRate: 8.0 },
      ],
      socialMedia: [
        { platform: "Instagram", followers: 12500, engagement: 8.2, growth: 12.5 },
        { platform: "Facebook", followers: 8200, engagement: 4.5, growth: 5.2 },
        { platform: "Twitter", followers: 6800, engagement: 3.8, growth: 7.8 },
        { platform: "TikTok", followers: 5400, engagement: 9.6, growth: 18.3 },
      ],
    },
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <VenueHeader />

        <main className="flex-1 p-6 overflow-auto">
          <AnalyticsHeader dateRange={dateRange} setDateRange={setDateRange} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="bg-[#1a1d29] p-1 w-full md:w-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Revenue
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Events
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Attendance
              </TabsTrigger>
              <TabsTrigger value="costs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Costs
              </TabsTrigger>
              <TabsTrigger
                value="marketing"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Marketing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <AnalyticsSummary data={analyticsData.summary} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueAnalytics
                  revenueBySource={analyticsData.revenueBySource}
                  revenueOverTime={analyticsData.revenueOverTime}
                  isCompact={true}
                />
                <EventPerformance topEvents={analyticsData.topEvents} isCompact={true} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceAnalytics
                  attendanceByDay={analyticsData.attendanceByDay}
                  attendanceByTime={analyticsData.attendanceByTime}
                  isCompact={true}
                />
                <CostAnalytics costs={analyticsData.costs} costTrend={analyticsData.costTrend} isCompact={true} />
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="mt-6">
              <RevenueAnalytics
                revenueBySource={analyticsData.revenueBySource}
                revenueOverTime={analyticsData.revenueOverTime}
                isCompact={false}
              />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <EventPerformance topEvents={analyticsData.topEvents} isCompact={false} />
            </TabsContent>

            <TabsContent value="attendance" className="mt-6">
              <AttendanceAnalytics
                attendanceByDay={analyticsData.attendanceByDay}
                attendanceByTime={analyticsData.attendanceByTime}
                isCompact={false}
              />
            </TabsContent>

            <TabsContent value="costs" className="mt-6">
              <CostAnalytics costs={analyticsData.costs} costTrend={analyticsData.costTrend} isCompact={false} />
            </TabsContent>

            <TabsContent value="marketing" className="mt-6">
              <MarketingAnalytics
                channels={analyticsData.marketingPerformance.channels}
                socialMedia={analyticsData.marketingPerformance.socialMedia}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
