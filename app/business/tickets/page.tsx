"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { Search, Plus, Tag, Clock, DollarSign, Users } from "lucide-react"

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  capacity: number
  sold: number
  earlyBird: boolean
  earlyBirdEndDate?: string
  earlyBirdPrice?: number
  groupDiscount: boolean
  groupMinSize?: number
  groupDiscountPercent?: number
  promoCode?: string
  promoDiscount?: number
}

interface Event {
  id: string
  title: string
  date: string
  ticketTypes: TicketType[]
}

// Mock data - replace with actual API calls
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Jam Festival 2025",
    date: "2025-07-15",
    ticketTypes: [
      {
        id: "t1",
        name: "General Admission",
        description: "Standard festival entry",
        price: 49.99,
        capacity: 3000,
        sold: 150,
        earlyBird: true,
        earlyBirdEndDate: "2025-05-15",
        earlyBirdPrice: 39.99,
        groupDiscount: true,
        groupMinSize: 4,
        groupDiscountPercent: 15,
        promoCode: "SUMMER25",
        promoDiscount: 25
      },
      {
        id: "t2",
        name: "VIP Pass",
        description: "VIP area access with complimentary drinks",
        price: 149.99,
        capacity: 500,
        sold: 50,
        earlyBird: false,
        groupDiscount: false
      }
    ]
  },
  {
    id: "2",
    title: "Rock Night Live",
    date: "2025-08-20",
    ticketTypes: [
      {
        id: "t3",
        name: "Standard Entry",
        description: "Regular concert admission",
        price: 39.99,
        capacity: 1500,
        sold: 100,
        earlyBird: false,
        groupDiscount: true,
        groupMinSize: 6,
        groupDiscountPercent: 20
      }
    ]
  }
]

export default function BusinessTicketsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeEvent, setActiveEvent] = React.useState(mockEvents[0].id)
  const [isCreateTicketOpen, setIsCreateTicketOpen] = React.useState(false)
  const [newTicket, setNewTicket] = React.useState<Partial<TicketType>>({
    name: "",
    description: "",
    price: 0,
    capacity: 0,
    earlyBird: false,
    groupDiscount: false
  })

  const selectedEvent = mockEvents.find(event => event.id === activeEvent)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof TicketType) => {
    const value = e.target.type === "number" 
      ? (field === "price" ? parseFloat(e.target.value) : parseInt(e.target.value))
      : e.target.value
    setNewTicket({ ...newTicket, [field]: value })
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to create the ticket
    console.log("Creating ticket:", newTicket)
    setIsCreateTicketOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Ticket Management</h1>
          <p className="text-gray-400">Configure ticket types and pricing for your events</p>
        </div>
        <Button onClick={() => setIsCreateTicketOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket Type
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#13151c] border-gray-800"
          />
        </div>
      </div>

      <Tabs value={activeEvent} onValueChange={setActiveEvent}>
        <TabsList className="bg-[#13151c] border border-gray-800">
          {mockEvents.map((event) => (
            <TabsTrigger
              key={event.id}
              value={event.id}
              className="data-[state=active]:bg-purple-600"
            >
              {event.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {selectedEvent && (
          <TabsContent value={selectedEvent.id} className="mt-6">
            <Card className="bg-[#13151c] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Ticket Types</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage ticket types for {selectedEvent.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEvent.ticketTypes.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{ticket.name}</p>
                            <p className="text-sm text-gray-400">{ticket.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-white">${ticket.price.toFixed(2)}</p>
                            {ticket.earlyBird && (
                              <p className="text-sm text-green-400">
                                Early Bird: ${ticket.earlyBirdPrice?.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-white">{ticket.sold}/{ticket.capacity}</p>
                          <p className="text-sm text-gray-400">
                            {((ticket.sold / ticket.capacity) * 100).toFixed(1)}% sold
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {ticket.earlyBird && (
                              <Badge className="border-green-400 text-green-400">
                                <Clock className="h-3 w-3 mr-1" />
                                Early Bird
                              </Badge>
                            )}
                            {ticket.groupDiscount && (
                              <Badge className="border-blue-400 text-blue-400">
                                <Users className="h-3 w-3 mr-1" />
                                Group
                              </Badge>
                            )}
                            {ticket.promoCode && (
                              <Badge className="border-purple-400 text-purple-400">
                                <Tag className="h-3 w-3 mr-1" />
                                Promo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-white">
                            ${(ticket.sold * ticket.price).toLocaleString()}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Ticket Type</DialogTitle>
            <DialogDescription>
              Add a new ticket type to your event
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ticket Name</Label>
                <Input
                  id="name"
                  value={newTicket.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  className="bg-[#1a1c23] border-gray-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => handleInputChange(e, "description")}
                  className="bg-[#1a1c23] border-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTicket.price}
                    onChange={(e) => handleInputChange(e, "price")}
                    className="bg-[#1a1c23] border-gray-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={newTicket.capacity}
                    onChange={(e) => handleInputChange(e, "capacity")}
                    className="bg-[#1a1c23] border-gray-800"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="earlyBird">Early Bird Pricing</Label>
                  <Switch
                    id="earlyBird"
                    checked={newTicket.earlyBird}
                    onCheckedChange={(checked: boolean) => setNewTicket({ ...newTicket, earlyBird: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="groupDiscount">Group Discount</Label>
                  <Switch
                    id="groupDiscount"
                    checked={newTicket.groupDiscount}
                    onCheckedChange={(checked: boolean) => setNewTicket({ ...newTicket, groupDiscount: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Ticket Type</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 