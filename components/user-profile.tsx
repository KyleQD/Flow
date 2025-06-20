"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, LogOut } from "lucide-react"

export default function UserProfile() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">Guest User</h3>
            <p className="text-sm text-muted-foreground">guest@example.com</p>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Exit
        </Button>
      </CardContent>
    </Card>
  )
}

export { UserProfile }

