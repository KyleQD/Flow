"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, Users, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NetworkViewProps {
  darkMode: boolean
  suggestedConnections: any[]
}

export function NetworkView({ darkMode, suggestedConnections }: NetworkViewProps) {
  const [activeTab, setActiveTab] = useState("suggestions")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Mock connections
  const connections = [
    {
      id: 1,
      name: "Sarah Williams",
      role: "Sound Engineer",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualConnections: 12,
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Tour Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualConnections: 8,
    },
    {
      id: 3,
      name: "Taylor Reed",
      role: "Event Producer",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualConnections: 5,
    },
  ]

  // Mock pending requests
  const pendingRequests = [
    {
      id: 1,
      name: "Alex Rodriguez",
      role: "Venue Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualConnections: 3,
    },
    {
      id: 2,
      name: "Jamie Smith",
      role: "Lighting Designer",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualConnections: 7,
    },
  ]

  const handleConnect = (name: string) => {
    toast({
      title: "Connection request sent",
      description: `You've sent a connection request to ${name}`,
    })
  }

  const handleAccept = (name: string) => {
    toast({
      title: "Connection accepted",
      description: `You are now connected with ${name}`,
    })
  }

  const handleDecline = (name: string) => {
    toast({
      title: "Request declined",
      description: `You've declined the connection request from ${name}`,
    })
  }

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">My Network</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search people..."
            className={`pl-9 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="suggestions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="suggestions" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Suggestions
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Connections
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
                <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                <path d="M12 10a5 5 0 0 0-5 5v2" />
                <path d="M19 10a5 5 0 0 1 5 5v2" />
              </svg>
              Pending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            {suggestedConnections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={connection.avatar} alt={connection.name} />
                    <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{connection.name}</p>
                    <p className="text-xs text-gray-500">{connection.role}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleConnect(connection.name)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Connect
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={connection.avatar} alt={connection.name} />
                    <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{connection.name}</p>
                    <p className="text-xs text-gray-500">{connection.role}</p>
                    <div className="flex items-center mt-1">
                      <Users className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-500">{connection.mutualConnections} mutual connections</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Message sent",
                      description: `You've started a conversation with ${connection.name}`,
                    })
                  }}
                >
                  Message
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={request.avatar} alt={request.name} />
                    <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-xs text-gray-500">{request.role}</p>
                    <div className="flex items-center mt-1">
                      <Users className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-500">{request.mutualConnections} mutual connections</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-500/20"
                    onClick={() => handleAccept(request.name)}
                  >
                    <Check className="h-4 w-4 mr-2" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/20"
                    onClick={() => handleDecline(request.name)}
                  >
                    <X className="h-4 w-4 mr-2" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
