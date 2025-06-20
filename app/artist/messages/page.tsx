"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Search, 
  Plus, 
  Phone, 
  Video, 
  MoreHorizontal,
  Send,
  Paperclip,
  Smile,
  Pin,
  Settings,
  UserPlus,
  Image as ImageIcon,
  Mic,
  ArrowLeft,
  Circle,
  CheckCheck,
  VolumeX,
  X,
  Upload,
  File,
  Music,
  Play,
  Download,
  Eye,
  FileText,
  VideoIcon,
  Clock
} from "lucide-react"
import { cn } from "@/utils"
import Link from "next/link"

interface Conversation {
  id: string
  type: 'individual' | 'group' | 'event'
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline?: boolean
  participants?: number
  eventDate?: string
  isPinned?: boolean
  isArchived?: boolean
  isMuted?: boolean
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  type: 'text' | 'image' | 'audio' | 'file' | 'video'
  isRead: boolean
  isEdited?: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: string
  duration?: string
}

interface MediaFile {
  id: string
  file: File
  url: string
  type: 'image' | 'video' | 'audio' | 'file'
  preview?: string
}

const conversationTypes = [
  { id: 'all', label: 'All', icon: MessageSquare },
  { id: 'individual', label: 'Direct', icon: MessageSquare },
  { id: 'group', label: 'Groups', icon: Users },
  { id: 'event', label: 'Events', icon: Calendar }
]

