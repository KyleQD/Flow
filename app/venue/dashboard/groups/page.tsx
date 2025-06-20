"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CreateGroupModal } from "../../components/groups/create-group-modal"
import { Search, UserPlus, Users, MessageSquare, Settings, Lock, Globe } from "lucide-react"

export default function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for groups
  const groups = [
    {
      id: "group-1",
      name: "Tour Crew 2025",
      description: "Coordination and planning for the upcoming summer tour",
      members: 12,
      lastActivity: "2 hours ago",
      image: "/placeholder.svg?height=64&width=64&text=TC",
      isPublic: false,
      unreadMessages: 5,
    },
    {
      id: "group-2",
      name: "Fan Community",
      description: "Official fan community for updates and discussions",
      members: 1250,
      lastActivity: "5 minutes ago",
      image: "/placeholder.svg?height=64&width=64&text=FC",
      isPublic: true,
      unreadMessages: 0,
    },
    {
      id: "group-3",
      name: "Venue Connections",
      description: "Network with venue owners and promoters",
      members: 45,
      lastActivity: "Yesterday",
      image: "/placeholder.svg?height=64&width=64&text=VC",
      isPublic: true,
      unreadMessages: 2,
    },
    {
      id: "group-4",
      name: "Music Production",
      description: "Collaborate on new tracks and production techniques",
      members: 28,
      lastActivity: "3 days ago",
      image: "/placeholder.svg?height=64&width=64&text=MP",
      isPublic: false,
      unreadMessages: 0,
    },
    {
      id: "group-5",
      name: "Local Musicians",
      description: "Connect with musicians in your area",
      members: 87,
      lastActivity: "1 week ago",
      image: "/placeholder.svg?height=64&width=64&text=LM",
      isPublic: true,
      unreadMessages: 0,
    },
  ]

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-gray-400">Build community and streamline communication</p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search groups..."
          className="pl-10 bg-gray-800 border-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={group.image} alt={group.name} />
                  <AvatarFallback>
                    {group.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{group.name}</CardTitle>
                    {group.isPublic ? (
                      <Badge variant="outline" className="border-green-600 text-green-500">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-600">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {group.unreadMessages > 0 && (
                      <Badge className="bg-purple-600 ml-auto">{group.unreadMessages} new</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">{group.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.members} members</span>
                </div>
                <div>Last activity: {group.lastActivity}</div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
                <Button variant="outline" className="border-gray-700">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}
