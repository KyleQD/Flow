"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, User, Users } from "lucide-react"

// Mock data for conversations
const conversations = [
  {
    id: 1,
    name: "Event Planning Team",
    type: "group",
    lastMessage: "Let's finalize the stage setup by tomorrow",
    time: "10:30 AM",
    unread: 3,
    members: ["Alex", "Jamie", "Taylor", "Jordan"],
    avatar: "/extraterrestrial-encounter.png",
  },
  {
    id: 2,
    name: "Sound Vendor",
    type: "individual",
    lastMessage: "The equipment will be delivered on Friday",
    time: "Yesterday",
    unread: 0,
    avatar: "/abstract-sv.png",
  },
  {
    id: 3,
    name: "Security Team",
    type: "group",
    lastMessage: "Updated security protocols attached",
    time: "Yesterday",
    unread: 1,
    members: ["Casey", "Riley", "Quinn"],
    avatar: "/stylized-letter-st.png",
  },
  {
    id: 4,
    name: "Catering Service",
    type: "individual",
    lastMessage: "Menu options for VIP section",
    time: "Monday",
    unread: 0,
    avatar: "/computer-science-abstract.png",
  },
  {
    id: 5,
    name: "Volunteer Coordinators",
    type: "group",
    lastMessage: "We need 5 more volunteers for the entrance",
    time: "Monday",
    unread: 0,
    members: ["Sam", "Alex", "Morgan"],
    avatar: "/vibrant-cityscape.png",
  },
]

// Mock data for messages in a conversation
const messages = [
  {
    id: 1,
    sender: "Jamie",
    content: "Has everyone reviewed the updated stage layout?",
    time: "10:15 AM",
    avatar: "/placeholder.svg?height=40&width=40&query=J",
  },
  {
    id: 2,
    sender: "Taylor",
    content:
      "Yes, I've checked it. We need to make sure there's enough space between the main stage and the sound booth.",
    time: "10:18 AM",
    avatar: "/placeholder.svg?height=40&width=40&query=T",
  },
  {
    id: 3,
    sender: "Alex",
    content: "I'm concerned about the backstage access. Can we review that section again?",
    time: "10:22 AM",
    avatar: "/placeholder.svg?height=40&width=40&query=A",
  },
  {
    id: 4,
    sender: "Jordan",
    content: "Good point. Let's finalize the stage setup by tomorrow so we can communicate with the vendors.",
    time: "10:30 AM",
    avatar: "/placeholder.svg?height=40&width=40&query=J",
  },
]

export function MessageCenter() {
  return <div className="p-4 text-slate-400">Message Center Placeholder</div>
}
