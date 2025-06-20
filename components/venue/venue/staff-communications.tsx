"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Paperclip,
  Smile,
  Users,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mic,
  RadioTower,
  Headphones,
  MonitorSpeaker,
  Zap,
  Target,
  Shield,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX
} from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  type: 'text' | 'voice' | 'file' | 'system' | 'emergency'
  priority?: 'low' | 'normal' | 'high' | 'emergency'
  recipients?: string[]
  readBy?: string[]
  attachments?: Array<{
    name: string
    type: string
    url: string
    size?: number
  }>
}

interface Channel {
  id: string
  name: string
  type: 'general' | 'department' | 'emergency' | 'direct'
  members: number
  unreadCount: number
  lastMessage?: string
  lastActivity: string
  isActive: boolean
}

export function StaffCommunications() {
  const [activeChannel, setActiveChannel] = useState<string>("general")
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false)
  const [emergencyMessage, setEmergencyMessage] = useState("")
  const [emergencyLevel, setEmergencyLevel] = useState("medium")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channels: Channel[] = [
    { id: "general", name: "General", type: "general", members: 24, unreadCount: 3, lastMessage: "Sound check complete", lastActivity: "2 min ago", isActive: true },
    { id: "operations", name: "Operations", type: "department", members: 8, unreadCount: 0, lastMessage: "All stations ready", lastActivity: "5 min ago", isActive: true },
    { id: "technical", name: "Technical", type: "department", members: 6, unreadCount: 1, lastMessage: "Equipment status good", lastActivity: "3 min ago", isActive: true },
    { id: "security", name: "Security", type: "department", members: 4, unreadCount: 0, lastMessage: "All clear", lastActivity: "1 min ago", isActive: true },
    { id: "emergency", name: "Emergency", type: "emergency", members: 24, unreadCount: 0, lastMessage: "", lastActivity: "", isActive: false }
  ]

  const messages: Message[] = [
    {
      id: "1",
      senderId: "maya",
      senderName: "Maya Rodriguez",
      senderAvatar: "/placeholder.svg",
      content: "Sound system check complete. All levels are optimal for tonight's event.",
      timestamp: "14:32",
      type: "text",
      priority: "normal"
    },
    {
      id: "2",
      senderId: "system",
      senderName: "System",
      content: "Automated backup completed successfully",
      timestamp: "14:30",
      type: "system",
      priority: "low"
    },
    {
      id: "3",
      senderId: "jordan",
      senderName: "Jordan Kim",
      senderAvatar: "/placeholder.svg",
      content: "Bar inventory restocked. We're ready for the rush tonight.",
      timestamp: "14:25",
      type: "text",
      priority: "normal"
    },
    {
      id: "4",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg",
      content: "🚨 VIP section needs special attention tonight. Premium service required.",
      timestamp: "14:20",
      type: "text",
      priority: "high"
    }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return
    // Message sending logic would go here
    setMessage("")
  }

  const handleEmergencyBroadcast = () => {
    if (!emergencyMessage.trim()) return
    // Emergency broadcast logic would go here
    setShowEmergencyDialog(false)
    setEmergencyMessage("")
  }

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording)
    // Voice recording logic would go here
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'general': return MessageSquare
      case 'department': return Users
      case 'emergency': return AlertTriangle
      case 'direct': return Phone
      default: return MessageSquare
    }
  }

  const getMessageTypeColor = (type: string, priority?: string) => {
    if (type === 'emergency' || priority === 'emergency') return 'border-red-500 bg-red-500/10'
    if (priority === 'high') return 'border-orange-500 bg-orange-500/10'
    if (type === 'system') return 'border-cyan-500 bg-cyan-500/10'
    return 'border-slate-600 bg-slate-700/30'
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Channels Sidebar */}
        <Card className="lg:col-span-1 bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <RadioTower className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-400">Channels</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Quick Actions */}
            <div className="px-4 pb-4 space-y-2">
              <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Broadcast
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-red-500/50">
                  <DialogHeader>
                    <DialogTitle className="text-red-400 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Emergency Broadcast
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select value={emergencyLevel} onValueChange={setEmergencyLevel}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Emergency Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="critical">🚨 Critical Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Emergency message..."
                      value={emergencyMessage}
                      onChange={(e) => setEmergencyMessage(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowEmergencyDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleEmergencyBroadcast}
                        className="bg-gradient-to-r from-red-600 to-red-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Broadcast Now
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="w-full border-slate-600 bg-slate-700/50">
                <MonitorSpeaker className="h-4 w-4 mr-2" />
                All-Call System
              </Button>
            </div>

            {/* Channels List */}
            <ScrollArea className="h-96">
              <div className="px-4 space-y-2">
                {channels.map((channel) => {
                  const Icon = getChannelIcon(channel.type)
                  return (
                    <div
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        activeChannel === channel.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-4 w-4 ${
                            channel.type === 'emergency' ? 'text-red-400' :
                            activeChannel === channel.id ? 'text-cyan-400' : 'text-slate-400'
                          }`} />
                          <span className="text-white font-medium text-sm">{channel.name}</span>
                          {channel.isActive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        {channel.unreadCount > 0 && (
                          <Badge className="bg-cyan-500 text-white text-xs">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {channel.members} members
                        {channel.lastMessage && (
                          <span className="block truncate">{channel.lastMessage}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-3 bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <CardTitle className="text-white">
                  #{channels.find(c => c.id === activeChannel)?.name || 'General'}
                </CardTitle>
                <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-300">
                  {channels.find(c => c.id === activeChannel)?.members || 0} members
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-96">
            {/* Messages Area */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-4 rounded-lg border ${getMessageTypeColor(msg.type, msg.priority)}`}>
                    <div className="flex items-start space-x-3">
                      {msg.type !== 'system' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.senderAvatar} />
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs">
                            {msg.senderName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-medium text-sm">{msg.senderName}</span>
                          <span className="text-slate-400 text-xs">{msg.timestamp}</span>
                          {msg.priority === 'high' && (
                            <Badge className="bg-orange-500 text-white text-xs">High Priority</Badge>
                          )}
                          {msg.type === 'emergency' && (
                            <Badge className="bg-red-500 text-white text-xs animate-pulse">EMERGENCY</Badge>
                          )}
                        </div>
                        <p className="text-slate-200 text-sm">{msg.content}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((attachment, i) => (
                              <div key={i} className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded">
                                <Paperclip className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-300 text-sm">{attachment.name}</span>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceRecording}
                  className={`${isRecording ? 'text-red-400 bg-red-500/20' : 'text-slate-400'}`}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                />
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {isRecording && (
                <div className="mt-2 flex items-center space-x-2 text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Recording voice message...</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsRecording(false)}>
                    <Pause className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 