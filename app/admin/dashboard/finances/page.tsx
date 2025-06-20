"use client"

import {
  BarChart3,
  DollarSign,
  Download,
  FileText,
  LineChart,
  PieChart,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Header } from "@/components/header"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FinancesPage() {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <PageHeader
        title="Financial Management"
        icon={DollarSign}
        description="Track budgets, expenses, and revenue for all your events"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <FinanceCard title="Total Revenue" value="$172,500" trend="+12% from last event" trendUp={true} />
        <FinanceCard title="Total Expenses" value="$84,500" trend="+5% from last event" trendUp={false} />
        <FinanceCard title="Net Profit" value="$88,000" trend="+18% from last event" trendUp={true} />
        <FinanceCard title="Budget Utilization" value="42%" trend="$115,500 remaining" trendUp={null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <LineChart className="mr-2 h-5 w-5 text-purple-500" />
                Revenue vs Expenses
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
                <RevenueExpensesChart />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <PieChart className="mr-2 h-5 w-5 text-purple-500" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 w-full relative bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden p-4 mb-4">
                <ExpenseBreakdownChart />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-slate-300">Venue Rental</span>
                  </div>
                  <span className="text-slate-400">$30,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-pink-500 mr-2"></div>
                    <span className="text-slate-300">Artist Fees</span>
                  </div>
                  <span className="text-slate-400">$25,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-slate-300">Equipment</span>
                  </div>
                  <span className="text-slate-400">$15,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-slate-300">Marketing</span>
                  </div>
                  <span className="text-slate-400">$8,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-slate-300">Other</span>
                  </div>
                  <span className="text-slate-400">$6,500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="bg-slate-800/50 p-1 mb-6">
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="budget" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
            Budget
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Expense Transactions
              </CardTitle>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                      <ExpenseRow
                        date="Jul 10, 2023"
                        description="Venue Deposit"
                        category="Venue"
                        vendor="Riverside Amphitheater"
                        amount="$15,000.00"
                        status="paid"
                      />
                      <ExpenseRow
                        date="Jul 12, 2023"
                        description="Artist Deposit"
                        category="Talent"
                        vendor="Headline Performer"
                        amount="$12,500.00"
                        status="paid"
                      />
                      <ExpenseRow
                        date="Jul 15, 2023"
                        description="Sound Equipment Rental"
                        category="Equipment"
                        vendor="SoundMasters Pro"
                        amount="$8,000.00"
                        status="paid"
                      />
                      <ExpenseRow
                        date="Jul 18, 2023"
                        description="Marketing Campaign"
                        category="Marketing"
                        vendor="Digital Ads Agency"
                        amount="$5,000.00"
                        status="paid"
                      />
                      <ExpenseRow
                        date="Jul 20, 2023"
                        description="Security Deposit"
                        category="Security"
                        vendor="EventSafe Solutions"
                        amount="$3,000.00"
                        status="pending"
                      />
                      <ExpenseRow
                        date="Jul 25, 2023"
                        description="Transportation Booking"
                        category="Logistics"
                        vendor="Elite Transport Services"
                        amount="$4,500.00"
                        status="pending"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Revenue Sources
              </CardTitle>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" /> Add Revenue
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Units
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                      <RevenueRow
                        source="Ticket Sales"
                        description="General Admission"
                        units="2,100"
                        unitPrice="$45.00"
                        total="$94,500.00"
                        status="received"
                      />
                      <RevenueRow
                        source="Ticket Sales"
                        description="VIP Access"
                        units="850"
                        unitPrice="$120.00"
                        total="$102,000.00"
                        status="received"
                      />
                      <RevenueRow
                        source="Ticket Sales"
                        description="Early Bird"
                        units="500"
                        unitPrice="$35.00"
                        total="$17,500.00"
                        status="received"
                      />
                      <RevenueRow
                        source="Sponsorships"
                        description="Main Stage Sponsor"
                        units="1"
                        unitPrice="$25,000.00"
                        total="$25,000.00"
                        status="received"
                      />
                      <RevenueRow
                        source="Sponsorships"
                        description="VIP Area Sponsor"
                        units="1"
                        unitPrice="$15,000.00"
                        total="$15,000.00"
                        status="pending"
                      />
                      <RevenueRow
                        source="Concessions"
                        description="Food & Beverage"
                        units="1"
                        unitPrice="$20,000.00"
                        total="$20,000.00"
                        status="estimated"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                Budget Overview
              </CardTitle>
              <Button variant="outline" className="border-slate-700">
                <Download className="h-4 w-4 mr-2" /> Export Budget
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-200">Total Budget: $200,000</h3>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">42% Used</Badge>
                  </div>
                  <Progress value={42} className="h-2 bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: "42%" }}
                    />
                  </Progress>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BudgetCategoryCard
                    category="Venue"
                    allocated={50000}
                    spent={30000}
                    remaining={20000}
                    percentage={60}
                  />

                  <BudgetCategoryCard
                    category="Talent"
                    allocated={60000}
                    spent={25000}
                    remaining={35000}
                    percentage={42}
                  />

                  <BudgetCategoryCard
                    category="Production"
                    allocated={40000}
                    spent={15000}
                    remaining={25000}
                    percentage={38}
                  />

                  <BudgetCategoryCard
                    category="Marketing"
                    allocated={20000}
                    spent={8000}
                    remaining={12000}
                    percentage={40}
                  />

                  <BudgetCategoryCard
                    category="Logistics"
                    allocated={15000}
                    spent={4500}
                    remaining={10500}
                    percentage={30}
                  />

                  <BudgetCategoryCard
                    category="Staff"
                    allocated={10000}
                    spent={2000}
                    remaining={8000}
                    percentage={20}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Invoices
              </CardTitle>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" /> Create Invoice
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                      <InvoiceRow
                        id="INV-2023-001"
                        date="Jun 15, 2023"
                        client="TechCorp Inc."
                        description="Sponsorship Package"
                        amount="$25,000.00"
                        status="paid"
                      />
                      <InvoiceRow
                        id="INV-2023-002"
                        date="Jun 20, 2023"
                        client="Luxury Brands Co."
                        description="VIP Area Sponsorship"
                        amount="$15,000.00"
                        status="pending"
                      />
                      <InvoiceRow
                        id="INV-2023-003"
                        date="Jun 25, 2023"
                        client="Refreshments Inc."
                        description="Beverage Concession Rights"
                        amount="$10,000.00"
                        status="paid"
                      />
                      <InvoiceRow
                        id="INV-2023-004"
                        date="Jul 01, 2023"
                        client="Local Radio Station"
                        description="Media Partnership"
                        amount="$5,000.00"
                        status="overdue"
                      />
                      <InvoiceRow
                        id="INV-2023-005"
                        date="Jul 10, 2023"
                        client="Food Truck Collective"
                        description="Food Vendor Fees"
                        amount="$7,500.00"
                        status="draft"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface FinanceCardProps {
  title: string
  value: string
  trend: string
  trendUp: boolean | null
}

function FinanceCard({ title, value, trend, trendUp }: FinanceCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col">
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
          <p
            className={`text-xs mt-1 flex items-center ${
              trendUp === true ? "text-green-400" : trendUp === false ? "text-red-400" : "text-slate-400"
            }`}
          >
            {trendUp === true && <TrendingUp className="h-3 w-3 mr-1" />}
            {trendUp === false && <TrendingDown className="h-3 w-3 mr-1" />}
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueExpensesChart() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between text-xs text-slate-400 mb-4">
        <div>Revenue vs Expenses - Last 6 Months</div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
            Revenue
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-pink-500 mr-1"></div>
            Expenses
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
          <div className="text-xs text-slate-500">$200k</div>
          <div className="text-xs text-slate-500">$150k</div>
          <div className="text-xs text-slate-500">$100k</div>
          <div className="text-xs text-slate-500">$50k</div>
          <div className="text-xs text-slate-500">$0</div>
        </div>

        {/* X-axis grid lines */}
        <div className="absolute left-0 right-0 top-0 h-full flex flex-col justify-between py-4 px-10">
          <div className="border-b border-slate-700/30 w-full"></div>
          <div className="border-b border-slate-700/30 w-full"></div>
          <div className="border-b border-slate-700/30 w-full"></div>
          <div className="border-b border-slate-700/30 w-full"></div>
          <div className="border-b border-slate-700/30 w-full"></div>
        </div>

        {/* Chart lines */}
        <div className="absolute inset-0 px-10 py-4">
          <svg className="w-full h-full">
            {/* Revenue line */}
            <path
              d="M0,120 L80,100 L160,80 L240,60 L320,30 L400,10"
              fill="none"
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
              className="drop-shadow-md"
            />

            {/* Expenses line */}
            <path
              d="M0,140 L80,130 L160,120 L240,110 L320,100 L400,90"
              fill="none"
              stroke="rgb(236, 72, 153)"
              strokeWidth="2"
              className="drop-shadow-md"
            />
          </svg>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <div>Feb</div>
        <div>Mar</div>
        <div>Apr</div>
        <div>May</div>
        <div>Jun</div>
        <div>Jul</div>
      </div>
    </div>
  )
}

function ExpenseBreakdownChart() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {/* Venue Rental - 35% */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="rgb(168, 85, 247)"
          strokeWidth="20"
          strokeDasharray="251.2"
          strokeDashoffset="0"
          className="drop-shadow-md"
        />

        {/* Artist Fees - 30% */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="rgb(236, 72, 153)"
          strokeWidth="20"
          strokeDasharray="251.2"
          strokeDashoffset="251.2"
          strokeDashoffset="75.36"
          className="drop-shadow-md"
        />

        {/* Equipment - 18% */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="rgb(59, 130, 246)"
          strokeWidth="20"
          strokeDasharray="251.2"
          strokeDashoffset="150.72"
          className="drop-shadow-md"
        />

        {/* Marketing - 9% */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="rgb(34, 197, 94)"
          strokeWidth="20"
          strokeDasharray="251.2"
          strokeDashoffset="195.94"
          className="drop-shadow-md"
        />

        {/* Other - 8% */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="rgb(245, 158, 11)"
          strokeWidth="20"
          strokeDasharray="251.2"
          strokeDashoffset="216.03"
          className="drop-shadow-md"
        />
      </svg>
    </div>
  )
}

interface ExpenseRowProps {
  date: string
  description: string
  category: string
  vendor: string
  amount: string
  status: string
}

function ExpenseRow({ date, description, category, vendor, amount, status }: ExpenseRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Paid</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 text-slate-300">{date}</td>
      <td className="px-4 py-3 text-slate-300">{description}</td>
      <td className="px-4 py-3 text-slate-300">{category}</td>
      <td className="px-4 py-3 text-slate-300">{vendor}</td>
      <td className="px-4 py-3 text-slate-300">{amount}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
    </tr>
  )
}

interface RevenueRowProps {
  source: string
  description: string
  units: string
  unitPrice: string
  total: string
  status: string
}

function RevenueRow({ source, description, units, unitPrice, total, status }: RevenueRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "received":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Received</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
      case "estimated":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Estimated</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 text-slate-300">{source}</td>
      <td className="px-4 py-3 text-slate-300">{description}</td>
      <td className="px-4 py-3 text-slate-300">{units}</td>
      <td className="px-4 py-3 text-slate-300">{unitPrice}</td>
      <td className="px-4 py-3 text-slate-300">{total}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
    </tr>
  )
}

interface BudgetCategoryCardProps {
  category: string
  allocated: number
  spent: number
  remaining: number
  percentage: number
}

function BudgetCategoryCard({ category, allocated, spent, remaining, percentage }: BudgetCategoryCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-md p-4 border border-slate-700/50">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-slate-200">{category}</h4>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{percentage}% Used</Badge>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Allocated:</span>
          <span className="text-slate-300">${allocated.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Spent:</span>
          <span className="text-slate-300">${spent.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Remaining:</span>
          <span className="text-green-400">${remaining.toLocaleString()}</span>
        </div>
      </div>

      <Progress value={percentage} className="h-1.5 bg-slate-700">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </Progress>
    </div>
  )
}

interface InvoiceRowProps {
  id: string
  date: string
  client: string
  description: string
  amount: string
  status: string
}

function InvoiceRow({ id, date, client, description, amount, status }: InvoiceRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Paid</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Overdue</Badge>
      case "draft":
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Draft</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 text-slate-300">{id}</td>
      <td className="px-4 py-3 text-slate-300">{date}</td>
      <td className="px-4 py-3 text-slate-300">{client}</td>
      <td className="px-4 py-3 text-slate-300">{description}</td>
      <td className="px-4 py-3 text-slate-300">{amount}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <FileText className="h-4 w-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Download className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
