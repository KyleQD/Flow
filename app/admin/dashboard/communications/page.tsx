"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Mail,
  Bell,
  Users,
  Megaphone,
  Calendar,
  Clock,
  Star,
  Pin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Share,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Hash,
  Smile,
  Paperclip,
  Mic,
  Camera,
  MoreHorizontal,
  Reply,
  Forward,
  Flag,
  Archive,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Zap,
  Globe,
  Lock,
  Unlock,
  Shield,
  Settings,
  UserPlus,
  UserMinus,
  Crown,
  Award,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Download as DownloadIcon,
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ExternalLink,
  Link,
  Copy,
  Check
} from "lucide-react"

interface Message {
  id: string
  type: 'message' | 'announcement' | 'alert' | 'system'
  content: string
  author: {
    id: string
    name: string
    avatar: string
    role: string
  }
  timestamp: string
  channel: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'sent' | 'delivered' | 'read'
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    size: number
  }>
  replies?: Message[]
}

interface Channel {
  id: string
  name: string
  type: 'public' | 'private' | 'dm'
  description: string
  members: number
  unread: number
  lastMessage?: Message
  isActive: boolean
  isPinned: boolean
}

interface Announcement {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
    role: string
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'general' | 'tour' | 'event' | 'financial' | 'technical'
  timestamp: string
  expiresAt?: string
  targetAudience: string[]
  status: 'draft' | 'published' | 'expired'
  readBy: string[]
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
  }>
}

