"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  MessageSquare,
  Calendar,
  DollarSign,
  Settings,
  ArrowRight,
  Plus,
  Zap
} from "lucide-react"
import { format, addDays, differenceInDays, isToday, isTomorrow } from "date-fns"
import Link from "next/link"
import { cn } from "@/utils"

interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: Date
  type: 'profile' | 'collaboration' | 'payment' | 'content' | 'event' | 'business'
  status: 'pending' | 'in_progress' | 'completed'
  progress?: number
  actionUrl?: string
}

interface ActionItemsProps {
  items: ActionItem[]
  isLoading?: boolean
  onComplete?: (id: string) => void
  onViewAll?: () => void
}

export function ArtistActionItems({ 
  items, 
  isLoading = false, 
  onComplete,
  onViewAll 
}: ActionItemsProps) {
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-400" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-400" />
      case 'low': return <Bell className="h-4 w-4 text-blue-400" />
      default: return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'profile': return <User className="h-4 w-4" />
      case 'collaboration': return <MessageSquare className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'content': return <Plus className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'business': return <Settings className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'profile': return 'bg-purple-500/20'
      case 'collaboration': return 'bg-green-500/20'
      case 'payment': return 'bg-emerald-500/20'
      case 'content': return 'bg-blue-500/20'
      case 'event': return 'bg-orange-500/20'
      case 'business': return 'bg-pink-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  const getDueDateText = (date: Date) => {
    const days = differenceInDays(date, new Date())
    if (days < 0) return 'Overdue'
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    if (days < 7) return `Due in ${days} days`
    if (days < 30) return `Due in ${Math.floor(days / 7)} weeks`
    return `Due in ${Math.floor(days / 30)} months`
  }

  const getDueDateColor = (date: Date) => {
    const days = differenceInDays(date, new Date())
    if (days < 0) return 'text-red-400'
    if (days <= 1) return 'text-orange-400'
    if (days <= 3) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const filteredItems = selectedPriority === 'all' 
    ? items 
    : items.filter(item => item.priority === selectedPriority)

  const sortedItems = filteredItems.sort((a, b) => {
    // Sort by priority first (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Then sort by due date (earliest first)
    return a.dueDate.getTime() - b.dueDate.getTime()
  })

  const highPriorityCount = items.filter(item => item.priority === 'high').length
  const overdueCount = items.filter(item => differenceInDays(item.dueDate, new Date()) < 0).length

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-400" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-400" />
              Action Items
            </CardTitle>
            <CardDescription className="text-gray-400">
              Tasks that need your attention
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-700 text-gray-300 hover:text-white"
            onClick={onViewAll}
            asChild
          >
            <Link href="/artist/tasks">
              <ArrowRight className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{items.length}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{highPriorityCount}</div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{overdueCount}</div>
            <div className="text-sm text-gray-400">Overdue</div>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'All', count: items.length },
            { key: 'high', label: 'High', count: items.filter(i => i.priority === 'high').length },
            { key: 'medium', label: 'Medium', count: items.filter(i => i.priority === 'medium').length },
            { key: 'low', label: 'Low', count: items.filter(i => i.priority === 'low').length }
          ].map((priority) => (
            <Button
              key={priority.key}
              variant={selectedPriority === priority.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPriority(priority.key as any)}
              className={cn(
                selectedPriority === priority.key 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "border-slate-700 text-gray-300 hover:text-white"
              )}
            >
              {priority.label}
              <Badge variant="secondary" className="ml-2 bg-slate-700/50 text-white">
                {priority.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Action Items List */}
        <div className="space-y-3">
          {sortedItems.length > 0 ? (
            sortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className={cn("p-2 rounded-lg", getTypeColor(item.type))}>
                  {getTypeIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      {item.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={cn("text-xs", getDueDateColor(item.dueDate))}>
                        {getDueDateText(item.dueDate)}
                      </span>
                      {item.progress !== undefined && (
                        <div className="flex items-center gap-2">
                          <Progress value={item.progress} className="w-20 h-2" />
                          <span className="text-xs text-gray-400">{item.progress}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.actionUrl ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={item.actionUrl}>
                            <Zap className="h-3 w-3 mr-1" />
                            Action
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onComplete?.(item.id)}
                          disabled={item.status === 'completed'}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">All caught up! No pending tasks.</p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                asChild
              >
                <Link href="/artist/tasks">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-6">
          <Button 
            size="sm" 
            className="bg-orange-600 hover:bg-orange-700 flex-1"
            asChild
          >
            <Link href="/artist/tasks">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Link>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-slate-700 text-gray-300 hover:text-white"
            asChild
          >
            <Link href="/artist/tasks/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 