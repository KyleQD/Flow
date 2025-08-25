"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocial } from "@/contexts/social-context"
import { Users } from "lucide-react"

export function SuggestedConnections() {
  const social = useSocial() as any
  const users = (social?.users || []) as any[]
  const sendConnectionRequest = social?.sendConnectionRequest || ((_id: string) => {})
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="bg-gray-900 text-white border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Users className="h-4 w-4 mr-2 text-purple-400" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback>
                    {user.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-gray-400">{user.title}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/20 hover:bg-purple-900/20 text-purple-400"
                onClick={() => sendConnectionRequest(user.id)}
              >
                Connect
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 