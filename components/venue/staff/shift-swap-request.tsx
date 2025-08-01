"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, ArrowLeftRight, AlertTriangle, CheckCircle } from "lucide-react"
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
}

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  avatar_url?: string
}

interface ShiftSwapRequest {
  id: string
  requester_id: string
  requester_name: string
  target_shift_id: string
  target_shift: Shift
  offered_shift_id: string
  offered_shift: Shift
  status: "pending" | "approved" | "denied" | "cancelled"
  reason: string
  created_at: string
  response_note?: string
}

interface ShiftSwapRequestProps {
  venueId: string
  currentUserId: string
}

export function ShiftSwapRequest({ venueId, currentUserId }: ShiftSwapRequestProps) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTargetShift, setSelectedTargetShift] = useState<string>("")
  const [selectedOfferedShift, setSelectedOfferedShift] = useState<string>("")
  const [selectedStaffMember, setSelectedStaffMember] = useState<string>("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Mock data - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setShifts([
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
            status: "open"
          },
          {
            id: "2",
            title: "Evening Service",
            date: "2024-01-25",
            start_time: "16:00",
            end_time: "00:00",
            location: "Main Floor",
            department: "Service",
            staff_needed: 3,
            staff_assigned: 2,
            status: "open"
          },
          {
            id: "3",
            title: "Security Night Shift",
            date: "2024-01-26",
            start_time: "00:00",
            end_time: "08:00",
            location: "All Areas",
            department: "Security",
            staff_needed: 2,
            staff_assigned: 1,
            status: "open"
          }
        ])

        setStaffMembers([
          { id: "1", name: "John Doe", role: "Server", department: "Service" },
          { id: "2", name: "Jane Smith", role: "Bartender", department: "Service" },
          { id: "3", name: "Mike Johnson", role: "Security Guard", department: "Security" },
          { id: "4", name: "Sarah Wilson", role: "Manager", department: "Management" }
        ])

        setSwapRequests([
          {
            id: "1",
            requester_id: "1",
            requester_name: "John Doe",
            target_shift_id: "1",
            target_shift: {
              id: "1",
              title: "Morning Service",
              date: "2024-01-25",
              start_time: "08:00",
              end_time: "16:00",
              location: "Main Floor",
              department: "Service",
              staff_needed: 4,
              staff_assigned: 3,
              status: "open"
            },
            offered_shift_id: "2",
            offered_shift: {
              id: "2",
              title: "Evening Service",
              date: "2024-01-25",
              start_time: "16:00",
              end_time: "00:00",
              location: "Main Floor",
              department: "Service",
              staff_needed: 3,
              staff_assigned: 2,
              status: "open"
            },
            status: "pending",
            reason: "Need to attend a family event in the evening",
            created_at: "2024-01-20T10:00:00Z"
          }
        ])
      } catch (error) {
        toast.error("Failed to load shift data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [venueId])

  const handleSubmitSwapRequest = async () => {
    if (!selectedTargetShift || !selectedOfferedShift || !selectedStaffMember || !reason.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // API call to create swap request
      const response = await fetch("/api/venue/shifts/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester_id: currentUserId,
          target_shift_id: selectedTargetShift,
          offered_shift_id: selectedOfferedShift,
          reason: reason.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create swap request")
      }

      const { swap } = await response.json()
      
      // Add to local state
      setSwapRequests(prev => [swap, ...prev])
      
      toast.success("Shift swap request submitted successfully")
      setIsDialogOpen(false)
      setSelectedTargetShift("")
      setSelectedOfferedShift("")
      setSelectedStaffMember("")
      setReason("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit swap request")
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

  const getShiftStatusBadge = (status: string) => {
    const variants = {
      open: "bg-blue-100 text-blue-800",
      filled: "bg-green-100 text-green-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    }
    return <Badge className={variants[status as keyof typeof variants]}>{status.replace("_", " ")}</Badge>
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
          <h2 className="text-2xl font-bold tracking-tight">Shift Swap Requests</h2>
          <p className="text-muted-foreground">
            Request to swap shifts with other team members
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Request Swap
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Shift Swap</DialogTitle>
              <DialogDescription>
                Select the shift you want and the shift you're offering in exchange
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-shift">Shift You Want</Label>
                  <Select value={selectedTargetShift} onValueChange={setSelectedTargetShift}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
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
                  <Label htmlFor="offered-shift">Shift You're Offering</Label>
                  <Select value={selectedOfferedShift} onValueChange={setSelectedOfferedShift}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
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
              </div>

              <div>
                <Label htmlFor="reason">Reason for Swap</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you need to swap shifts..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {selectedTargetShift && selectedOfferedShift && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your swap request will be reviewed by management. You'll be notified once a decision is made.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitSwapRequest}
                disabled={isSubmitting || !selectedTargetShift || !selectedOfferedShift || !reason.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Swap Requests</CardTitle>
              <CardDescription>
                Track the status of your shift swap requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {swapRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No swap requests yet</p>
                      <p className="text-sm">Create your first swap request to get started</p>
                    </div>
                  ) : (
                    swapRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{request.requester_name}</span>
                                {getStatusBadge(request.status)}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(request.created_at), "MMM dd, yyyy")}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-sm">Wants:</span>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <div className="font-medium">{request.target_shift.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(request.target_shift.date), "EEEE, MMM dd")}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.target_shift.start_time} - {request.target_shift.end_time}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.target_shift.location}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-sm">Offers:</span>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="font-medium">{request.offered_shift.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(request.offered_shift.date), "EEEE, MMM dd")}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.offered_shift.start_time} - {request.offered_shift.end_time}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.offered_shift.location}
                                  </div>
                                </div>
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
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Requests</span>
                <Badge variant="outline">{swapRequests.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  {swapRequests.filter(r => r.status === "pending").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Approved</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {swapRequests.filter(r => r.status === "approved").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Denied</span>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {swapRequests.filter(r => r.status === "denied").length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Available Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shifts.slice(0, 3).map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{shift.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(shift.date), "MMM dd")} • {shift.start_time}-{shift.end_time}
                      </div>
                    </div>
                    {getShiftStatusBadge(shift.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 