const mockConversations: Conversation[] = [
  {
    id: '1',
    type: 'individual',
    name: 'Sarah Johnson',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'Great work on the new track! When can we schedule the recording session?',
    lastMessageTime: '2 min ago',
    unreadCount: 2,
    isOnline: true,
    isPinned: true
  },
  {
    id: '2',
    type: 'group',
    name: 'Album Production Team',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'Michael: The mixing is almost complete. Should be ready by Friday.',
    lastMessageTime: '15 min ago',
    unreadCount: 5,
    participants: 8
  },
  {
    id: '3',
    type: 'event',
    name: 'Madison Square Garden - April 20',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'Venue manager: Sound check scheduled for 3 PM. Please arrive early.',
    lastMessageTime: '1 hour ago',
    unreadCount: 1,
    eventDate: '2024-04-20',
    participants: 15
  },
  {
    id: '4',
    type: 'individual',
    name: 'David Chen',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'The contract looks good. Ready to sign when you are.',
    lastMessageTime: '3 hours ago',
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '5',
    type: 'group',
    name: 'Tour Planning',
    avatar: '/placeholder.svg?height=40&width=40',
    lastMessage: 'Emma: Updated the tour schedule. Check the new dates.',
    lastMessageTime: '1 day ago',
    unreadCount: 3,
    participants: 12,
    isMuted: true
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'other',
    senderName: 'Sarah Johnson',
    senderAvatar: '/placeholder.svg?height=32&width=32',
    content: 'Hey! I listened to your latest demo. The melody is incredible!',
    timestamp: '2:30 PM',
    type: 'text',
    isRead: true
  },
  {
    id: '2',
    senderId: 'me',
    senderName: 'You',
    content: 'Thanks! I\'ve been working on it for weeks. What do you think about the bridge?',
    timestamp: '2:32 PM',
    type: 'text',
    isRead: true
  },
  {
    id: '3',
    senderId: 'other',
    senderName: 'Sarah Johnson',
    senderAvatar: '/placeholder.svg?height=32&width=32',
    content: 'Demo Track - Bridge Version.mp3',
    timestamp: '2:35 PM',
    type: 'audio',
    isRead: false,
    fileUrl: '/demo-track.mp3',
    fileName: 'Demo Track - Bridge Version.mp3',
    fileSize: '4.2 MB',
    duration: '3:45'
  },
  {
    id: '4',
    senderId: 'other',
    senderName: 'Sarah Johnson',
    senderAvatar: '/placeholder.svg?height=32&width=32',
    content: 'Great work on the new track! When can we schedule the recording session?',
    timestamp: '2:38 PM',
    type: 'text',
    isRead: false
  }
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [attachments, setAttachments] = useState<MediaFile[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredConversations = mockConversations.filter(conv => {
    const matchesType = selectedType === 'all' || conv.type === selectedType
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch && !conv.isArchived
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation])

  const handleSendMessage = () => {
    if (messageInput.trim() || attachments.length > 0) {
      // Handle sending message with attachments
      setMessageInput('')
      setAttachments([])
    }
  }

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const mediaFile: MediaFile = {
        id: Date.now().toString() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        type: getFileType(file)
      }
      setAttachments(prev => [...prev, mediaFile])
    })
  }

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'file' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    return 'file'
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon
      case 'video': return VideoIcon
      case 'audio': return Music
      case 'file': return FileText
      default: return File
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'group': return Users
      case 'event': return Calendar
      default: return MessageSquare
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex h-full">
      {/* Sidebar */}
        <motion.div 
          className="w-80 border-r border-slate-800/50 flex flex-col bg-slate-900/50 backdrop-blur-sm"
          initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <Link href="/artist" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Conversation</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Messages</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
              />
            </div>
          </div>

          {/* Conversation Types */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex space-x-1 bg-slate-800/30 rounded-lg p-1">
              {conversationTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "flex-1 justify-center",
                      selectedType === type.id 
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg" 
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type.label}
          </Button>
                )
              })}
            </div>
        </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="px-3 py-2 space-y-1">
              {filteredConversations.map((conversation, index) => {
                const Icon = getConversationIcon(conversation.type)
              return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-800/50",
                      selectedConversation?.id === conversation.id && "bg-slate-800/70 border border-purple-500/30 shadow-lg"
                    )}
                  >
                    {/* Avatar Section - Fixed Width */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 ring-2 ring-slate-700/50">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium">
                          {conversation.name.charAt(0)}
                        </AvatarFallback>
                  </Avatar>
                      {conversation.type === 'individual' && conversation.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-slate-900 rounded-full" />
                      )}
                      {conversation.type !== 'individual' && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-slate-700 border-2 border-slate-900 rounded-full flex items-center justify-center">
                          <Icon className="h-2 w-2 text-slate-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section - Flexible Width */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <h3 className="font-medium text-white truncate text-sm">{conversation.name}</h3>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {conversation.isPinned && <Pin className="h-3 w-3 text-purple-400" />}
                            {conversation.isMuted && <VolumeX className="h-3 w-3 text-slate-500" />}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-slate-400 whitespace-nowrap">{conversation.lastMessageTime}</span>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-purple-600 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center min-w-[20px] font-medium">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Message Preview */}
                      <p className="text-sm text-slate-400 truncate leading-tight">{conversation.lastMessage}</p>
                      
                      {/* Metadata Row */}
                      {conversation.type !== 'individual' && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Users className="h-3 w-3 text-slate-500 flex-shrink-0" />
                          <span className="text-xs text-slate-500">{conversation.participants} participants</span>
                          {conversation.eventDate && (
                            <>
                              <div className="h-1 w-1 bg-slate-500 rounded-full flex-shrink-0" />
                              <span className="text-xs text-slate-500 truncate">{conversation.eventDate}</span>
                            </>
                          )}
                        </div>
                      )}
                  </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
            <motion.div
                className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-slate-700/50">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {selectedConversation.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-white">{selectedConversation.name}</h2>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      {selectedConversation.type === 'individual' ? (
                        <span className="flex items-center">
                          <div className={cn("h-2 w-2 rounded-full mr-2", selectedConversation.isOnline ? "bg-green-500" : "bg-slate-500")} />
                          {selectedConversation.isOnline ? 'Online' : 'Last seen 2 hours ago'}
                        </span>
                      ) : (
                        <span>{selectedConversation.participants} participants</span>
                      )}
                      {selectedConversation.eventDate && (
                        <>
                          <Circle className="h-1 w-1 fill-slate-400" />
                          <span>{selectedConversation.eventDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedConversation.type === 'individual' && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voice Call</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">
                              <Video className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Video Call</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                  {selectedConversation.type === 'group' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add Member</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800/50">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>More Options</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </motion.div>

              {/* Messages */}
              <div 
                className={cn(
                  "flex-1 relative",
                  dragActive && "bg-purple-500/10 border-2 border-dashed border-purple-500/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {mockMessages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={cn(
                          "flex",
                          message.senderId === 'me' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "flex items-end space-x-2 max-w-[70%]",
                          message.senderId === 'me' ? "flex-row-reverse space-x-reverse" : ""
                        )}>
                          {message.senderId !== 'me' && (
                            <Avatar className="h-8 w-8 ring-2 ring-slate-700/30">
                              <AvatarImage src={message.senderAvatar} />
                              <AvatarFallback className="bg-slate-700 text-purple-400 text-xs">
                                {message.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn(
                            "rounded-2xl px-4 py-2 max-w-full",
                            message.senderId === 'me' 
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                              : "bg-slate-800/70 text-slate-100 border border-slate-700/50"
                          )}>
                            {message.senderId !== 'me' && selectedConversation.type !== 'individual' && (
                              <div className="text-xs text-purple-400 mb-1">{message.senderName}</div>
                            )}
                            
                            {/* Message Content */}
                            {message.type === 'text' && (
                              <p className="text-sm">{message.content}</p>
                            )}
                            
                            {/* Audio Message */}
                            {message.type === 'audio' && (
                              <div className="flex items-center space-x-3 bg-slate-900/50 rounded-lg p-3">
                                <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                  <Music className="h-5 w-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{message.fileName}</span>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Play className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                                    <span>{message.duration}</span>
                                    <Circle className="h-1 w-1 fill-slate-400" />
                                    <span>{message.fileSize}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* File/Image Messages */}
                            {(message.type === 'image' || message.type === 'file') && (
                              <div className="space-y-2">
                                {message.content && <p className="text-sm">{message.content}</p>}
                                <div className="bg-slate-900/50 rounded-lg p-3 flex items-center space-x-3">
                                  <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <File className="h-5 w-5 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{message.fileName}</div>
                                    <div className="text-xs text-slate-400">{message.fileSize}</div>
                                  </div>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <div className={cn(
                              "flex items-center justify-end space-x-1 mt-1",
                              message.senderId === 'me' ? "text-purple-200" : "text-slate-400"
                            )}>
                              <span className="text-xs">{message.timestamp}</span>
                              {message.senderId === 'me' && (
                                <CheckCheck className={cn(
                                  "h-3 w-3",
                                  message.isRead ? "text-purple-200" : "text-purple-400"
                                )} />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                      </div>
                </ScrollArea>
                
                {dragActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-purple-500/10 backdrop-blur-sm">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                      <p className="text-purple-400 font-medium">Drop files here to upload</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <motion.div 
                  className="border-t border-slate-800/50 p-4 bg-slate-900/30"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Attachments ({attachments.length})</span>
                  </div>
                  <div className="flex space-x-2 overflow-x-auto">
                    {attachments.map((attachment) => {
                      const IconComponent = getFileIcon(attachment.type)
                      return (
                        <div key={attachment.id} className="relative flex-shrink-0">
                          {attachment.type === 'image' ? (
                            <div className="relative">
                              <img 
                                src={attachment.url} 
                                alt="Preview" 
                                className="h-20 w-20 object-cover rounded-lg border border-slate-700"
                  />
                  <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="h-20 w-20 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col items-center justify-center relative">
                              <IconComponent className="h-6 w-6 text-slate-400 mb-1" />
                              <span className="text-xs text-slate-400 truncate w-16 text-center">
                                {attachment.file.name}
                              </span>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Message Input */}
              <motion.div 
                className="p-4 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 pr-24 focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        multiple
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-700/50"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Paperclip className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Attach File</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-700/50"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                              <Smile className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Emoji</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className={cn(
                            "text-slate-400 hover:text-white hover:bg-slate-700/50",
                            isRecording && "text-red-400 bg-red-500/20"
                          )}
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Voice Message</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() && attachments.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
            </motion.div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/50">
            <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-purple-500/20">
                  <MessageSquare className="h-8 w-8 text-purple-400" />
            </div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-slate-400 mb-6">Choose from your existing conversations or start a new one</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 