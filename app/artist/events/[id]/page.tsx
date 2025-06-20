"use client"

import { useState, useEffect } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { format } from "date-fns"
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Clock,
  Users,
  DollarSign,
  Edit,
  Share2,
  Download,
  Music,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Image from "next/image"

interface Event {
  id: string
  title: string
  description?: string
  type: 'concert' | 'festival' | 'tour' | 'recording' | 'interview' | 'other'
  venue_name?: string
  venue_address?: string
  venue_city?: string
  venue_state?: string
  venue_country?: string
  event_date: string
  start_time?: string
  end_time?: string
  doors_open?: string
  ticket_url?: string
  ticket_price_min?: number
  ticket_price_max?: number
  capacity?: number
  expected_attendance?: number
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
  is_public: boolean
  poster_url?: string
  setlist?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  due_date?: string
  assignee?: string
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

export default function EventDetailPage() {
  const { user } = useArtist()
  const supabase = createClientComponentClient()
  const params = useParams()
  const router = useRouter()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedTab, setSelectedTab] = useState("overview")
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' })
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: '', date: new Date().toISOString().split('T')[0] })

  const eventId = params.id as string

  useEffect(() => {
    if (user && eventId) {
      loadEvent()
      loadTasks()
      loadExpenses()
    }
  }, [user, eventId])

  const loadEvent = async () => {
    if (!user || !eventId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('artist_events')
        .select('*')
        .eq('id', eventId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      if (data) {
        setEvent(data)
      } else {
        toast.error('Event not found')
        router.push('/artist/events')
      }
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
      router.push('/artist/events')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    // Mock data for now - you could create an event_tasks table
    setTasks([
      { id: '1', title: 'Book sound equipment', completed: true, due_date: '2024-01-15' },
      { id: '2', title: 'Confirm catering', completed: false, due_date: '2024-01-20' },
      { id: '3', title: 'Set up merchandise table', completed: false, due_date: '2024-01-25' },
      { id: '4', title: 'Sound check', completed: false, due_date: '2024-01-30' }
    ])
  }

  const loadExpenses = async () => {
    // Mock data for now - you could create an event_expenses table
    setExpenses([
      { id: '1', description: 'Venue rental', amount: 2500, category: 'Venue', date: '2024-01-10' },
      { id: '2', description: 'Sound equipment', amount: 800, category: 'Equipment', date: '2024-01-12' },
      { id: '3', description: 'Marketing materials', amount: 300, category: 'Marketing', date: '2024-01-14' }
    ])
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      due_date: newTask.due_date || undefined
    }

    setTasks(prev => [...prev, task])
    setNewTask({ title: '', description: '', due_date: '' })
    setShowTaskModal(false)
    toast.success('Task added successfully')
  }

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const addExpense = async () => {
    if (!newExpense.description.trim() || newExpense.amount <= 0) return

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category || 'Other',
      date: newExpense.date
    }

    setExpenses(prev => [...prev, expense])
    setNewExpense({ description: '', amount: 0, category: '', date: new Date().toISOString().split('T')[0] })
    setShowExpenseModal(false)
    toast.success('Expense added successfully')
  }

  const updateEventStatus = async (newStatus: Event['status']) => {
    if (!event || !user) return

    try {
      const { error } = await supabase
        .from('artist_events')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', event.id)
        .eq('user_id', user.id)

      if (error) throw error
      
      setEvent(prev => prev ? { ...prev, status: newStatus } : prev)
      toast.success(`Event marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating event status:', error)
      toast.error('Failed to update event status')
    }
  }

  const copyEventLink = () => {
    const link = `${window.location.origin}/events/${event?.id}`
    navigator.clipboard.writeText(link)
    toast.success('Event link copied to clipboard')
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600/20 text-blue-300 border-blue-500/30'
      case 'in_progress': return 'bg-green-600/20 text-green-300 border-green-500/30'
      case 'completed': return 'bg-gray-600/20 text-gray-300 border-gray-500/30'
      case 'cancelled': return 'bg-red-600/20 text-red-300 border-red-500/30'
      case 'postponed': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30'
    }
  }

  const getCompletionProgress = () => {
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter(task => task.completed).length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getProjectedRevenue = () => {
    if (!event?.ticket_price_min || !event?.expected_attendance) return 0
    return event.ticket_price_min * event.expected_attendance
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Event not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/artist/events')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyEventLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            onClick={() => router.push(`/artist/events/${event.id}/edit`)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Event Header */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                <Badge className={getStatusColor(event.status)}>
                  {event.status.replace('_', ' ')}
                </Badge>
                {!event.is_public && (
                  <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                    Private
                  </Badge>
                )}
              </div>
              
              {event.description && (
                <p className="text-gray-400 mb-4">{event.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium">{format(new Date(event.event_date), 'PPP')}</p>
                    {event.start_time && (
                      <p className="text-sm text-gray-400">{event.start_time}</p>
                    )}
                  </div>
                </div>

                {event.venue_name && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="font-medium">{event.venue_name}</p>
                      {event.venue_city && (
                        <p className="text-sm text-gray-400">{event.venue_city}, {event.venue_state}</p>
                      )}
                    </div>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium">{event.capacity.toLocaleString()} capacity</p>
                      {event.expected_attendance && (
                        <p className="text-sm text-gray-400">{event.expected_attendance.toLocaleString()} expected</p>
                      )}
                    </div>
                  </div>
                )}

                {event.ticket_price_min && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="font-medium">
                        ${event.ticket_price_min}
                        {event.ticket_price_max && event.ticket_price_max !== event.ticket_price_min && 
                          ` - $${event.ticket_price_max}`
                        }
                      </p>
                      <p className="text-sm text-gray-400">Ticket price</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {event.status === 'upcoming' && (
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateEventStatus('in_progress')}
              >
                Mark as In Progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateEventStatus('completed')}
              >
                Mark as Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateEventStatus('cancelled')}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                Cancel Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Progress</p>
                <p className="text-2xl font-bold text-white">{getCompletionProgress()}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={getCompletionProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tasks</p>
                <p className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.completed).length}/{tasks.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expenses</p>
                <p className="text-2xl font-bold text-white">${getTotalExpenses().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Projected Revenue</p>
                <p className="text-2xl font-bold text-white">${getProjectedRevenue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 gap-4 bg-slate-800/50 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Details */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-400 text-sm">Type</Label>
                    <p className="text-white">{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                  </div>
                  
                  {event.venue_address && (
                    <div>
                      <Label className="text-gray-400 text-sm">Full Address</Label>
                      <p className="text-white">
                        {event.venue_address}<br />
                        {event.venue_city}, {event.venue_state} {event.venue_country}
                      </p>
                    </div>
                  )}
                  
                  {event.doors_open && (
                    <div>
                      <Label className="text-gray-400 text-sm">Schedule</Label>
                      <div className="text-white space-y-1">
                        <p>Doors open: {event.doors_open}</p>
                        <p>Show starts: {event.start_time}</p>
                        {event.end_time && <p>Show ends: {event.end_time}</p>}
                      </div>
                    </div>
                  )}
                  
                  {event.ticket_url && (
                    <div>
                      <Label className="text-gray-400 text-sm">Tickets</Label>
                      <a 
                        href={event.ticket_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        Buy tickets <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {event.notes ? (
                  <p className="text-gray-300 whitespace-pre-wrap">{event.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Setlist */}
          {event.setlist && event.setlist.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Setlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.setlist.map((song, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                      <span className="text-gray-400 w-8">{index + 1}.</span>
                      <span className="text-white">{song}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Event Tasks</h2>
            <Button onClick={() => setShowTaskModal(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-green-600 border-green-600' 
                            : 'border-gray-400 hover:border-green-400'
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-400">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {format(new Date(task.due_date), 'PPP')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tasks.length === 0 && (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
                <p className="text-gray-400 mb-4">Add tasks to keep track of event preparation.</p>
                <Button onClick={() => setShowTaskModal(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Budget Tracking</h2>
            <Button onClick={() => setShowExpenseModal(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-400">${getTotalExpenses().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Projected Revenue</p>
                  <p className="text-2xl font-bold text-green-400">${getProjectedRevenue().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Projected Profit</p>
                  <p className={`text-2xl font-bold ${getProjectedRevenue() - getTotalExpenses() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(getProjectedRevenue() - getTotalExpenses()).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses List */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{expense.description}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{expense.category}</span>
                          <span>{format(new Date(expense.date), 'PPP')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-400">${expense.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No expenses tracked yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Marketing Materials</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <ImageIcon className="h-12 w-12 text-gray-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">Marketing Tools Coming Soon</h3>
                <p className="text-gray-400">
                  Create posters, social media posts, and promotional materials for your event.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Event Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
                <p className="text-gray-400">
                  Manage event permissions, integrations, and advanced configurations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task_title" className="text-gray-300">Title *</Label>
              <Input
                id="task_title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task title..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task_description" className="text-gray-300">Description</Label>
              <Textarea
                id="task_description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task_due_date" className="text-gray-300">Due Date</Label>
              <Input
                id="task_due_date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
              <Button onClick={addTask} className="bg-purple-600 hover:bg-purple-700">
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense_description" className="text-gray-300">Description *</Label>
              <Input
                id="expense_description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Expense description..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense_amount" className="text-gray-300">Amount *</Label>
                <Input
                  id="expense_amount"
                  type="number"
                  step="0.01"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense_category" className="text-gray-300">Category</Label>
                <Input
                  id="expense_category"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Category..."
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_date" className="text-gray-300">Date</Label>
              <Input
                id="expense_date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
                Cancel
              </Button>
              <Button onClick={addExpense} className="bg-purple-600 hover:bg-purple-700">
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 