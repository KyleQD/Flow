'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, Clock, DollarSign } from 'lucide-react'

interface ShiftAnalyticsProps {
  venueId: string
}

export function ShiftAnalytics({ venueId }: ShiftAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Scheduling Analytics</h3>
        <p className="text-sm text-muted-foreground">
          View insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600">+12% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Staff Utilization</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-green-600">+5% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Labor Cost</p>
                <p className="text-2xl font-bold">$12,450</p>
                <p className="text-xs text-red-600">+8% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-green-600">+2% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { dept: 'Security', hours: 320, cost: 3200, utilization: 92 },
              { dept: 'Technical', hours: 280, cost: 4200, utilization: 88 },
              { dept: 'Service', hours: 450, cost: 3600, utilization: 95 },
              { dept: 'Management', hours: 197, cost: 1450, utilization: 85 }
            ].map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{dept.dept}</p>
                  <p className="text-sm text-muted-foreground">
                    {dept.hours}h • ${dept.cost}
                  </p>
                </div>
                <Badge variant="outline">{dept.utilization}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Shift Completion</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">On-time Arrival</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Staff Satisfaction</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 