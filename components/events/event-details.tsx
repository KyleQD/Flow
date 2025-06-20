"use client"

import type React from "react"

import { useState } from "react"
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  Music,
  Share2,
  Tag,
  Ticket,
  Trash2,
  User,
  Users,
  Loader2,
  Save,
  X,
} from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateEvent } from "@/lib/events/actions"
import { useToast } from "@/components/ui/use-toast"

interface Event {
  id: string
  title: string
  performer: string
  date: string
  time: string
  status: string
  ticketsSold: number
  totalTickets: number
  ticketPrice: string
  revenue: string
  description: string
  image: string
  venue: string
  genres: string[]
  promoter: string
  staffAssigned: string[]
  createdAt: string
}

interface EventDetailsProps {
  event: Event
  onDeleteEvent: (id: string) => void
  onEventUpdated: (event: Event) => void
}

export function EventDetails({ event, onDeleteEvent, onEventUpdated }: EventDetailsProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedEvent, setEditedEvent] = useState<Event>(event)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-0">Completed</Badge>
      case "draft":
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0">Draft</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0">Cancelled</Badge>
      default:
        return <Badge className="bg-white/10 text-white hover:bg-white/20 border-0">{status}</Badge>
    }
  }

  const ticketSalesPercentage = Math.round((event.ticketsSold / event.totalTickets) * 100)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedEvent({
      ...editedEvent,
      [name]: value,
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const updatedEvent = await updateEvent(event.id, editedEvent)
      onEventUpdated(updatedEvent)
      setIsEditing(false)
      toast({
        title: "Event Updated",
        description: "The event has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: "Failed to update the event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedEvent(event)
    setIsEditing(false)
  }

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <img src={event.image || "/placeholder.svg"} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d29] to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div>
            {isEditing ? (
              <Input
                name="title"
                value={editedEvent.title}
                onChange={handleInputChange}
                className="bg-[#0f1117]/80 border-0 text-white text-xl font-bold mb-1"
              />
            ) : (
              <h2 className="text-xl font-bold text-white drop-shadow-md">{event.title}</h2>
            )}
            {isEditing ? (
              <Input
                name="performer"
                value={editedEvent.performer}
                onChange={handleInputChange}
                className="bg-[#0f1117]/80 border-0 text-white"
              />
            ) : (
              <p className="text-white/80 drop-shadow-md">{event.performer}</p>
            )}
          </div>
          {getStatusBadge(event.status)}
        </div>
      </div>

      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Tickets
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Details
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <Calendar className="h-5 w-5 text-purple-400" />
                <div className="flex-1">
                  <div className="text-sm text-white/60">Date</div>
                  {isEditing ? (
                    <Input
                      name="date"
                      type="date"
                      value={editedEvent.date}
                      onChange={handleInputChange}
                      className="bg-[#0f1117] border-0 text-white p-0 h-7"
                    />
                  ) : (
                    <div className="font-medium">{event.date}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <Clock className="h-5 w-5 text-purple-400" />
                <div className="flex-1">
                  <div className="text-sm text-white/60">Time</div>
                  {isEditing ? (
                    <Input
                      name="time"
                      value={editedEvent.time}
                      onChange={handleInputChange}
                      className="bg-[#0f1117] border-0 text-white p-0 h-7"
                    />
                  ) : (
                    <div className="font-medium">{event.time}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <Ticket className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Tickets</div>
                  <div className="font-medium">
                    {event.ticketsSold} / {event.totalTickets} sold
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <DollarSign className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Revenue</div>
                  <div className="font-medium">{event.revenue}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-2">Event Description</h3>
              {isEditing ? (
                <Textarea
                  name="description"
                  value={editedEvent.description}
                  onChange={handleInputChange}
                  className="bg-[#0f1117] border-0 text-white min-h-[100px]"
                />
              ) : (
                <p className="text-white/80">{event.description}</p>
              )}
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-400" />
                  <span className="text-white/60">Promoter:</span>
                  {isEditing ? (
                    <Input
                      name="promoter"
                      value={editedEvent.promoter}
                      onChange={handleInputChange}
                      className="bg-[#0f1117] border-0 text-white p-0 h-7 w-32"
                    />
                  ) : (
                    <span>{event.promoter}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-purple-400" />
                  <span className="text-white/60">Venue:</span>
                  {isEditing ? (
                    <Input
                      name="venue"
                      value={editedEvent.venue}
                      onChange={handleInputChange}
                      className="bg-[#0f1117] border-0 text-white p-0 h-7 w-32"
                    />
                  ) : (
                    <span>{event.venue}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-400" />
                  <span className="text-white/60">Genres:</span>
                  <span>{event.genres.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="text-white/60">Staff:</span>
                  <span>{event.staffAssigned.length} assigned</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Ticket Sales</h3>
                <Badge
                  variant="outline"
                  className={`${
                    ticketSalesPercentage >= 75
                      ? "bg-green-500/10 text-green-500"
                      : ticketSalesPercentage >= 50
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-blue-500/10 text-blue-500"
                  } border-0`}
                >
                  {ticketSalesPercentage}% Sold
                </Badge>
              </div>
              <Progress value={ticketSalesPercentage} className="h-2 mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#1a1d29] p-3 rounded-md">
                  <div className="text-sm text-white/60">Tickets Sold</div>
                  <div className="text-xl font-medium">{event.ticketsSold}</div>
                </div>
                <div className="bg-[#1a1d29] p-3 rounded-md">
                  <div className="text-sm text-white/60">Available</div>
                  <div className="text-xl font-medium">{event.totalTickets - event.ticketsSold}</div>
                </div>
                <div className="bg-[#1a1d29] p-3 rounded-md">
                  <div className="text-sm text-white/60">Ticket Price</div>
                  <div className="text-xl font-medium">{event.ticketPrice}</div>
                </div>
                <div className="bg-[#1a1d29] p-3 rounded-md">
                  <div className="text-sm text-white/60">Total Revenue</div>
                  <div className="text-xl font-medium">{event.revenue}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ticket Dashboard
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Ticket className="mr-2 h-4 w-4" />
                  Manage Tickets
                </Button>
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Ticket Types</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#1a1d29] rounded-md">
                  <div>
                    <div className="font-medium">General Admission</div>
                    <div className="text-sm text-white/60">350 / 500 sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{event.ticketPrice}</div>
                    <div className="text-sm text-white/60">Standard</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1a1d29] rounded-md">
                  <div>
                    <div className="font-medium">VIP Access</div>
                    <div className="text-sm text-white/60">75 / 100 sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$50</div>
                    <div className="text-sm text-white/60">Premium</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1a1d29] rounded-md">
                  <div>
                    <div className="font-medium">Early Bird</div>
                    <div className="text-sm text-white/60">25 / 25 sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$25</div>
                    <div className="text-sm text-green-500">Sold Out</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Event Schedule</h3>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-[#1a1d29] rounded-md">
                  <div className="text-center">
                    <div className="text-xs text-white/60">Start</div>
                    <div className="font-medium">6:00 PM</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Doors Open</div>
                    <div className="text-sm text-white/60">Venue opens to ticket holders</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-[#1a1d29] rounded-md">
                  <div className="text-center">
                    <div className="text-xs text-white/60">Time</div>
                    <div className="font-medium">7:00 PM</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Opening Act</div>
                    <div className="text-sm text-white/60">Local artist performance</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-[#1a1d29] rounded-md">
                  <div className="text-center">
                    <div className="text-xs text-white/60">Time</div>
                    <div className="font-medium">8:30 PM</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Main Performance</div>
                    <div className="text-sm text-white/60">{event.performer} takes the stage</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-[#1a1d29] rounded-md">
                  <div className="text-center">
                    <div className="text-xs text-white/60">End</div>
                    <div className="font-medium">11:00 PM</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Event Ends</div>
                    <div className="text-sm text-white/60">Venue closes</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Venue Setup</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <Music className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Stage Configuration</div>
                      <div className="text-sm text-white/60">Main stage with full lighting rig</div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500 border-0">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Seating Arrangement</div>
                      <div className="text-sm text-white/60">General admission standing room</div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500 border-0">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Bar Service</div>
                      <div className="text-sm text-white/60">Full bar with specialty cocktails</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-0">Pending</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Assigned Staff</h3>
                <Button variant="outline" size="sm" className="h-8 border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                  <Users className="mr-2 h-4 w-4" />
                  Assign Staff
                </Button>
              </div>
              <div className="space-y-3">
                {event.staffAssigned.length > 0 ? (
                  event.staffAssigned.map((staff, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-purple-600/50">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32&query=person`} alt={staff} />
                          <AvatarFallback>{staff.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff}</div>
                          <div className="text-sm text-white/60">
                            {index === 0
                              ? "Event Manager"
                              : index === 1
                                ? "Sound Engineer"
                                : index === 2
                                  ? "Lighting Technician"
                                  : "Staff Member"}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-white/60 hover:text-white">
                        View
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-white/60">No staff assigned to this event yet</div>
                )}
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Staff Requirements</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Sound Engineers</span>
                  <span className="text-white/60">2 needed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lighting Technicians</span>
                  <span className="text-white/60">2 needed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Personnel</span>
                  <span className="text-white/60">4 needed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bar Staff</span>
                  <span className="text-white/60">6 needed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Door Staff</span>
                  <span className="text-white/60">2 needed</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => onDeleteEvent(event.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
