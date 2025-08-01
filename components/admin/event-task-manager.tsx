"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  User,
  Tag
} from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: string
  name: string
  description?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  assigned_to?: string
  category: 'logistics' | 'marketing' | 'technical' | 'financial' | 'staffing' | 'vendor'
  created_at?: string
  updated_at?: string
}

interface EventTaskManagerProps {
  eventId: string
  tasks: Task[]
  onTasksUpdate: (tasks: Task[]) => void
}

export function EventTaskManager({ eventId, tasks, onTasksUpdate }: EventTaskManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_started' as Task['status'],
    priority: 'medium' as Task['priority'],
    due_date: '',
    assigned_to: '',
    category: 'logistics' as Task['category']
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400'
      case 'not_started': return 'bg-slate-500/20 text-slate-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'not_started': return <AlertTriangle className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch
  })

  const handleCreateTask = () => {
    setFormData({
      name: '',
      description: '',
      status: 'not_started',
      priority: 'medium',
      due_date: '',
      assigned_to: '',
      category: 'logistics'
    })
    setIsCreateDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      name: task.name,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
      assigned_to: task.assigned_to || '',
      category: task.category
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveTask = async () => {
    try {
      const taskData = {
        ...formData,
        event_id: eventId
      }

      if (selectedTask) {
        // Update existing task
        const response = await fetch(`/api/events/${eventId}/tasks/${selectedTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })

        if (!response.ok) throw new Error('Failed to update task')

        const updatedTask = await response.json()
        const updatedTasks = tasks.map(task => 
          task.id === selectedTask.id ? updatedTask.task : task
        )
        onTasksUpdate(updatedTasks)
      } else {
        // Create new task
        const response = await fetch(`/api/events/${eventId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })

        if (!response.ok) throw new Error('Failed to create task')

        const newTask = await response.json()
        onTasksUpdate([...tasks, newTask.task])
      }

      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedTask) return

    try {
      const response = await fetch(`/api/events/${eventId}/tasks/${selectedTask.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete task')

      const updatedTasks = tasks.filter(task => task.id !== selectedTask.id)
      onTasksUpdate(updatedTasks)
      setIsDeleteDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/events/${eventId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update task status')

      const updatedTask = await response.json()
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask.task : task
      )
      onTasksUpdate(updatedTasks)
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Tasks</h2>
          <p className="text-slate-400">Manage tasks and track progress</p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Task Progress</h3>
            <span className="text-2xl font-bold text-purple-400">{completionPercentage}%</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>{completedTasks} of {totalTasks} tasks completed</span>
            <span>•</span>
            <span>{tasks.filter(t => t.status === 'in_progress').length} in progress</span>
            <span>•</span>
            <span>{tasks.filter(t => t.status === 'not_started').length} pending</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-slate-400">Search</Label>
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label className="text-slate-400">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="staffing">Staffing</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterStatus('all')
                  setFilterPriority('all')
                  setFilterCategory('all')
                  setSearchQuery('')
                }}
                className="w-full bg-slate-800 border-slate-700"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Tasks Found</h3>
              <p className="text-slate-400 mb-6">
                {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                  ? "No tasks match your current filters"
                  : "Get started by creating your first task"
                }
              </p>
              {!searchQuery && filterStatus === 'all' && filterPriority === 'all' && filterCategory === 'all' && (
                <Button onClick={handleCreateTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        <Tag className="h-3 w-3 mr-1" />
                        {task.category}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-slate-400 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-400">
                      {task.due_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                      {task.assigned_to && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {task.assigned_to}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Select 
                      value={task.status} 
                      onValueChange={(value: Task['status']) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Task Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter task name"
                className="mt-1 bg-slate-700 border-slate-600"
              />
            </div>
            
            <div>
              <Label className="text-slate-400">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                className="mt-1 bg-slate-700 border-slate-600"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="mt-1 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-slate-400">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="mt-1 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: Task['category']) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="staffing">Staffing</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-slate-400">Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-400">Assigned To</Label>
              <Input
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                placeholder="Enter assignee name or email"
                className="mt-1 bg-slate-700 border-slate-600"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setSelectedTask(null)
              }}
              className="bg-slate-700 border-slate-600"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>
              {selectedTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{selectedTask?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 