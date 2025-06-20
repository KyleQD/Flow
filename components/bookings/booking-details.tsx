"use client"

import { useState } from "react"
import { Calendar, Clock, DollarSign, Download, Mail, MessageSquare, Phone, User, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Booking {
  id: string
  title: string
  artist: string
  date: string
  time: string
  status: string
  attendees: number
  fee: string
  description: string
  requirements: string
  contactName: string
  contactEmail: string
  contactPhone: string
  createdAt: string
}

interface BookingDetailsProps {
  booking: Booking
}

export function BookingDetails({ booking }: BookingDetailsProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [responseMessage, setResponseMessage] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0">Rejected</Badge>
      default:
        return <Badge className="bg-white/10 text-white hover:bg-white/20 border-0">{status}</Badge>
    }
  }

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{booking.title}</CardTitle>
            <CardDescription className="text-white/60">Booking request from {booking.artist}</CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="details" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Details
            </TabsTrigger>
            <TabsTrigger
              value="requirements"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Requirements
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <Calendar className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Date</div>
                  <div className="font-medium">{booking.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <Clock className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Time</div>
                  <div className="font-medium">{booking.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <Users className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Expected Attendees</div>
                  <div className="font-medium">{booking.attendees}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <DollarSign className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Booking Fee</div>
                  <div className="font-medium">{booking.fee}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-2">Event Description</h3>
              <p className="text-white/80">{booking.description}</p>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Attachments</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#1a1d29] p-2 rounded">
                  <span className="text-sm">Stage Plot.pdf</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-[#1a1d29] p-2 rounded">
                  <span className="text-sm">Technical Rider.pdf</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-2">Technical Requirements</h3>
              <p className="text-white/80">{booking.requirements}</p>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-2">Additional Requests</h3>
              <ul className="list-disc list-inside text-white/80 space-y-1">
                <li>Green room access for 5 people</li>
                <li>Bottled water and light snacks</li>
                <li>Secure parking for tour van</li>
                <li>Load-in access 4 hours before event</li>
              </ul>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-2">Venue Resources Needed</h3>
              <div className="grid grid-cols-2 gap-2">
                <Badge className="justify-start bg-purple-500/10 text-purple-400 border-0">Sound Engineer</Badge>
                <Badge className="justify-start bg-purple-500/10 text-purple-400 border-0">Lighting Technician</Badge>
                <Badge className="justify-start bg-purple-500/10 text-purple-400 border-0">Stage Manager</Badge>
                <Badge className="justify-start bg-purple-500/10 text-purple-400 border-0">Security Staff</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-sm text-white/60">Contact Person</div>
                    <div className="font-medium">{booking.contactName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-sm text-white/60">Email</div>
                    <div className="font-medium">{booking.contactEmail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-sm text-white/60">Phone</div>
                    <div className="font-medium">{booking.contactPhone}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Send Message</h3>
              <Textarea
                placeholder="Type your message here..."
                className="bg-[#1a1d29] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 min-h-[120px]"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {booking.status === "pending" && (
        <>
          <Separator className="bg-white/10" />
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400">
              Reject Booking
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">Approve Booking</Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
