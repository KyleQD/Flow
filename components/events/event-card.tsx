"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, DollarSign, MoreVertical, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    venue: string
    capacity: number
    ticketPrice: number
    category: string
    coverImage: string
    isPublic: boolean
    status: "upcoming" | "past" | "draft"
    views: number
    ticketsSold: number
    revenue: number
  }
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = format(new Date(`${event.date}T${event.time}`), "MMM d, yyyy")
  const formattedTime = format(new Date(`${event.date}T${event.time}`), "h:mm a")

  return (
    <Card className="bg-[#13151c] border-gray-800">
      <div className="aspect-[2/1] relative">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <Badge className="absolute top-2 right-2 bg-purple-600">
          {event.category}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-white">{event.title}</CardTitle>
        <CardDescription className="text-gray-400 line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.venue}, {event.location}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            <span>{event.ticketsSold}/{event.capacity} tickets sold</span>
          </div>
          <div className="flex items-center text-gray-400">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>${event.ticketPrice.toFixed(2)} per ticket</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Eye className="h-4 w-4 mr-2" />
            <span>{event.views} views</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/events/${event.id}`}>
            Preview
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/events/${event.id}/manage`}>
              Manage
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
} 