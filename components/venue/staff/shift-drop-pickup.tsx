"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, XCircle, UserPlus, UserMinus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Shift {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  location: string
  department: string
  staff_needed: number
  staff_assigned: number
  status: "open" | "filled" | "in_progress" | "completed" | "cancelled"
  hourly_rate?: number
}

interface ShiftRequest {
  id: string
  requester_id: string
  requester_name: string
  shift_id: string
  shift: Shift
  request_type: "drop" | "pickup"
  status: "pending" | "approved" | "denied" | "cancelled"
  reason: string
  created_at: string
  response_note?: string
}

interface ShiftDropPickupProps {
  venueId: string
  currentUserId: string
}

export function ShiftDropPickup({ venueId, currentUserId }: ShiftDropPickupProps) {
  const [assignedShifts, setAssignedShifts] = useState<Shift[]>([])
  const [availableShifts, setAvailableShifts] = useState<Shift[]>([])
  const [requests, setRequests] = useState<ShiftRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("drop")
  const [isDropDialogOpen, setIsDropDialogOpen] = useState(false)
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<string>("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Mock data - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setAssignedShifts([
          {
            id: "1",
            title: "Morning Service",
            date: "2024-01-25",
            start_time: "08:00",
            end_time: "16:00",
            location: "Main Floor",
            department: "Service",
            staff_needed: 4,
            staff_assigned: 3,
            status: "open",
            hourly_rate: 18.50
          },
          {
            id: "2",
            title: "Evening Service",
            date: "2024-01-26",
            start_time: "16:00",
            end_time: "00:00",
            location: "Main Floor",
            department: "Service",
            staff_needed: 3,
            staff_assigned: 2,
            status: "open",
            hourly_rate: 20.00
          }
        ])

        setAvailableShifts([
          {
            id: "3",
            title: "Security Night Shift",
            date: "2024-01-25",
            start_time: "00:00",
            end_time: "08:00",
            location: "All Areas",
            department: "Security",
            staff_needed: 2,
            staff_assigned: 1,
            status: "open",
            hourly_rate: 22.00
          },
          {
            id: "4",
            title: "Kitchen Prep",
            date: "2024-01-26",
            start_time: "06:00",
            end_time: "14:00",
            location: "Kitchen",
            department: "Kitchen",
            staff_needed: 3,
            staff_assigned: 2,
            status: "open",
            hourly_rate: 19.50
          },
          {
            id: "5",
            title: "Bar Service",
            date: "2024-01-27",
            start_time: "18:00",
            end_time: "02:00",
            location: "Bar Area",
            department: "Service",
            staff_needed: 2,
            staff_assigned: 1,
            status: "open",
            hourly_rate: 21.00
          }
        ])

        setRequests([
          {
            id: "1",
            requester_id: currentUserId,
            requester_name: "John Doe",
            shift_id: "1",
            shift: {
              id: "1",
              title: "Morning Service",
              date: "2024-01-25",
              start_time: "08:00",
              end_time: "16:00",
              location: "Main Floor",
              department: "Service",
              staff_needed: 4,
              staff_assigned: 3,
              status: "open",
              hourly_rate: 18.50
            },
            request_type: "drop",
            status: "pending",
            reason: "Feeling unwell, need to rest",
            created_at: "2024-01-20T09:15:00Z"
          },
          {
            id: "2",
            requester_id: currentUserId,
            requester_name: "John Doe",
            shift_id: "3",
            shift: {
              id: "3",
              title: "Security Night Shift",
              date: "2024-01-25",
              start_time: "00:00",
              end_time: "08:00",
              location: "All Areas",
              department: "Security",
              staff_needed: 2,
              staff_assigned: 1,
              status: "open",
              hourly_rate: 22.00
            },
            request_type: "pickup",
            status: "approved",
            reason: "Available and need extra hours",
            created_at: "2024-01-19T16:45:00Z"
          }
        ])
      } catch (error) {
        toast.error("Failed to load shift data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [venueId, currentUserId])

  const handleDropRequest = async () => {
    if (!selectedShift || !reason.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/venue/shifts/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: currentUserId,
          shift_id: selectedShift,
          request_type: "drop",
          reason: reason.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create drop request")
      }

      const { request } = await response.json()
      
      // Add to local state
      setRequests(prev => [request, ...prev])
      
      toast.success("Drop request submitted successfully")
      setIsDropDialogOpen(false)
      setSelectedShift("")
      setReason("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit drop request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePickupRequest = async () => {
    if (!selectedShift || !reason.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/venue/shifts/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: currentUserId,
          shift_id: selectedShift,
          request_type: "pickup",
          reason: reason.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create pickup request")
      }

      const { request } = await response.json()
      
      // Add to local state
      setRequests(prev => [request, ...prev])
      
      toast.success("Pickup request submitted successfully")
      setIsPickupDialogOpen(false)
      setSelectedShift("")
      setReason("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit pickup request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      denied: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    }
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getRequestTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "drop" ? "destructive" : "default"}>
        {type.toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drop & Pickup Requests</h2>
          <p className="text-muted-foreground">
            Request to drop shifts you're assigned to or pick up available shifts
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isDropDialogOpen} onOpenChange={setIsDropDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserMinus className="h-4 w-4 mr-2" />
                Drop Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request to Drop Shift</DialogTitle>
                <DialogDescription>
                  Select a shift you're assigned to and provide a reason for dropping it
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="drop-shift">Select Shift to Drop</Label>
                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{shift.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(shift.date), "MMM dd")} • {shift.start_time}-{shift.end_time}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="drop-reason">Reason for Dropping</Label>
                  <Textarea
                    id="drop-reason"
                    placeholder="Explain why you need to drop this shift..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Dropping shifts may affect your schedule and availability. Please provide a valid reason.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDropDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDropRequest}
                  disabled={isSubmitting || !selectedShift || !reason.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPickupDialogOpen} onOpenChange={setIsPickupDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Pick Up Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request to Pick Up Shift</DialogTitle>
                <DialogDescription>
                  Select an available shift you'd like to pick up
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pickup-shift">Select Shift to Pick Up</Label>
                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{shift.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(shift.date), "MMM dd")} • {shift.start_time}-{shift.end_time}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ${shift.hourly_rate}/hr
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pickup-reason">Reason for Pickup</Label>
                  <Textarea
                    id="pickup-reason"
                    placeholder="Explain why you want to pick up this shift..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPickupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePickupRequest}
                  disabled={isSubmitting || !selectedShift || !reason.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drop" className="flex items-center space-x-2">
            <UserMinus className="h-4 w-4" />
            <span>Drop Requests</span>
          </TabsTrigger>
          <TabsTrigger value="pickup" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Pickup Requests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drop" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Drop Requests</CardTitle>
                  <CardDescription>
                    Track the status of your shift drop requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {requests.filter(r => r.request_type === "drop").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <UserMinus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No drop requests yet</p>
                          <p className="text-sm">Request to drop a shift when you need to</p>
                        </div>
                      ) : (
                        requests
                          .filter(r => r.request_type === "drop")
                          .map((request) => (
                            <Card key={request.id} className="border-l-4 border-l-red-500">
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{request.requester_name}</span>
                                      {getRequestTypeBadge(request.request_type)}
                                      {getStatusBadge(request.status)}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {format(new Date(request.created_at), "MMM dd, yyyy")}
                                    </span>
                                  </div>

                                  <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="font-medium">{request.shift.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {format(new Date(request.shift.date), "EEEE, MMM dd")}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.shift.start_time} - {request.shift.end_time}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.shift.location}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="font-medium text-sm">Reason:</span>
                                    <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                                  </div>

                                  {request.response_note && (
                                    <div>
                                      <span className="font-medium text-sm">Response:</span>
                                      <p className="text-sm text-muted-foreground mt-1">{request.response_note}</p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Assigned Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignedShifts.map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{shift.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(shift.date), "MMM dd")} • {shift.start_time}-{shift.end_time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${shift.hourly_rate}/hr
                          </div>
                        </div>
                        <Badge variant="outline">Assigned</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pickup" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Pickup Requests</CardTitle>
                  <CardDescription>
                    Track the status of your shift pickup requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {requests.filter(r => r.request_type === "pickup").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No pickup requests yet</p>
                          <p className="text-sm">Request to pick up available shifts</p>
                        </div>
                      ) : (
                        requests
                          .filter(r => r.request_type === "pickup")
                          .map((request) => (
                            <Card key={request.id} className="border-l-4 border-l-green-500">
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{request.requester_name}</span>
                                      {getRequestTypeBadge(request.request_type)}
                                      {getStatusBadge(request.status)}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {format(new Date(request.created_at), "MMM dd, yyyy")}
                                    </span>
                                  </div>

                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="font-medium">{request.shift.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {format(new Date(request.shift.date), "EEEE, MMM dd")}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.shift.start_time} - {request.shift.end_time}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.shift.location} • ${request.shift.hourly_rate}/hr
                                    </div>
                                  </div>

                                  <div>
                                    <span className="font-medium text-sm">Reason:</span>
                                    <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                                  </div>

                                  {request.response_note && (
                                    <div>
                                      <span className="font-medium text-sm">Response:</span>
                                      <p className="text-sm text-muted-foreground mt-1">{request.response_note}</p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Available Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableShifts.map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{shift.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(shift.date), "MMM dd")} • {shift.start_time}-{shift.end_time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${shift.hourly_rate}/hr
                          </div>
                        </div>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 