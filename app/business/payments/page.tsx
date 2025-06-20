"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Search, DollarSign, ArrowUp, ArrowDown, Calendar, Download } from "lucide-react"

interface Transaction {
  id: string
  date: string
  customer: string
  event: string
  amount: number
  status: "completed" | "pending" | "refunded"
  paymentMethod: string
  ticketQuantity: number
}

// Mock data - replace with actual API calls
const mockTransactions: Transaction[] = [
  {
    id: "t1",
    date: "2024-03-07T10:30:00",
    customer: "John Doe",
    event: "Summer Jam Festival 2025",
    amount: 149.97,
    status: "completed",
    paymentMethod: "Credit Card",
    ticketQuantity: 3
  },
  {
    id: "t2",
    date: "2024-03-07T09:15:00",
    customer: "Jane Smith",
    event: "Rock Night Live",
    amount: 79.98,
    status: "completed",
    paymentMethod: "PayPal",
    ticketQuantity: 2
  },
  {
    id: "t3",
    date: "2024-03-06T14:20:00",
    customer: "Mike Johnson",
    event: "Summer Jam Festival 2025",
    amount: 49.99,
    status: "refunded",
    paymentMethod: "Credit Card",
    ticketQuantity: 1
  }
]

const revenueStats = {
  totalRevenue: 12500,
  lastMonth: 8500,
  monthlyGrowth: 47.06,
  averageOrderValue: 85.5,
  refundRate: 2.5,
  topSellingEvent: "Summer Jam Festival 2025"
}

export default function BusinessPaymentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [timeframe, setTimeframe] = React.useState("all")

  const filteredTransactions = mockTransactions.filter(transaction =>
    transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.event.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "refunded":
        return "bg-red-500/10 text-red-500"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Payments</h1>
        <p className="text-gray-400">Track your revenue and payment history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${revenueStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              {revenueStats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Average Order Value
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${revenueStats.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13151c] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Refund Rate
            </CardTitle>
            <ArrowDown className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {revenueStats.refundRate}%
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Of total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#13151c] border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Transaction History</CardTitle>
              <CardDescription className="text-gray-400">
                View all payment transactions
              </CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#13151c] border-gray-800"
                />
              </div>
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList className="bg-[#13151c] border border-gray-800">
                  <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                    All Time
                  </TabsTrigger>
                  <TabsTrigger value="month" className="data-[state=active]:bg-purple-600">
                    This Month
                  </TabsTrigger>
                  <TabsTrigger value="week" className="data-[state=active]:bg-purple-600">
                    This Week
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="text-white">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-gray-400">
                        {format(new Date(transaction.date), "h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">
                        {transaction.customer}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-white">{transaction.event}</div>
                        <div className="text-sm text-gray-400">
                          {transaction.ticketQuantity} {transaction.ticketQuantity === 1 ? "ticket" : "tickets"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-400">
                        {transaction.paymentMethod}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 