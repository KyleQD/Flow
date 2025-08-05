"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FolderOpen, 
  Upload, 
  Download, 
  Play, 
  Pause,
  Volume2,
  Share2,
  MessageSquare,
  CheckCircle,
  Clock,
  Users,
  Settings,
  MoreHorizontal,
  FileAudio,
  FileText,
  FileImage,
  FileVideo,
  History,
  GitBranch,
  Star,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Target,
  Award,
  Calendar,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Headphones,
  Mic,
  Music,
  Waveform
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface ProjectFile {
  id: string
  name: string
  type: 'audio' | 'document' | 'image' | 'video'
  size: number
  uploadedBy: string
  uploadedAt: string
  version: number
  description?: string
  isLocked?: boolean
  lockedBy?: string
  tags: string[]
  folder: string
  url?: string
  waveformData?: number[]
  duration?: number
  bpm?: number
  key?: string
}

interface ProjectTask {
  id: string
  title: string
  description: string
  assignedTo: string[]
  createdBy: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  completedAt?: string
  relatedFileId?: string
  tags: string[]
}

interface ProjectCollaborator {
  id: string
  name: string
  avatar: string
  role: 'owner' | 'admin' | 'collaborator' | 'viewer'
  permissions: {
    canEdit: boolean
    canInvite: boolean
    canManageFiles: boolean
    canPostInChannel: boolean
  }
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  contributionScore: number
}

interface ProjectActivity {
  id: string
  userId: string
  userName: string
  userAvatar: string
  action: string
  details: string
  timestamp: string
  type: 'file_upload' | 'task_update' | 'comment' | 'milestone' | 'collaboration'
  relatedFile?: string
  relatedTask?: string
}

const mockFiles: ProjectFile[] = [
  {
    id: '1',
    name: 'Main_Track_v3.wav',
    type: 'audio',
    size: 45000000,
    uploadedBy: 'sarah-chen',
    uploadedAt: '2024-01-15T10:30:00Z',
    version: 3,
    description: 'Latest version with updated vocals and harmonies',
    tags: ['vocals', 'main-track', 'final'],
    folder: 'Audio/Stems',
    duration: 240,
    bpm: 120,
    key: 'C Major',
    waveformData: Array.from({ length: 100 }, () => Math.random() * 100)
  },
  {
    id: '2',
    name: 'Lyrics_Draft.docx',
    type: 'document',
    size: 25000,
    uploadedBy: 'mike-johnson',
    uploadedAt: '2024-01-14T15:20:00Z',
    version: 2,
    description: 'Updated lyrics with bridge corrections',
    tags: ['lyrics', 'draft'],
    folder: 'Documents',
    isLocked: true,
    lockedBy: 'mike-johnson'
  },
  {
    id: '3',
    name: 'Album_Cover_Concept.jpg',
    type: 'image',
    size: 8500000,
    uploadedBy: 'sarah-chen',
    uploadedAt: '2024-01-13T09:15:00Z',
    version: 1,
    description: 'Initial album cover concept art',
    tags: ['artwork', 'concept', 'cover'],
    folder: 'Artwork'
  }
]

const mockTasks: ProjectTask[] = [
  {
    id: '1',
    title: 'Record final vocal takes',
    description: 'Complete vocal recording for tracks 2, 4, and 6',
    assignedTo: ['mike-johnson'],
    createdBy: 'sarah-chen',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-20',
    tags: ['recording', 'vocals'],
    relatedFileId: '1'
  },
  {
    id: '2',
    title: 'Finalize album artwork',
    description: 'Review and approve final album cover design',
    assignedTo: ['sarah-chen', 'mike-johnson'],
    createdBy: 'sarah-chen',
    status: 'review',
    priority: 'medium',
    dueDate: '2024-01-25',
    tags: ['artwork', 'design'],
    relatedFileId: '3'
  }
]

const mockCollaborators: ProjectCollaborator[] = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    role: 'owner',
    permissions: { canEdit: true, canInvite: true, canManageFiles: true, canPostInChannel: true },
    status: 'online',
    lastSeen: 'now',
    contributionScore: 95
  },
  {
    id: 'mike-johnson',
    name: 'Mike Johnson',
    avatar: '/avatars/mike.jpg',
    role: 'collaborator',
    permissions: { canEdit: true, canInvite: false, canManageFiles: true, canPostInChannel: true },
    status: 'away',
    lastSeen: '2 hours ago',
    contributionScore: 87
  }
]

