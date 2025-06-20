"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusCircle,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  ListTodo,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for tasks
const mockTasks = {
  "team-1": [
    {
      id: 1,
      title: "Schedule staff for weekend event",
      description: "Ensure all positions are covered for the Saturday night concert",
      assignee: { name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40&text=AJ" },
      dueDate: "2023-12-15",
      priority: "High",
      status: "In Progress",
      tags: ["Scheduling", "Weekend"],
    },
    {
      id: 2,
      title: "Inventory bar supplies",
      description: "Complete inventory check and place orders for restocking",
      assignee: { name: "Jamie Lee", avatar: "/placeholder.svg?height=40&width=40&text=JL" },
      dueDate: "2023-12-10",
      priority: "Medium",
      status: "To Do",
      tags: ["Inventory", "Bar"],
    },
    {
      id: 3,
      title: "Update security protocols",
      description: "Review and update venue security procedures",
      assignee: { name: "Taylor Kim", avatar: "/placeholder.svg?height=40&width=40&text=TK" },
      dueDate: "2023-12-20",
      priority: "High",
      status: "To Do",
      tags: ["Security", "Procedures"],
    },
    {
      id: 4,
      title: "Train new staff members",
      description: "Conduct orientation for 3 new hires",
      assignee: { name: "Sam Rivera", avatar: "/placeholder.svg?height=40&width=40&text=SR" },
      dueDate: "2023-12-08",
      priority: "Medium",
      status: "Completed",
      tags: ["Training", "Onboarding"],
    },
  ],
  "team-2": [
    {
      id: 5,
      title: "Maintenance check on sound equipment",
      description: "Perform routine maintenance on all audio systems",
      assignee: { name: "Jordan Patel", avatar: "/placeholder.svg?height=40&width=40&text=JP" },
      dueDate: "2023-12-12",
      priority: "High",
      status: "In Progress",
      tags: ["Maintenance", "Audio"],
    },
    {
      id: 6,
      title: "Program lighting for weekend show",
      description: "Create and test lighting cues for the upcoming performance",
      assignee: { name: "Casey Wong", avatar: "/placeholder.svg?height=40&width=40&text=CW" },
      dueDate: "2023-12-14",
      priority: "Medium",
      status: "To Do",
      tags: ["Lighting", "Programming"],
    },
  ],
  "team-3": [
    {
      id: 7,
      title: "Finalize vendor contracts",
      description: "Review and sign contracts with all event vendors",
      assignee: { name: "Quinn Murphy", avatar: "/placeholder.svg?height=40&width=40&text=QM" },
      dueDate: "2023-12-09",
      priority: "High",
      status: "To Do",
      tags: ["Contracts", "Vendors"],
    },
    {
      id: 8,
      title: "Create event run sheet",
      description: "Develop detailed timeline for the upcoming festival",
      assignee: { name: "Quinn Murphy", avatar: "/placeholder.svg?height=40&width=40&text=QM" },
      dueDate: "2023-12-11",
      priority: "Medium",
      status: "In Progress",
      tags: ["Planning", "Timeline"],
    },
  ],
  "team-4": [
    {
      id: 9,
      title: "Schedule social media posts",
      description: "Create content calendar for next month's promotions",
      assignee: { name: "Dakota Lee", avatar: "/placeholder.svg?height=40&width=40&text=DL" },
      dueDate: "2023-12-18",
      priority: "Medium",
      status: "To Do",
      tags: ["Social Media", "Content"],
    },
    {
      id: 10,
      title: "Design promotional materials",
      description: "Create graphics for upcoming events",
      assignee: { name: "Skyler Chen", avatar: "/placeholder.svg?height=40&width=40&text=SC" },
      dueDate: "2023-12-13",
      priority: "High",
      status: "In Progress",
      tags: ["Design", "Promotion"],
    },
  ],
  "team-5": [
    {
      id: 11,
      title: "Confirm tour accommodations",
      description: "Book hotels for all tour dates",
      assignee: { name: "Reese Johnson", avatar: "/placeholder.svg?height=40&width=40&text=RJ" },
      dueDate: "2023-12-16",
      priority: "High",
      status: "To Do",
      tags: ["Accommodations", "Booking"],
    },
    {
      id: 12,
      title: "Inventory merchandise stock",
      description: "Count current merchandise and place orders for tour",
      assignee: { name: "Parker Davis", avatar: "/placeholder.svg?height=40&width=40&text=PD" },
      dueDate: "2023-12-10",
      priority: "Medium",
      status: "Completed",
      tags: ["Merchandise", "Inventory"],
    },
  ],
}

// Mock data for team members (for assignee selection)
const mockMembers = {
  "team-1": [
    { id: 1, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40&text=AJ" },
    { id: 2, name: "Sam Rivera", avatar: "/placeholder.svg?height=40&width=40&text=SR" },
    { id: 3, name: "Jamie Lee", avatar: "/placeholder.svg?height=40&width=40&text=JL" },
    { id: 4, name: "Taylor Kim", avatar: "/placeholder.svg?height=40&width=40&text=TK" },
    { id: 5, name: "Morgan Smith", avatar: "/placeholder.svg?height=40&width=40&text=MS" },
  ],
  "team-2": [
    { id: 6, name: "Jordan Patel", avatar: "/placeholder.svg?height=40&width=40&text=JP" },
    { id: 7, name: "Casey Wong", avatar: "/placeholder.svg?height=40&width=40&text=CW" },
    { id: 8, name: "Riley Garcia", avatar: "/placeholder.svg?height=40&width=40&text=RG" },
  ],
  "team-3": [
    { id: 9, name: "Quinn Murphy", avatar: "/placeholder.svg?height=40&width=40&text=QM" },
    { id: 10, name: "Avery Wilson", avatar: "/placeholder.svg?height=40&width=40&text=AW" },
  ],
  "team-4": [
    { id: 11, name: "Dakota Lee", avatar: "/placeholder.svg?height=40&width=40&text=DL" },
    { id: 12, name: "Skyler Chen", avatar: "/placeholder.svg?height=40&width=40&text=SC" },
  ],
  "team-5": [
    { id: 13, name: "Reese Johnson", avatar: "/placeholder.svg?height=40&width=40&text=RJ" },
    { id: 14, name: "Parker Davis", avatar: "/placeholder.svg?height=40&width=40&text=PD" },
  ],
}

interface TeamTaskListProps {
  teamId: string
}

export function TeamTaskList({ teamId }: TeamTaskListProps) {
  const [tasks, setTasks] = useState(mockTasks[teamId as keyof typeof mockTasks] || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("list")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    dueDate: "",
    priority: "Medium",
    tags: "",
  })

  const teamMembers = mockMembers[teamId as keyof typeof mockMembers] || []

  // Filter tasks based on search query and status filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || task.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddTask = () => {
    const assignee = teamMembers.find((member) => member.id.toString() === newTask.assigneeId)

    if (!assignee) return

    const tagsArray = newTask.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const newTaskObj = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      assignee: {
        name: assignee.name,
        avatar: assignee.avatar,
      },
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: "To Do",
      tags: tagsArray,
    }

    setTasks([...tasks, newTaskObj])
    setIsAddTaskOpen(false)
    setNewTask({
      title: "",
      description: "",
      assigneeId: "",
      dueDate: "",
      priority: "Medium",
      tags: "",
    })
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleStatusChange = (id: number, status: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-100 dark:bg-red-900/20"
      case "Medium":
        return "text-amber-500 bg-amber-100 dark:bg-amber-900/20"
      case "Low":
        return "text-green-500 bg-green-100 dark:bg-green-900/20"
      default:
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "To Do":
        return <ListTodo className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Task Management</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-[180px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task for your team to work on.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignee" className="text-right">
                    Assignee
                  </Label>
                  <Select
                    value={newTask.assigneeId}
                    onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                  >
                    <SelectTrigger id="assignee" className="col-span-3">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {member.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger id="priority" className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TabsContent value="list" className="mt-0">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No tasks found</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddTaskOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={task.status === "Completed"}
                        onCheckedChange={(checked) => {
                          handleStatusChange(task.id, checked ? "Completed" : "To Do")
                        }}
                      />
                      <div>
                        <h4
                          className={`font-medium ${task.status === "Completed" ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                        <AvatarFallback>
                          {task.assignee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{task.dueDate}</span>
                      </div>
                      <Badge className={`${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                      <Badge variant="outline" className="flex items-center">
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="board" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["To Do", "In Progress", "Completed"].map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center">
                  {getStatusIcon(status)}
                  <span className="ml-2">{status}</span>
                </h4>
                <Badge variant="outline">{filteredTasks.filter((task) => task.status === status).length}</Badge>
              </div>
              <div className="space-y-2">
                {filteredTasks.filter((task) => task.status === status).length === 0 ? (
                  <div className="border border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  filteredTasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <Card key={task.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <h5 className="font-medium text-sm">{task.title}</h5>
                            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>{task.priority}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                              <AvatarFallback>
                                {task.assignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </div>
  )
}
