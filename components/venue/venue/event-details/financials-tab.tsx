"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react"

interface FinancialsTabProps {
  event: any
}

export default function FinancialsTab({ event }: FinancialsTabProps) {
  // Mock financial data
  const financialData = {
    totalRevenue: 15000,
    ticketSales: 12000,
    merchandise: 2000,
    concessions: 1000,
    expenses: 8000,
    profit: 7000,
    ticketsSold: 120,
    totalTickets: 150,
    averageTicketPrice: 100
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${financialData.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">From all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${financialData.profit.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">After expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              Ticket Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{financialData.ticketsSold}/{financialData.totalTickets}</p>
            <p className="text-xs text-muted-foreground">Tickets sold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ticket Sales</span>
                <span className="font-medium">${financialData.ticketSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Merchandise</span>
                <span className="font-medium">${financialData.merchandise.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Concessions</span>
                <span className="font-medium">${financialData.concessions.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Revenue</span>
                  <span className="font-bold">${financialData.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Venue Rental</span>
                <span className="font-medium">$3,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Staff & Security</span>
                <span className="font-medium">$2,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Marketing</span>
                <span className="font-medium">$1,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Equipment</span>
                <span className="font-medium">$1,000</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-bold text-red-600">${financialData.expenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${financialData.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">${financialData.expenses.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">${financialData.profit.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Net Profit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{Math.round((financialData.profit / financialData.totalRevenue) * 100)}%</p>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
