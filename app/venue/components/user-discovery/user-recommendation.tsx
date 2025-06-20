"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus } from "lucide-react"

interface UserRecommendationProps {
  title?: string
  description?: string
  limit?: number
  showFilters?: boolean
  layout?: "grid" | "list"
}

export function UserRecommendation({
  title = "Recommended Users",
  description = "People you might want to connect with",
  limit = 5,
  showFilters = false,
  layout = "list"
}: UserRecommendationProps) {
  // Mock data for now
  const users = [
    {
      id: "1",
      name: "John Doe",
      avatar: "/placeholder.svg",
      role: "Artist",
      location: "New York, NY"
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "/placeholder.svg",
      role: "Venue Manager",
      location: "Los Angeles, CA"
    }
  ]

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-gray-400">{description}</p>
      </CardHeader>
      <CardContent>
        <div className={`space-y-4 ${layout === "grid" ? "grid grid-cols-2 gap-4" : ""}`}>
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Badge variant="outline" className="border-gray-700">
                      {user.role}
                    </Badge>
                    <span>{user.location}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-gray-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
