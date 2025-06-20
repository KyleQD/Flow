"use client"

import { BarChart3, Download, LineChart, Ticket, TrendingUp } from "lucide-react"
import { Header } from "@/components/header"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TicketingPage() {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <PageHeader
        title="Ticketing"
        icon={Ticket}
        description="Manage ticket sales, pricing, and distribution for all your events"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total Tickets Sold" value="3,450" trend="+12% from last week" trendUp={true} icon={Ticket} />
        <MetricCard
          title="Revenue Generated"
          value="$172,500"
          trend="+8% from last week"
          trendUp={true}
          icon={TrendingUp}
        />
        <MetricCard title="Avg. Ticket Price" value="$50.00" trend="No change" trendUp={null} icon={LineChart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                Ticket Sales Overview
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Select defaultValue="summer-festival">
                  <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-800/70 border-slate-700">
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="summer-festival">Summer Festival</SelectItem>
                    <SelectItem value="concert-series">Concert Series</SelectItem>
                    <SelectItem value="corporate-event">Corporate Event</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 border-slate-700">
                  <Download className="h-3.5 w-3.5 mr-1" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full relative bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden p-4">
                <TicketSalesChart />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 text-base">Ticket Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TicketTypeItem name="General Admission" price="$45.00" sold={2100} total={3000} percentage={70} />
                <TicketTypeItem name="VIP Access" price="$120.00" sold={850} total={1000} percentage={85} />
                <TicketTypeItem name="Early Bird" price="$35.00" sold={500} total={500} percentage={100} soldOut />
                <TicketTypeItem name="Backstage Pass" price="$250.00" sold={0} total={50} percentage={0} notOnSale />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-slate-800/50 p-1 mb-4">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
                >
                  All Transactions
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="refunded"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
                >
                  Refunded
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="rounded-md border border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Ticket Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                        <TransactionRow
                          id="TX-9385"
                          customer="John Smith"
                          event="Summer Festival"
                          ticketType="VIP Access"
                          amount="$240.00"
                          date="Jul 24, 2023"
                          status="completed"
                        />
                        <TransactionRow
                          id="TX-9384"
                          customer="Sarah Johnson"
                          event="Summer Festival"
                          ticketType="General Admission"
                          amount="$90.00"
                          date="Jul 24, 2023"
                          status="completed"
                        />
                        <TransactionRow
                          id="TX-9383"
                          customer="Michael Brown"
                          event="Concert Series"
                          ticketType="General Admission"
                          amount="$45.00"
                          date="Jul 23, 2023"
                          status="refunded"
                        />
                        <TransactionRow
                          id="TX-9382"
                          customer="Emily Davis"
                          event="Summer Festival"
                          ticketType="VIP Access"
                          amount="$120.00"
                          date="Jul 23, 2023"
                          status="completed"
                        />
                        <TransactionRow
                          id="TX-9381"
                          customer="David Wilson"
                          event="Corporate Event"
                          ticketType="General Admission"
                          amount="$75.00"
                          date="Jul 22, 2023"
                          status="completed"
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <div className="rounded-md border border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Ticket Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                        <TransactionRow
                          id="TX-9385"
                          customer="John Smith"
                          event="Summer Festival"
                          ticketType="VIP Access"
                          amount="$240.00"
                          date="Jul 24, 2023"
                          status="completed"
                        />
                        <TransactionRow
                          id="TX-9384"
                          customer="Sarah Johnson"
                          event="Summer Festival"
                          ticketType="General Admission"
                          amount="$90.00"
                          date="Jul 24, 2023"
                          status="completed"
                        />
                        <TransactionRow
                          id="TX-9382"
                          customer="Emily Davis"
                          event="Summer Festival"
                          ticketType="VIP Access"
                          amount="$120.00"
                          date="Jul 23, 2023"
                          status="completed"
                        />
                        <TransactionRow
                          id="TX-9381"
                          customer="David Wilson"
                          event="Corporate Event"
                          ticketType="General Admission"
                          amount="$75.00"
                          date="Jul 22, 2023"
                          status="completed"
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="refunded" className="mt-0">
                <div className="rounded-md border border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Ticket Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                        <TransactionRow
                          id="TX-9383"
                          customer="Michael Brown"
                          event="Concert Series"
                          ticketType="General Admission"
                          amount="$45.00"
                          date="Jul 23, 2023"
                          status="refunded"
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  trend: string
  trendUp: boolean | null
  icon: any
}

function MetricCard({ title, value, trend, trendUp, icon: Icon }: MetricCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
            <p
              className={`text-xs mt-1 flex items-center ${
                trendUp === true ? "text-green-400" : trendUp === false ? "text-red-400" : "text-slate-400"
              }`}
            >
              {trendUp === true && <TrendingUp className="h-3 w-3 mr-1" />}
              {trendUp === false && <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
              {trend}
            </p>
          </div>
          <div className="bg-purple-500/20 p-2 rounded-md">
            <Icon className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TicketSalesChart() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between text-xs text-slate-400 mb-4">
        <div>Daily Ticket Sales - Last 30 Days</div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
            General Admission
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-pink-500 mr-1"></div>
            VIP Access
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-end space-x-1">
        {Array.from({ length: 30 }).map((_, i) => {
          const generalHeight = Math.floor(Math.random() * 60) + 10
          const vipHeight = Math.floor(Math.random() * 30) + 5

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full bg-purple-500/80 rounded-t" style={{ height: `${generalHeight}%` }}></div>
              <div className="w-full bg-pink-500/80 rounded-t mt-0.5" style={{ height: `${vipHeight}%` }}></div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <div>Jun 24</div>
        <div>Jul 8</div>
        <div>Jul 24</div>
      </div>
    </div>
  )
}

interface TicketTypeItemProps {
  name: string
  price: string
  sold: number
  total: number
  percentage: number
  soldOut?: boolean
  notOnSale?: boolean
}

function TicketTypeItem({ name, price, sold, total, percentage, soldOut, notOnSale }: TicketTypeItemProps) {
  return (
    <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-sm font-medium text-slate-200">{name}</div>
          <div className="text-xs text-slate-400">{price} per ticket</div>
        </div>
        {soldOut && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Sold Out</Badge>}
        {notOnSale && <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Not On Sale</Badge>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-slate-500">
            {sold} / {total} sold
          </div>
          <div className="text-xs text-purple-400">{percentage}%</div>
        </div>
        <Progress value={percentage} className="h-1.5 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </Progress>
      </div>
    </div>
  )
}

interface TransactionRowProps {
  id: string
  customer: string
  event: string
  ticketType: string
  amount: string
  date: string
  status: string
}

function TransactionRow({ id, customer, event, ticketType, amount, date, status }: TransactionRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case "refunded":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Refunded</Badge>
      case "pending":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Pending</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 text-slate-300">{id}</td>
      <td className="px-4 py-3 text-slate-300">{customer}</td>
      <td className="px-4 py-3 text-slate-300">{event}</td>
      <td className="px-4 py-3 text-slate-300">{ticketType}</td>
      <td className="px-4 py-3 text-slate-300">{amount}</td>
      <td className="px-4 py-3 text-slate-400">{date}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
    </tr>
  )
}
