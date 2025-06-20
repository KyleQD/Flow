"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, Clock, MoreHorizontal, ExternalLink, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { motion } from "framer-motion"

export interface EventMember {
  id: string
  name: string
  avatar: string
  role: string
}

export interface EventTask {
  id: string
  title: string
  status: "todo" | "in-progress" | "completed"
  assigneeId: string
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: "planning" | "active" | "completed" | "cancelled"
  progress: number
  organizer: EventMember
  performers: EventMember[]
  tasks: EventTask[]
  tags: string[]
}

interface EventCardProps {
  event: Event
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onManage?: (id: string) => void
  isOrganizer?: boolean
}

export function EventCard({ event, onView, onEdit, onDelete, onManage, isOrganizer = false }: EventCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "planning":
        return "bg-blue-600"
      case "active":
        return "bg-green-600"
      case "completed":
        return "bg-purple-600"
      case "cancelled":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress < 25) return "bg-red-600"
    if (progress < 50) return "bg-yellow-600"
    if (progress < 75) return "bg-blue-600"
    return "bg-green-600"
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const handleView = () => {
    if (onView) onView(event.id)
  }

  const handleEdit = () => {
    if (onEdit) onEdit(event.id)
  }

  const handleDelete = () => {
    if (onDelete) onDelete(event.id)
  }

  const handleManage = () => {
    if (onManage) onManage(event.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="bg-gray-900 text-white border-gray-800 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                  <ExternalLink className="h-4 w-4 mr-2" /> View Details
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    Edit Event
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-red-500 cursor-pointer">
                    Delete Event
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{event.description}</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatDate(event.endDate)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{event.progress}%</span>
              </div>
              <Progress value={event.progress} className={getProgressColor(event.progress)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>Venue: {event.organizer.name}</span>
              </div>

              <div className="flex items-center text-sm text-gray-400">
                <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>Performers ({event.performers.length})</span>
              </div>

              <div className="flex -space-x-2">
                <Avatar className="h-8 w-8 border-2 border-gray-900">
                  <AvatarImage src={event.organizer.avatar || "/placeholder.svg"} alt={event.organizer.name} />
                  <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>

                {event.performers.slice(0, 4).map((performer) => (
                  <Avatar key={performer.id} className="h-8 w-8 border-2 border-gray-900">
                    <AvatarImage src={performer.avatar || "/placeholder.svg"} alt={performer.name} />
                    <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}

                {event.performers.length > 4 && (
                  <div className="h-8 w-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs">
                    +{event.performers.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {isOrganizer ? (
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleManage}>
              Manage Event
            </Button>
          ) : (
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleView}>
              View Details
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
