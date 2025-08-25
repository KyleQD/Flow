import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
interface Event { id?: string | number; capacity?: number }
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, Mail, UserPlus } from "lucide-react"

interface AttendeesTabProps {
  event: Event
}

// Mock data for attendees
const mockAttendees = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", ticketType: "VIP", checkIn: true },
  { id: 2, name: "Sam Wilson", email: "sam@example.com", ticketType: "General", checkIn: true },
  { id: 3, name: "Jamie Smith", email: "jamie@example.com", ticketType: "General", checkIn: false },
  { id: 4, name: "Taylor Brown", email: "taylor@example.com", ticketType: "VIP", checkIn: false },
  { id: 5, name: "Jordan Lee", email: "jordan@example.com", ticketType: "General", checkIn: true },
]

export default function AttendeesTab({ event }: AttendeesTabProps) {
  // Calculate attendance metrics
  const totalAttendees = mockAttendees.length
  const checkedIn = mockAttendees.filter((a) => a.checkIn).length
  const attendanceRate = event.capacity ? Math.round((totalAttendees / event.capacity) * 100) : 0
  const checkInRate = totalAttendees ? Math.round((checkedIn / totalAttendees) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Attendance Overview */}
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
                  {event.capacity ? `of ${event.capacity} capacity` : "No capacity set"}
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
            <CardTitle className="text-sm font-medium">Ticket Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">VIP</span>
                <span className="text-sm font-medium">
                  {mockAttendees.filter((a) => a.ticketType === "VIP").length}
                </span>
              </div>
              <Progress
                value={(mockAttendees.filter((a) => a.ticketType === "VIP").length / totalAttendees) * 100}
                className="h-2"
              />

              <div className="flex justify-between mt-2">
                <span className="text-sm">General</span>
                <span className="text-sm font-medium">
                  {mockAttendees.filter((a) => a.ticketType === "General").length}
                </span>
              </div>
              <Progress
                value={(mockAttendees.filter((a) => a.ticketType === "General").length / totalAttendees) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendee Actions */}
      <div className="flex flex-wrap gap-2">
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Attendee
        </Button>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Email All
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export List
        </Button>
      </div>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendees.map((attendee) => (
                <TableRow key={attendee.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?key=0gamu&height=32&width=32&query=${attendee.name}`}
                        />
                        <AvatarFallback>{attendee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{attendee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>{attendee.ticketType}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        attendee.checkIn ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {attendee.checkIn ? "Checked In" : "Not Checked In"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      {attendee.checkIn ? "Undo Check-in" : "Check In"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
