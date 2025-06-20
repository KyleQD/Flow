"use client"

import { MessageSquare, Mic } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardCommunicationsProps {
  userId: string
}

interface CommunicationItemProps {
  sender: string
  time: string
  message: string
  avatar: string
  unread?: boolean
}

export function DashboardCommunications({ userId }: DashboardCommunicationsProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-slate-100 flex items-center text-base">
          <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
          Team Communications
        </CardTitle>
        <Badge variant="outline" className="bg-slate-800/50 text-blue-400 border-blue-500/50">
          3 New Messages
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <CommunicationItem
            sender="Sarah Johnson"
            time="15:42:12"
            message="Venue contract has been signed and finalized. All set for August 15th."
            avatar="/placeholder.svg?height=40&width=40"
            unread
          />
          <CommunicationItem
            sender="Michael Chen"
            time="14:30:45"
            message="Headline performer confirmed! They'll arrive on August 14th for sound check."
            avatar="/placeholder.svg?height=40&width=40"
            unread
          />
          <CommunicationItem
            sender="Jessica Lee"
            time="12:15:33"
            message="Transportation schedule for artists is being finalized. Need approval by tomorrow."
            avatar="/placeholder.svg?height=40&width=40"
            unread
          />
          <CommunicationItem
            sender="David Wilson"
            time="09:05:18"
            message="Stage equipment list is 80% complete. Will finalize after meeting with sound engineers."
            avatar="/placeholder.svg?height=40&width=40"
          />
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-700/50 pt-4">
        <div className="flex items-center w-full space-x-2">
          <input
            type="text"
            placeholder="Type a message to the team..."
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
            <Mic className="h-4 w-4" />
          </Button>
          <Button size="icon" className="bg-purple-600 hover:bg-purple-700">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function CommunicationItem({ sender, time, message, avatar, unread }: CommunicationItemProps) {
  return (
    <div className={`flex space-x-3 p-2 rounded-md ${unread ? "bg-slate-800/50 border border-slate-700/50" : ""}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={sender} />
        <AvatarFallback className="bg-slate-700 text-purple-500">{sender.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-200">{sender}</div>
          <div className="text-xs text-slate-500">{time}</div>
        </div>
        <div className="text-xs text-slate-400 mt-1">{message}</div>
      </div>
      {unread && (
        <div className="flex-shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
        </div>
      )}
    </div>
  )
} 