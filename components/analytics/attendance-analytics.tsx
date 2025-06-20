"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface AttendanceByDay {
  day: string
  attendance: number
}

interface AttendanceByTime {
  time: string
  attendance: number
}

interface AttendanceAnalyticsProps {
  attendanceByDay: AttendanceByDay[]
  attendanceByTime: AttendanceByTime[]
  isCompact: boolean
}

export function AttendanceAnalytics({ attendanceByDay, attendanceByTime, isCompact }: AttendanceAnalyticsProps) {
  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="pb-2">
        <CardTitle>Attendance Analytics</CardTitle>
        {!isCompact && (
          <CardDescription className="text-white/60">
            Attendance patterns by day of week and time of day
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="byDay" className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="byDay" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              By Day
            </TabsTrigger>
            <TabsTrigger value="byTime" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              By Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="byDay">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceByDay}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    formatter={(value: number) => [value, "Attendance"]}
                    contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="attendance" name="Attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="byTime">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceByTime}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    formatter={(value: number) => [value, "Attendance"]}
                    contentStyle={{ backgroundColor: "#1a1d29", border: "none", borderRadius: "0.5rem" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    name="Attendance"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {!isCompact && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0f1117] rounded-md">
              <h3 className="text-lg font-medium mb-2">Peak Attendance Days</h3>
              <p className="text-white/60 mb-4">
                Your venue sees the highest attendance on weekends, with Saturday being the busiest day.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Saturday</span>
                  <span className="font-medium">780 attendees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Friday</span>
                  <span className="font-medium">620 attendees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sunday</span>
                  <span className="font-medium">450 attendees</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0f1117] rounded-md">
              <h3 className="text-lg font-medium mb-2">Peak Attendance Times</h3>
              <p className="text-white/60 mb-4">
                Your venue sees the highest attendance between 9 PM and 11 PM, with 10 PM being the peak hour.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>10 PM</span>
                  <span className="font-medium">650 attendees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>9 PM</span>
                  <span className="font-medium">580 attendees</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>11 PM</span>
                  <span className="font-medium">520 attendees</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
