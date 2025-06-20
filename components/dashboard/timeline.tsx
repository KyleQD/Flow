"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface DashboardTimelineProps {
  userId: string
}

export function DashboardTimeline({ userId }: DashboardTimelineProps) {
  const [eventProgress, setEventProgress] = useState(65)

  return (
    <div className="mt-8">
      <Tabs defaultValue="timeline" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-slate-800/50 p-1">
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="logistics"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
            >
              Logistics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
              Planning
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-pink-500 mr-1"></div>
              Execution
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
              Post-event
            </div>
          </div>
        </div>

        <TabsContent value="timeline" className="mt-0">
          <div className="h-64 w-full relative bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
            <EventTimeline />
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-md px-3 py-2 border border-slate-700/50">
              <div className="text-xs text-slate-400">Event Progress</div>
              <div className="text-lg font-mono text-purple-400">{eventProgress}%</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <TaskList />
        </TabsContent>

        <TabsContent value="logistics" className="mt-0">
          <LogisticsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EventTimeline() {
  return (
    <div className="h-full w-full flex items-end justify-between px-4 pt-4 pb-8 relative">
      {/* Y-axis labels */}
      <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-4">
        <div className="text-xs text-slate-500">Planning</div>
        <div className="text-xs text-slate-500">Pre-event</div>
        <div className="text-xs text-slate-500">Event Day</div>
        <div className="text-xs text-slate-500">Post-event</div>
      </div>

      {/* Timeline */}
      <div className="absolute left-16 right-10 top-0 bottom-0 flex flex-col justify-center">
        <div className="relative h-1 bg-slate-700/50 rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{ width: "65%" }}
          ></div>

          {/* Milestone markers */}
          <div className="absolute left-0 top-0 h-4 w-4 -mt-1.5 -ml-2 rounded-full bg-purple-500 border-2 border-slate-900"></div>
          <div className="absolute left-[25%] top-0 h-4 w-4 -mt-1.5 -ml-2 rounded-full bg-purple-500 border-2 border-slate-900"></div>
          <div className="absolute left-[50%] top-0 h-4 w-4 -mt-1.5 -ml-2 rounded-full bg-purple-500 border-2 border-slate-900"></div>
          <div className="absolute left-[65%] top-0 h-4 w-4 -mt-1.5 -ml-2 rounded-full bg-pink-500 border-2 border-slate-900 animate-pulse"></div>
          <div className="absolute left-[75%] top-0 h-4 w-4 -mt-1.5 -ml-2 rounded-full bg-slate-600 border-2 border-slate-900"></div>
          <div className="absolute left-[100%] top-0 h-4 w-4 -mt-1.5 -ml-2 rounded-full bg-slate-600 border-2 border-slate-900"></div>

          {/* Milestone labels */}
          <div className="absolute left-0 top-4 text-xs text-slate-400 -ml-8">Start</div>
          <div className="absolute left-[25%] top-4 text-xs text-slate-400 -ml-10">Planning</div>
          <div className="absolute left-[50%] top-4 text-xs text-slate-400 -ml-12">Pre-event</div>
          <div className="absolute left-[65%] top-4 text-xs text-purple-400 -ml-8">Now</div>
          <div className="absolute left-[75%] top-4 text-xs text-slate-400 -ml-8">Event</div>
          <div className="absolute left-[100%] top-4 text-xs text-slate-400 -ml-10">Wrap-up</div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
        <div className="text-xs text-slate-500">Jun 1</div>
        <div className="text-xs text-slate-500">Jul 1</div>
        <div className="text-xs text-slate-500">Aug 1</div>
        <div className="text-xs text-slate-500">Sep 1</div>
      </div>
    </div>
  )
}

function TaskList() {
  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
      <div className="grid grid-cols-12 text-xs text-slate-400 p-3 border-b border-slate-700/50 bg-slate-800/50">
        <div className="col-span-1">ID</div>
        <div className="col-span-5">Task</div>
        <div className="col-span-2">Assigned To</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-2">Status</div>
      </div>

      <div className="divide-y divide-slate-700/30">
        <TaskRow
          id="T-1024"
          name="Finalize venue contract"
          assignee="Sarah Johnson"
          dueDate="Jul 15"
          status="completed"
        />
        <TaskRow
          id="T-1025"
          name="Book headline performer"
          assignee="Michael Chen"
          dueDate="Jul 18"
          status="completed"
        />
        <TaskRow
          id="T-1026"
          name="Arrange transportation for artists"
          assignee="Jessica Lee"
          dueDate="Jul 25"
          status="in-progress"
        />
        <TaskRow
          id="T-1027"
          name="Finalize stage equipment list"
          assignee="David Wilson"
          dueDate="Jul 28"
          status="in-progress"
        />
      </div>
    </div>
  )
}

function TaskRow({ id, name, assignee, dueDate, status }: { id: string; name: string; assignee: string; dueDate: string; status: string }) {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">In Progress</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Pending</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs">{status}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-slate-800/50">
      <div className="col-span-1 text-slate-500">{id}</div>
      <div className="col-span-5 text-slate-300">{name}</div>
      <div className="col-span-2 text-slate-400">{assignee}</div>
      <div className="col-span-2 text-purple-400">{dueDate}</div>
      <div className="col-span-2">{getStatusBadge()}</div>
    </div>
  )
}

function LogisticsList() {
  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LogisticsItem
          name="Main Stage Equipment"
          status="Confirmed"
          provider="SoundMasters Pro"
          delivery="Aug 14, 08:00 AM"
        />
        <LogisticsItem
          name="Artist Transportation"
          status="In Progress"
          provider="Elite Transport Services"
          delivery="Aug 14-16"
        />
        <LogisticsItem
          name="VIP Area Setup"
          status="Confirmed"
          provider="EventSpace Designs"
          delivery="Aug 13, 10:00 AM"
        />
        <LogisticsItem
          name="Food & Beverage"
          status="Pending"
          provider="Gourmet Caterers"
          delivery="Aug 15, 06:00 AM"
        />
      </div>
    </div>
  )
}

function LogisticsItem({ name, status, provider, delivery }: { name: string; status: string; provider: string; delivery: string }) {
  const getStatusColor = () => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500/10 text-green-400 border-green-500/30"
      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30"
      case "Pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-300">{name}</div>
        <Badge variant="outline" className={`${getStatusColor()} text-xs`}>
          {status}
        </Badge>
      </div>
      <div className="text-xs text-slate-500 mb-1">
        Provider: <span className="text-slate-400">{provider}</span>
      </div>
      <div className="text-xs text-slate-500">
        Delivery: <span className="text-slate-400">{delivery}</span>
      </div>
    </div>
  )
} 