"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, User } from "lucide-react"

interface AttendeesTabProps {
  event: any
}

export default function AttendeesTab({ event }: AttendeesTabProps) {
  // Mock attendees data
  const mockAttendees = [
    { id: "1", name: "John Doe", email: "john@example.com", checkIn: true, checkInTime: "18:30" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", checkIn: true, checkInTime: "19:15" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", checkIn: false },
    { id: "4", name: "Alice Brown", email: "alice@example.com", checkIn: true, checkInTime: "20:00" },
  ]

  const totalAttendees = mockAttendees.length
  const checkedIn = mockAttendees.filter((a) => a.checkIn).length
  const attendanceRate = 80 // Mock attendance rate
  const checkInRate = totalAttendees ? Math.round((checkedIn / totalAttendees) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Attendance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{totalAttendees}</p>
                <p className="text-xs text-muted-foreground">
                  of 100 capacity
                </p>
              </div>
              <div className="w-24">
                <Progress value={attendanceRate} className="h-2" />
                <p className="text-xs text-right mt-1">{attendanceRate}% full</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{checkedIn}</p>
                <p className="text-xs text-muted-foreground">of {totalAttendees} registered</p>
              </div>
              <div className="w-24">
                <Progress value={checkInRate} className="h-2" />
                <p className="text-xs text-right mt-1">{checkInRate}% checked in</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{totalAttendees - checkedIn}</p>
                <p className="text-xs text-muted-foreground">Not checked in</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendees List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendees List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAttendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{attendee.name}</p>
                    <p className="text-sm text-muted-foreground">{attendee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {attendee.checkIn ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Checked In
                      </Badge>
                      <span className="text-sm text-muted-foreground">{attendee.checkInTime}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
