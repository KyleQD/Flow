"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Download, MapPin, Users, DollarSign, ChevronLeft, Share2, Plus, Search } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { TaskDialog, type Task, type TaskStatus } from '../../components/events/task-dialog'
import { TaskCard } from '../../components/events/task-card'
import { SlackIntegration } from '../../components/events/slack-integration'
import { generatePDF } from '../../components/lib/pdf-generator'

// Mock data - in a real app, this would come from your database
const eventData = {
  id: "evt-001",
  title: "Summer Music Festival 2023",
  date: "Aug 15-17, 2023",
  location: "Riverside Amphitheater",
  description:
    "A three-day music festival featuring top artists from around the world, with multiple stages, food vendors, and interactive experiences.",
  attendees: 4500,
  progress: 65,
  type: "Festival",
  daysUntil: 30,
  budget: {
    total: 250000,
    spent: 162500,
    remaining: 87500,
    categories: [
      { name: "Venue", allocated: 75000, spent: 75000, remaining: 0 },
      { name: "Artists", allocated: 100000, spent: 50000, remaining: 50000 },
      { name: "Marketing", allocated: 25000, spent: 15000, remaining: 10000 },
      { name: "Staff", allocated: 30000, spent: 12500, remaining: 17500 },
      { name: "Equipment", allocated: 15000, spent: 7500, remaining: 7500 },
      { name: "Miscellaneous", allocated: 5000, spent: 2500, remaining: 2500 },
    ],
  },
  tasks: [
    { id: "task-1", name: "Venue booking", status: "completed", dueDate: "2023-03-15" },
    { id: "task-2", name: "Artist contracts", status: "in-progress", dueDate: "2023-06-30" },
    { id: "task-3", name: "Vendor coordination", status: "in-progress", dueDate: "2023-07-15" },
    { id: "task-4", name: "Marketing campaign", status: "in-progress", dueDate: "2023-07-30" },
    { id: "task-5", name: "Ticket sales", status: "in-progress", dueDate: "2023-08-10" },
    { id: "task-6", name: "Staff scheduling", status: "not-started", dueDate: "2023-07-25" },
    { id: "task-7", name: "Equipment rental", status: "not-started", dueDate: "2023-08-01" },
    { id: "task-8", name: "Security planning", status: "not-started", dueDate: "2023-07-20" },
  ],
  staff: [
    { id: "staff-1", name: "Alex Johnson", role: "Event Manager", avatar: "/extraterrestrial-encounter.png" },
    { id: "staff-2", name: "Sam Williams", role: "Technical Director", avatar: "/abstract-sv.png" },
    { id: "staff-3", name: "Jamie Lee", role: "Marketing Coordinator", avatar: "/stylized-letter-st.png" },
    { id: "staff-4", name: "Taylor Smith", role: "Vendor Liaison", avatar: "/computer-science-abstract.png" },
    { id: "staff-5", name: "Jordan Patel", role: "Security Lead", avatar: "/vibrant-cityscape.png" },
  ],
  vendors: [
    {
      id: "vendor-1",
      name: "SoundMasters Pro",
      type: "Audio Equipment",
      contact: "contact@soundmasterspro.com",
      status: "confirmed",
    },
    { id: "vendor-2", name: "LightWorks", type: "Lighting", contact: "info@lightworks.com", status: "confirmed" },
    {
      id: "vendor-3",
      name: "FoodTruck Collective",
      type: "Food & Beverage",
      contact: "bookings@foodtruckcollective.com",
      status: "pending",
    },
    {
      id: "vendor-4",
      name: "CleanTeam Services",
      type: "Cleaning",
      contact: "service@cleanteam.com",
      status: "confirmed",
    },
    { id: "vendor-5", name: "SecureEvent", type: "Security", contact: "operations@secureevent.com", status: "pending" },
  ],
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(eventData.tasks as Task[])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined)

  // In a real app, you would fetch the event data based on the ID
  const eventId = params.id as string
  const event = { ...eventData, tasks } // This would be fetched from your database

  useEffect(() => {
    if (searchQuery) {
      setFilteredTasks(
        tasks.filter(
          (task) =>
            task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredTasks(tasks)
    }
  }, [searchQuery, tasks])

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const totalTasks = tasks.length
  const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      await generatePDF()
    } catch (error) {
      console.error("Error generating PDF:", error)
      // Add a toast or alert here to notify the user
      alert("There was an error generating the PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleAddTask = () => {
    setCurrentTask(undefined)
    setTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setCurrentTask(task)
    setTaskDialogOpen(true)
  }

  const handleSaveTask = (taskData: Omit<Task, "id">) => {
    if (currentTask) {
      // Update existing task
      setTasks(tasks.map((task) => (task.id === currentTask.id ? { ...task, ...taskData } : task)))
    } else {
      // Add new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
      }
      setTasks([...tasks, newTask])
    }
    setTaskDialogOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== taskId))
    }
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)))
  }

  return (
    <div className="container mx-auto p-4">
      <Header />

      <div className="mb-6">
        <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                {event.date}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-purple-500" />
                {event.location}
              </div>
              <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700/50">
                {event.type}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingPDF ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100">Event Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="font-medium text-slate-200">Attendees</h3>
                </div>
                <p className="text-2xl font-bold text-white">{event.attendees.toLocaleString()}</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="font-medium text-slate-200">Budget</h3>
                </div>
                <p className="text-2xl font-bold text-white">${event.budget.total.toLocaleString()}</p>
                <p className="text-sm text-slate-400">${event.budget.spent.toLocaleString()} spent</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="font-medium text-slate-200">Timeline</h3>
                </div>
                <p className="text-2xl font-bold text-white">{event.daysUntil} days</p>
                <p className="text-sm text-slate-400">until event</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-200">Overall Progress</h3>
                <span className="text-purple-400">{event.progress}%</span>
              </div>
              <Progress value={event.progress} className="h-2 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${event.progress}%` }}
                />
              </Progress>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100">Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-slate-800 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-purple-500 stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * taskCompletionPercentage) / 100}
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{taskCompletionPercentage}%</span>
                </div>
              </div>
              <p className="mt-4 text-slate-400">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="bg-slate-800/50 p-1 mb-6">
          <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="budget" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
            Budget
          </TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
            Staff
          </TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
            Vendors
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-100">Event Tasks</CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAddTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      eventId={eventId}
                      eventName={event.title}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    {searchQuery ? (
                      <>
                        <p>No tasks found matching "{searchQuery}"</p>
                        <Button variant="link" className="text-purple-400 mt-2" onClick={() => setSearchQuery("")}>
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <>
                        <p>No tasks yet</p>
                        <Button variant="link" className="text-purple-400 mt-2" onClick={handleAddTask}>
                          Add your first task
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-100">Budget Management</CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700">Add Expense</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-400 mb-1">Total Budget</h3>
                  <p className="text-2xl font-bold text-white">${event.budget.total.toLocaleString()}</p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-400 mb-1">Spent</h3>
                  <p className="text-2xl font-bold text-purple-400">${event.budget.spent.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">
                    {Math.round((event.budget.spent / event.budget.total) * 100)}% of total
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-400 mb-1">Remaining</h3>
                  <p className="text-2xl font-bold text-green-400">${event.budget.remaining.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">
                    {Math.round((event.budget.remaining / event.budget.total) * 100)}% of total
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-slate-200 mb-3">Budget Breakdown</h3>
                <div className="h-8 w-full bg-slate-800 rounded-lg overflow-hidden flex">
                  {event.budget.categories.map((category, index) => {
                    const percentage = (category.allocated / event.budget.total) * 100
                    const colors = [
                      "bg-purple-500",
                      "bg-pink-500",
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-yellow-500",
                      "bg-red-500",
                    ]
                    return (
                      <div
                        key={category.name}
                        className={`h-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                        title={`${category.name}: $${category.allocated.toLocaleString()} (${Math.round(percentage)}%)`}
                      />
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {event.budget.categories.map((category, index) => {
                    const colors = [
                      "bg-purple-500",
                      "bg-pink-500",
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-yellow-500",
                      "bg-red-500",
                    ]
                    return (
                      <div key={category.name} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`} />
                        <span className="text-sm text-slate-400">{category.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-200 mb-3">Budget Categories</h3>
                <div className="space-y-4">
                  {event.budget.categories.map((category) => (
                    <div key={category.name} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-slate-200">{category.name}</h4>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">${category.allocated.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">allocated</p>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Spent: ${category.spent.toLocaleString()}</span>
                        <span className="text-slate-400">Remaining: ${category.remaining.toLocaleString()}</span>
                      </div>

                      <Progress value={(category.spent / category.allocated) * 100} className="h-1.5 bg-slate-700">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(category.spent / category.allocated) * 100}%` }}
                        />
                      </Progress>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-100">Staff Management</CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700">Add Staff</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.staff.map((staffMember) => (
                  <div
                    key={staffMember.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-start"
                  >
                    <Avatar className="h-12 w-12 mr-4 border-2 border-purple-500/50">
                      <AvatarImage src={staffMember.avatar || "/placeholder.svg"} alt={staffMember.name} />
                      <AvatarFallback className="bg-purple-900 text-purple-200">
                        {staffMember.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-slate-200">{staffMember.name}</h4>
                      <p className="text-sm text-purple-400">{staffMember.role}</p>
                      <div className="flex mt-2 space-x-2">
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-slate-700">
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-slate-700">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-100">Vendor Management</CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700">Add Vendor</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Vendor</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.vendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b border-slate-800">
                        <td className="py-3 px-4 text-slate-200">{vendor.name}</td>
                        <td className="py-3 px-4 text-slate-400">{vendor.type}</td>
                        <td className="py-3 px-4 text-slate-400">{vendor.contact}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              vendor.status === "confirmed"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            }
                          >
                            {vendor.status === "confirmed" ? "Confirmed" : "Pending"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-slate-700">
                              Contact
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-slate-700">
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-0">
          <SlackIntegration eventId={eventId} eventName={event.title} />
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleSaveTask}
        task={currentTask}
        title={currentTask ? "Edit Task" : "Add Task"}
      />
    </div>
  )
}
