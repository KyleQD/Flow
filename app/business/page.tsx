"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, Calendar, CreditCard, TrendingUp, Users, Ticket } from "lucide-react"
import { format } from "date-fns"

// Mock data - replace with actual API calls
const metrics = {
  totalRevenue: 12500,
  ticketsSold: 250,
  activeEvents: 5,
  customers: 220,
  revenueByDay: [
    { date: "2024-03-01", amount: 1200 },
    { date: "2024-03-02", amount: 800 },
    { date: "2024-03-03", amount: 1500 },
    { date: "2024-03-04", amount: 1000 },
    { date: "2024-03-05", amount: 2000 },
    { date: "2024-03-06", amount: 1800 },
    { date: "2024-03-07", amount: 2200 }
  ],
  topEvents: [
    {
      id: "1",
      title: "Summer Jam Festival 2025",
      ticketsSold: 150,
      revenue: 7500
    },
    {
      id: "2",
      title: "Rock Night Live",
      ticketsSold: 100,
      revenue: 5000
    }
  ],
  recentTransactions: [
    {
      id: "t1",
      customer: "John Doe",
      event: "Summer Jam Festival 2025",
      amount: 49.99,
      date: "2024-03-07T10:30:00"
    },
    {
      id: "t2",
      customer: "Jane Smith",
      event: "Rock Night Live",
      amount: 39.99,
      date: "2024-03-07T09:15:00"
    }
  ]
}

export default function BusinessOverviewPage() {
  const [timeframe, setTimeframe] = React.useState("week")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Business Overview</h1>
        <p className="text-gray-400">Track your events performance and revenue</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Tickets Sold
            </CardTitle>
            <Ticket className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.ticketsSold}
            </div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Active Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.activeEvents}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Next event in 3 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.customers}
            </div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-[#13151c] border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Revenue Overview</CardTitle>
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList className="bg-[#1a1c23] border border-gray-800">
                <TabsTrigger value="week" className="data-[state=active]:bg-purple-600">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-purple-600">
                  Month
                </TabsTrigger>
                <TabsTrigger value="year" className="data-[state=active]:bg-purple-600">
                  Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            Revenue chart will be implemented here
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Events */}
        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Top Events</CardTitle>
            <CardDescription className="text-gray-400">
              Your best performing events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#1a1c23] border border-gray-800"
                >
                  <div>
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-gray-400">
                      {event.ticketsSold} tickets sold
                    </p>
                  </div>
                  <p className="text-white font-medium">
                    ${event.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-400">
              Latest ticket purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#1a1c23] border border-gray-800"
                >
                  <div>
                    <p className="font-medium text-white">{transaction.customer}</p>
                    <p className="text-sm text-gray-400">{transaction.event}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(transaction.date), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 