"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  Users,
  ArrowRightLeft,
  Plus,
  Check,
  X,
  AlertCircle,
  MapPin,
  UserCheck,
  RefreshCw
} from "lucide-react"

interface Shift {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  staffNeeded: number
  staffAssigned: string[]
  status: 'open' | 'filled' | 'urgent'
  department: string
}

interface ShiftRequest {
  id: string
  type: 'trade' | 'coverage' | 'time_off'
  requesterId: string
  requesterName: string
  shiftId?: string
  targetShiftId?: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestDate: string
}

export default function ShiftManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("schedule")

  const shifts: Shift[] = [
    {
      id: "shift-1",
      title: "Evening Concert Setup",
      date: "2024-02-15",
      startTime: "14:00",
      endTime: "22:00",
      location: "Main Stage",
      staffNeeded: 6,
      staffAssigned: ["staff-1", "staff-2", "staff-3"],
      status: "open",
      department: "Technical"
    },
    {
      id: "shift-2",
      title: "Security Coverage",
      date: "2024-02-15",
      startTime: "18:00",
      endTime: "02:00",
      location: "All Areas",
      staffNeeded: 8,
      staffAssigned: ["staff-4", "staff-5", "staff-6", "staff-7", "staff-8"],
      status: "urgent",
      department: "Security"
    }
  ]

  const shiftRequests: ShiftRequest[] = [
    {
      id: "req-1",
      type: "trade",
      requesterId: "staff-1",
      requesterName: "Maya Rodriguez",
      shiftId: "shift-1",
      targetShiftId: "shift-3",
      reason: "Family commitment",
      status: "pending",
      requestDate: "2024-02-10"
    },
    {
      id: "req-2",
      type: "time_off",
      requesterId: "staff-2",
      requesterName: "Alex Chen",
      reason: "Medical appointment",
      status: "pending",
      requestDate: "2024-02-09"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'filled': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'trade': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'coverage': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'time_off': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    toast({
      title: "Request Updated",
      description: `Shift request has been ${action}d`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Shift Management
          </h1>
          <p className="text-slate-400 mt-1">Manage schedules, shift trades, and coverage requests</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Open Shifts", value: "12", icon: Calendar, color: "from-blue-500 to-cyan-500" },
          { label: "Urgent Coverage", value: "3", icon: AlertCircle, color: "from-red-500 to-orange-500" },
          { label: "Pending Requests", value: "8", icon: Clock, color: "from-yellow-500 to-orange-500" },
          { label: "Staff Available", value: "28", icon: UserCheck, color: "from-green-500 to-emerald-500" }
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {shifts.map((shift) => (
              <Card key={shift.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{shift.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{shift.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{shift.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(shift.status)}>
                      {shift.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-slate-300">
                        {shift.staffAssigned.length} / {shift.staffNeeded} staff assigned
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-slate-700/50 border-slate-600">
                      {shift.department}
                    </Badge>
                  </div>

                  {/* Assigned Staff */}
                  <div className="mb-4">
                    <div className="text-slate-400 text-sm mb-2">Assigned Staff</div>
                    <div className="flex items-center space-x-2">
                      {shift.staffAssigned.map((staffId, i) => (
                        <Avatar key={i} className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                            S{i + 1}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {shift.staffAssigned.length < shift.staffNeeded && (
                        <div className="w-8 h-8 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Users className="h-4 w-4 mr-1" />
                      Assign Staff
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <ArrowRightLeft className="h-4 w-4 mr-1" />
                      Enable Trading
                    </Button>
                    {shift.status === 'urgent' && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Find Coverage
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {shiftRequests.map((request) => (
              <Card key={request.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {request.requesterName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold">{request.requesterName}</h3>
                        <p className="text-slate-400 text-sm">
                          Requested on {request.requestDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getRequestTypeColor(request.type)}>
                        {request.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={`${
                        request.status === 'pending' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                        request.status === 'approved' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                        'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-slate-400 text-sm mb-1">Reason</div>
                    <p className="text-slate-300">{request.reason}</p>
                  </div>

                  {request.type === 'trade' && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-blue-400 font-medium mb-2">Shift Trade Details</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300">Current Shift</span>
                        <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-300">Requested Shift</span>
                      </div>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleRequestAction(request.id, 'approve')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-600 text-red-400"
                        onClick={() => handleRequestAction(request.id, 'reject')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-purple-400">Auto-Coverage System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Smart Matching</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Automatically matches available staff with open shifts based on skills and availability
                    </p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span className="text-blue-400 font-semibold">Backup Pool</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Maintain a pool of on-call staff for emergency coverage needs
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-white mb-2">94%</div>
                    <div className="text-slate-400">Coverage Rate</div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Find Emergency Coverage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 