const mockActivity: ProjectActivity[] = [
  {
    id: '1',
    userId: 'sarah-chen',
    userName: 'Sarah Chen',
    userAvatar: '/avatars/sarah.jpg',
    action: 'uploaded a new file',
    details: 'Main_Track_v3.wav',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'file_upload',
    relatedFile: '1'
  },
  {
    id: '2',
    userId: 'mike-johnson',
    userName: 'Mike Johnson',
    userAvatar: '/avatars/mike.jpg',
    action: 'updated task status',
    details: 'Marked "Record final vocal takes" as in progress',
    timestamp: '2024-01-15T09:15:00Z',
    type: 'task_update',
    relatedTask: '1'
  }
]

function FileIcon({ type, className }: { type: ProjectFile['type'], className?: string }) {
  const icons = {
    audio: FileAudio,
    document: FileText,
    image: FileImage,
    video: FileVideo
  }
  
  const Icon = icons[type]
  return <Icon className={className} />
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    online: 'bg-green-500/20 text-green-400 border-green-500/30',
    offline: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    away: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }
  
  return (
    <Badge className={`text-xs ${colors[status as keyof typeof colors] || colors.offline}`}>
      {status}
    </Badge>
  )
}

function AudioWaveform({ waveformData, className }: { waveformData: number[], className?: string }) {
  return (
    <div className={`flex items-end space-x-0.5 ${className}`}>
      {waveformData.slice(0, 50).map((height, index) => (
        <div
          key={index}
          className="bg-purple-400 opacity-60 transition-opacity hover:opacity-100"
          style={{
            height: `${Math.max(height / 4, 2)}px`,
            width: '2px'
          }}
        />
      ))}
    </div>
  )
}