export default function CommunicationsPage() {
  const [activeChannel, setActiveChannel] = useState<string>('general')
  const [messageInput, setMessageInput] = useState('')
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'general',
      name: 'General',
      type: 'public',
      description: 'General team discussions',
      members: 45,
      unread: 3,
      isActive: true,
      isPinned: true
    },
    {
      id: 'tours',
      name: 'Tours',
      type: 'public',
      description: 'Tour planning and updates',
      members: 28,
      unread: 7,
      isActive: true,
      isPinned: false
    },
    {
      id: 'events',
      name: 'Events',
      type: 'public',
      description: 'Event coordination',
      members: 35,
      unread: 2,
      isActive: true,
      isPinned: false
    },
    {
      id: 'finance',
      name: 'Finance',
      type: 'private',
      description: 'Financial discussions',
      members: 12,
      unread: 0,
      isActive: true,
      isPinned: false
    },
    {
      id: 'announcements',
      name: 'Announcements',
      type: 'public',
      description: 'Official company announcements',
      members: 45,
      unread: 1,
      isActive: true,
      isPinned: true
    }
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'message',
      content: 'Good morning team! Ready for another exciting day of tour planning?',
      author: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '/placeholder-user.jpg',
        role: 'Tour Manager'
      },
      timestamp: '2025-06-25T08:30:00Z',
      channel: 'general',
      priority: 'medium',
      status: 'read',
      reactions: [
        { emoji: '👋', count: 5, users: ['2', '3', '4', '5', '6'] },
        { emoji: '☕', count: 3, users: ['2', '3', '4'] }
      ]
    },
    {
      id: '2',
      type: 'announcement',
      content: 'New venue partnership with Madison Square Garden! This opens up incredible opportunities for our upcoming tours.',
      author: {
        id: '2',
        name: 'Michael Chen',
        avatar: '/placeholder-user.jpg',
        role: 'CEO'
      },
      timestamp: '2025-06-25T09:15:00Z',
      channel: 'announcements',
      priority: 'high',
      status: 'delivered',
      reactions: [
        { emoji: '🎉', count: 12, users: ['1', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'] },
        { emoji: '🚀', count: 8, users: ['1', '3', '4', '5', '6', '7', '8', '9'] }
      ]
    },
    {
      id: '3',
      type: 'message',
      content: 'DJ Luna\'s sound check is scheduled for 2 PM. All technical crew please be ready.',
      author: {
        id: '3',
        name: 'Alex Rodriguez',
        avatar: '/placeholder-user.jpg',
        role: 'Technical Director'
      },
      timestamp: '2025-06-25T10:45:00Z',
      channel: 'tours',
      priority: 'high',
      status: 'delivered',
      reactions: [
        { emoji: '✅', count: 6, users: ['1', '2', '4', '5', '6', '7'] }
      ]
    },
    {
      id: '4',
      type: 'alert',
      content: 'Weather alert: Possible thunderstorms this evening. Backup plans for outdoor events should be activated.',
      author: {
        id: '4',
        name: 'System',
        avatar: '/placeholder-user.jpg',
        role: 'System'
      },
      timestamp: '2025-06-25T11:20:00Z',
      channel: 'general',
      priority: 'urgent',
      status: 'sent',
      reactions: [
        { emoji: '⚠️', count: 8, users: ['1', '2', '3', '5', '6', '7', '8', '9'] }
      ]
    }
  ])

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Q2 Performance Review',
      content: 'Excellent work team! We exceeded our revenue targets by 23% this quarter. Tour bookings are up 45% from last year.',
      author: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '/placeholder-user.jpg',
        role: 'Tour Manager'
      },
      priority: 'high',
      category: 'financial',
      timestamp: '2025-06-24T16:00:00Z',
      targetAudience: ['all'],
      status: 'published',
      readBy: ['1', '2', '3', '4', '5'],
      reactions: [
        { emoji: '🎉', count: 15, users: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'] },
        { emoji: '💪', count: 8, users: ['1', '2', '3', '4', '5', '6', '7', '8'] }
      ]
    },
    {
      id: '2',
      title: 'New Safety Protocols',
      content: 'Please review the updated safety protocols for all tour venues. Training session scheduled for next Monday.',
      author: {
        id: '2',
        name: 'Michael Chen',
        avatar: '/placeholder-user.jpg',
        role: 'CEO'
      },
      priority: 'urgent',
      category: 'general',
      timestamp: '2025-06-23T14:30:00Z',
      targetAudience: ['all'],
      status: 'published',
      readBy: ['1', '2', '3'],
      reactions: [
        { emoji: '✅', count: 10, users: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] }
      ]
    }
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="h-4 w-4" />
      case 'alert': return <AlertCircle className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 24) {
      return date.toLocaleDateString()
    } else if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return 'Just now'
    }
  }

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'message',
        content: messageInput,
        author: {
          id: 'current-user',
          name: 'You',
          avatar: '/placeholder-user.jpg',
          role: 'Admin'
        },
        timestamp: new Date().toISOString(),
        channel: activeChannel,
        priority: 'medium',
        status: 'sent',
        reactions: []
      }
      setMessages([...messages, newMessage])
      setMessageInput('')
    }
  }

  const channelMessages = messages.filter(msg => msg.channel === activeChannel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Communications Hub
            </h1>
            <p className="text-slate-400 mt-2">
              Team messaging, announcements, and stakeholder updates
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsAnnouncementOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[800px]">
          {/* Channels Sidebar */}
          <div className="col-span-3 space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Channels</span>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeChannel === channel.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'hover:bg-slate-800/50'
                    }`}
                    onClick={() => setActiveChannel(channel.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {channel.type === 'private' ? (
                          <Lock className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Hash className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-white font-medium">{channel.name}</span>
                        {channel.isPinned && (
                          <Pin className="h-3 w-3 text-yellow-400" />
                        )}
                      </div>
                      {channel.unread > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          {channel.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{channel.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">{channel.members} members</span>
                      <div className={`w-2 h-2 rounded-full ${channel.isActive ? 'bg-green-400' : 'bg-slate-600'}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="col-span-6">
            <Card className="bg-slate-900/50 border-slate-700/50 h-full flex flex-col">
              <CardHeader className="flex-shrink-0 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <Hash className="h-5 w-5 mr-2 text-slate-400" />
                      {channels.find(c => c.id === activeChannel)?.name}
                    </CardTitle>
                    <p className="text-slate-400 text-sm">
                      {channels.find(c => c.id === activeChannel)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {channelMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-3"
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={message.author.avatar} />
                      <AvatarFallback>{message.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">{message.author.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {message.author.role}
                        </Badge>
                        <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
                        {message.priority !== 'medium' && (
                          <Badge className={getPriorityColor(message.priority)}>
                            {message.priority}
                          </Badge>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'announcement' 
                          ? 'bg-blue-500/10 border border-blue-500/20' 
                          : message.type === 'alert'
                          ? 'bg-red-500/10 border border-red-500/20'
                          : 'bg-slate-800/50'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.type !== 'message' && (
                            <div className="flex-shrink-0 mt-1">
                              {getTypeIcon(message.type)}
                            </div>
                          )}
                          <p className="text-slate-300">{message.content}</p>
                        </div>
                      </div>
                      {message.reactions.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 rounded-full hover:bg-slate-800 transition-colors"
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-xs text-slate-400">{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>

              <div className="flex-shrink-0 border-t border-slate-700/50 p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-slate-800/50 border-slate-700/50 text-white"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Announcements Panel */}
          <div className="col-span-3 space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Megaphone className="h-5 w-5 mr-2 text-blue-400" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{announcement.title}</h4>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {formatTime(announcement.timestamp)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {announcement.reactions.map((reaction, index) => (
                          <span key={index} className="text-xs">
                            {reaction.emoji} {reaction.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  View All Announcements
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-400" />
                  Online Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Sarah Johnson', role: 'Tour Manager', status: 'active' },
                  { name: 'Michael Chen', role: 'CEO', status: 'active' },
                  { name: 'Alex Rodriguez', role: 'Technical Director', status: 'idle' },
                  { name: 'Lisa Park', role: 'Event Coordinator', status: 'active' },
                  { name: 'David Kim', role: 'Finance Manager', status: 'busy' }
                ].map((user, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        user.status === 'active' ? 'bg-green-400' :
                        user.status === 'idle' ? 'bg-yellow-400' :
                        user.status === 'busy' ? 'bg-red-400' : 'bg-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
