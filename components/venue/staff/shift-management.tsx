"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, XCircle, ArrowLeftRight, UserPlus, UserMinus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface ShiftSwap {
  id: string
  requester_id: string
  requester_name: string
  target_shift_id: string
  target_shift_date: string
  target_shift_time: string
  offered_shift_id: string
  offered_shift_date: string
  offered_shift_time: string
  status: "pending" | "approved" | "denied"
  reason: string
  created_at: string
}

interface ShiftRequest {
  id: string
  requester_id: string
  requester_name: string
  shift_id: string
  shift_date: string
  shift_time: string
  request_type: "drop" | "pickup"
  status: "pending" | "approved" | "denied"
  reason: string
  created_at: string
}

interface ShiftWithAssignments {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  required_staff: number
  assigned_staff: number
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  assignments: Array<{
    id: string
    staff_id: string
    staff_name: string
    status: "assigned" | "confirmed" | "checked_in" | "checked_out"
  }>
}

export function ShiftManagement() {
  const [activeTab, setActiveTab] = useState("swaps")
  const [shifts, setShifts] = useState<ShiftWithAssignments[]>([])
  const [swaps, setSwaps] = useState<ShiftSwap[]>([])
  const [requests, setRequests] = useState<ShiftRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSwap, setSelectedSwap] = useState<ShiftSwap | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ShiftRequest | null>(null)
  const [approvalReason, setApprovalReason] = useState("")

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setShifts([
          {
            id: "1",
            title: "Morning Service",
            date: "2024-01-25",
            start_time: "08:00",
            end_time: "16:00",
            required_staff: 4,
            assigned_staff: 3,
            status: "scheduled",
            assignments: [
              { id: "1", staff_id: "1", staff_name: "John Doe", status: "confirmed" },
              { id: "2", staff_id: "2", staff_name: "Jane Smith", status: "assigned" },
              { id: "3", staff_id: "3", staff_name: "Mike Johnson", status: "confirmed" }
            ]
          },
          {
            id: "2",
            title: "Evening Service",
            date: "2024-01-25",
            start_time: "16:00",
            end_time: "00:00",
            required_staff: 3,
            assigned_staff: 2,
            status: "scheduled",
            assignments: [
              { id: "4", staff_id: "4", staff_name: "Sarah Wilson", status: "confirmed" },
              { id: "5", staff_id: "5", staff_name: "Tom Brown", status: "assigned" }
            ]
          }
        ])

        setSwaps([
          {
            id: "1",
            requester_id: "1",
            requester_name: "John Doe",
            target_shift_id: "1",
            target_shift_date: "2024-01-25",
            target_shift_time: "08:00-16:00",
            offered_shift_id: "2",
            offered_shift_date: "2024-01-26",
            offered_shift_time: "16:00-00:00",
            status: "pending",
            reason: "Need to attend a family event on the 26th",
            created_at: "2024-01-20T10:00:00Z"
          },
          {
            id: "2",
            requester_id: "3",
            requester_name: "Mike Johnson",
            target_shift_id: "2",
            target_shift_date: "2024-01-25",
            target_shift_time: "16:00-00:00",
            offered_shift_id: "3",
            offered_shift_date: "2024-01-24",
            offered_shift_time: "08:00-16:00",
            status: "approved",
            reason: "Prefer evening shifts",
            created_at: "2024-01-19T14:30:00Z"
          }
        ])

        setRequests([
          {
            id: "1",
            requester_id: "2",
            requester_name: "Jane Smith",
            shift_id: "1",
            shift_date: "2024-01-25",
            shift_time: "08:00-16:00",
            request_type: "drop",
            status: "pending",
            reason: "Feeling unwell, need to rest",
            created_at: "2024-01-20T09:15:00Z"
          },
          {
            id: "2",
            requester_id: "6",
            requester_name: "Alex Davis",
            shift_id: "2",
            shift_date: "2024-01-25",
            shift_time: "16:00-00:00",
            request_type: "pickup",
            status: "approved",
            reason: "Available and need extra hours",
            created_at: "2024-01-19T16:45:00Z"
          }
        ])
      } catch (error) {
        toast.error("Failed to load shift management data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSwapApproval = async (swapId: string, approved: boolean) => {
    try {
      // API call to approve/deny swap
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSwaps(prev => prev.map(swap => 
        swap.id === swapId 
          ? { ...swap, status: approved ? "approved" : "denied" }
          : swap
      ))
      
      toast.success(`Shift swap ${approved ? "approved" : "denied"} successfully`)
      setSelectedSwap(null)
      setApprovalReason("")
    } catch (error) {
      toast.error("Failed to update swap status")
    }
  }

  const handleRequestApproval = async (requestId: string, approved: boolean) => {
    try {
      // API call to approve/deny request
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: approved ? "approved" : "denied" }
          : request
      ))
      
      toast.success(`Request ${approved ? "approved" : "denied"} successfully`)
      setSelectedRequest(null)
      setApprovalReason("")
    } catch (error) {
      toast.error("Failed to update request status")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      denied: "bg-red-100 text-red-800"
    }
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getShiftStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
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
          <h2 className="text-2xl font-bold tracking-tight">Shift Management</h2>
          <p className="text-muted-foreground">
            Manage shift swaps, requests, and assignments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {swaps.filter(s => s.status === "pending").length} Pending Swaps
          </Badge>
          <Badge variant="outline" className="text-sm">
            {requests.filter(r => r.status === "pending").length} Pending Requests
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="swaps" className="flex items-center space-x-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Shift Swaps</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Requests</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Swap Requests</CardTitle>
              <CardDescription>
                Review and manage shift swap requests between staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <Card key={swap.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{swap.requester_name}</span>
                              {getStatusBadge(swap.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Wants:</span> {format(new Date(swap.target_shift_date), "MMM dd")} {swap.target_shift_time}
                              </div>
                              <div>
                                <span className="font-medium">Offers:</span> {format(new Date(swap.offered_shift_date), "MMM dd")} {swap.offered_shift_time}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{swap.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              Requested {format(new Date(swap.created_at), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          {swap.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => setSelectedSwap(swap)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedSwap(swap)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Deny
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drop/Pickup Requests</CardTitle>
              <CardDescription>
                Manage staff requests to drop or pickup shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className={`border-l-4 ${
                      request.request_type === "drop" ? "border-l-red-500" : "border-l-green-500"
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{request.requester_name}</span>
                              <Badge variant={request.request_type === "drop" ? "destructive" : "default"}>
                                {request.request_type.toUpperCase()}
                              </Badge>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Shift:</span> {format(new Date(request.shift_date), "MMM dd")} {request.shift_time}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              Requested {format(new Date(request.created_at), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          {request.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Deny
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Assignments</CardTitle>
              <CardDescription>
                View and manage staff assignments for upcoming shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shifts.map((shift) => (
                  <Card key={shift.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{shift.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(shift.date), "EEEE, MMMM dd, yyyy")} • {shift.start_time} - {shift.end_time}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getShiftStatusBadge(shift.status)}
                          <Badge variant="outline">
                            {shift.assigned_staff}/{shift.required_staff} Staff
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Assigned Staff:</span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add Staff
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {shift.assignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                              <span className="font-medium">{assignment.staff_name}</span>
                              <Badge variant="outline">{assignment.status.replace("_", " ")}</Badge>
                            </div>
                          ))}
                        </div>
                        {shift.assigned_staff < shift.required_staff && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {shift.required_staff - shift.assigned_staff} more staff member(s) needed
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shifts.length}</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {swaps.filter(s => s.status === "pending").length + requests.filter(r => r.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Coverage</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((shifts.reduce((acc, shift) => acc + shift.assigned_staff, 0) / 
                    shifts.reduce((acc, shift) => acc + shift.required_staff, 0)) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average coverage
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Create Shift</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Assign Staff</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <ArrowLeftRight className="h-6 w-6 mb-2" />
                  <span className="text-sm">Process Swaps</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Clock className="h-6 w-6 mb-2" />
                  <span className="text-sm">View Schedule</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Swap Approval Dialog */}
      <Dialog open={!!selectedSwap} onOpenChange={() => setSelectedSwap(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Shift Swap</DialogTitle>
            <DialogDescription>
              {selectedSwap && (
                <div className="space-y-2">
                  <p><strong>{selectedSwap.requester_name}</strong> wants to swap shifts:</p>
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    <p><strong>Wants:</strong> {format(new Date(selectedSwap.target_shift_date), "MMM dd")} {selectedSwap.target_shift_time}</p>
                    <p><strong>Offers:</strong> {format(new Date(selectedSwap.offered_shift_date), "MMM dd")} {selectedSwap.offered_shift_time}</p>
                    <p><strong>Reason:</strong> {selectedSwap.reason}</p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Response (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Add a note about your decision..."
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSwap(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSwap && handleSwapApproval(selectedSwap.id, false)}
            >
              Deny Swap
            </Button>
            <Button
              onClick={() => selectedSwap && handleSwapApproval(selectedSwap.id, true)}
            >
              Approve Swap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Approval Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="space-y-2">
                  <p><strong>{selectedRequest.requester_name}</strong> wants to {selectedRequest.request_type} a shift:</p>
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    <p><strong>Shift:</strong> {format(new Date(selectedRequest.shift_date), "MMM dd")} {selectedRequest.shift_time}</p>
                    <p><strong>Type:</strong> {selectedRequest.request_type.toUpperCase()}</p>
                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="request-reason">Response (optional)</Label>
              <Textarea
                id="request-reason"
                placeholder="Add a note about your decision..."
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleRequestApproval(selectedRequest.id, false)}
            >
              Deny Request
            </Button>
            <Button
              onClick={() => selectedRequest && handleRequestApproval(selectedRequest.id, true)}
            >
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 