export function EnhancedProjectWorkspace({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [files, setFiles] = useState<ProjectFile[]>(mockFiles)
  const [tasks, setTasks] = useState<ProjectTask[]>(mockTasks)
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>(mockCollaborators)
  const [activity, setActivity] = useState<ProjectActivity[]>(mockActivity)
  const [selectedFolder, setSelectedFolder] = useState("All Files")
  const [playingFile, setPlayingFile] = useState<string | null>(null)

  const project = {
    id: projectId,
    name: "Midnight Vibes EP",
    description: "Collaborative EP with electronic and jazz fusion elements",
    status: "in_progress",
    progress: 65,
    genre: ["Electronic", "Jazz"],
    dueDate: "2024-02-15"
  }

  const folders = ["All Files", "Audio/Stems", "Documents", "Artwork", "References"]

  const filteredFiles = selectedFolder === "All Files" 
    ? files 
    : files.filter(file => file.folder === selectedFolder)

  const getFileTypeColor = (type: ProjectFile['type']) => {
    const colors = {
      audio: 'text-purple-400',
      document: 'text-blue-400',
      image: 'text-green-400',
      video: 'text-red-400'
    }
    return colors[type]
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {project.name}
                  </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-lg">
                  {project.description}
                </CardDescription>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex -space-x-2">
                    {collaborators.map(collab => (
                      <Avatar key={collab.id} className="h-8 w-8 border-2 border-slate-900">
                        <AvatarImage src={collab.avatar} alt={collab.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                          {collab.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{project.progress}%</div>
                  <div className="text-sm text-slate-400">Complete</div>
                </div>
                <Progress value={project.progress} className="w-32 h-3" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Main Workspace */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-900/50 border-slate-700/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-purple-600">Files</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600">Tasks</TabsTrigger>
          <TabsTrigger value="collaborators" className="data-[state=active]:bg-purple-600">Team</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Files */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2 text-purple-400" />
                  Recent Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {files.slice(0, 3).map(file => (
                  <div key={file.id} className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-lg">
                    <FileIcon type={file.type} className={`h-8 w-8 ${getFileTypeColor(file.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">v{file.version} • {formatFileSize(file.size)}</p>
                    </div>
                    {file.type === 'audio' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPlayingFile(playingFile === file.id ? null : file.id)}
                        className="p-2"
                      >
                        {playingFile === file.id ? 
                          <Pause className="h-4 w-4 text-purple-400" /> : 
                          <Play className="h-4 w-4 text-purple-400" />
                        }
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3 border-slate-700 text-slate-300 hover:bg-slate-800/50">
                  View All Files
                </Button>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.filter(task => task.status !== 'completed').slice(0, 3).map(task => (
                  <div key={task.id} className="p-3 bg-slate-800/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <Badge className={`text-xs ${
                        task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${
                        task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        task.status === 'review' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-xs text-slate-400">
                          Due {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3 border-slate-700 text-slate-300 hover:bg-slate-800/50">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Team Status */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  Team Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map(collab => (
                  <div key={collab.id} className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-lg">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={collab.avatar} alt={collab.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {collab.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-900 ${
                        collab.status === 'online' ? 'bg-green-500' :
                        collab.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{collab.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                          {collab.role}
                        </Badge>
                        <StatusBadge status={collab.status} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3 border-slate-700 text-slate-300 hover:bg-slate-800/50">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Collaborator
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
            <div className="text-sm text-slate-400">
              {filteredFiles.length} files
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map(file => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-900/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <FileIcon type={file.type} className={`h-10 w-10 ${getFileTypeColor(file.type)}`} />
                        <div className="space-y-1">
                          <h3 className="font-semibold text-white text-sm">{file.name}</h3>
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <span>v{file.version}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>

                    {file.description && (
                      <p className="text-xs text-slate-400 mt-2">{file.description}</p>
                    )}

                    {file.waveformData && (
                      <div className="mt-3 p-2 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Headphones className="h-3 w-3" />
                            <span>{Math.floor((file.duration || 0) / 60)}:{String((file.duration || 0) % 60).padStart(2, '0')}</span>
                            {file.bpm && <span>• {file.bpm} BPM</span>}
                            {file.key && <span>• {file.key}</span>}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setPlayingFile(playingFile === file.id ? null : file.id)}
                            className="p-1"
                          >
                            {playingFile === file.id ? 
                              <Pause className="h-3 w-3 text-purple-400" /> : 
                              <Play className="h-3 w-3 text-purple-400" />
                            }
                          </Button>
                        </div>
                        <AudioWaveform waveformData={file.waveformData} className="h-8" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-3">
                      {file.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs bg-slate-800/50 text-slate-300 border-slate-600">
                          {tag}
                        </Badge>
                      ))}
                      {file.isLocked && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>by {file.uploadedBy}</span>
                      <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 border-slate-700 text-slate-300">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                        <History className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Project Tasks</h3>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="space-y-4">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-white">{task.title}</h3>
                          <Badge className={`text-xs ${
                            task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {task.priority}
                          </Badge>
                          <Badge className={`text-xs ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            task.status === 'review' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span>Created by {task.createdBy}</span>
                          {task.dueDate && <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.assignedTo.map(userId => {
                            const collaborator = collaborators.find(c => c.id === userId)
                            return collaborator ? (
                              <Avatar key={userId} className="h-6 w-6">
                                <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                  {collaborator.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ) : null
                          })}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collaborators" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Team Members</h3>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {collaborators.map(collaborator => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl">
                            {collaborator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-slate-900 ${
                          collaborator.status === 'online' ? 'bg-green-500' :
                          collaborator.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-white">{collaborator.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${
                            collaborator.role === 'owner' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            collaborator.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {collaborator.role}
                          </Badge>
                          <StatusBadge status={collaborator.status} />
                        </div>
                        <div className="space-y-1 text-xs text-slate-400">
                          <p>Last seen {collaborator.lastSeen}</p>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>Contribution: {collaborator.contributionScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-white">Permissions</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(collaborator.permissions).map(([key, value]) => (
                          <div key={key} className={`flex items-center space-x-1 ${value ? 'text-green-400' : 'text-red-400'}`}>
                            {value ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Project Activity</h3>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          </div>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 p-4">
                  {activity.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.userAvatar} alt={item.userName} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {item.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-sm">
                          <span className="font-medium text-white">{item.userName}</span>
                          <span className="text-slate-400 ml-1">{item.action}</span>
                        </div>
                        <p className="text-sm text-slate-300">{item.details}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                            {item.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}