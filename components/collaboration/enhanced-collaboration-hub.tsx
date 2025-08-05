"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { resolveAvatarSrc } from "@/lib/utils/avatar-utils"
import { 
  Users, 
  FolderOpen, 
  GitBranch,
  Star,
  Clock,
  MessageSquare,
  Play,
  Upload,
  Zap,
  TrendingUp,
  Heart,
  Share2,
  Plus,
  Bell,
  CheckCircle,
  AlertCircle,
  Music,
  Headphones,
  Mic,
  UserPlus
} from "lucide-react"

interface CollaborationProject {
  id: string
  name: string
  description: string
  status: 'planning' | 'in_progress' | 'recording' | 'mixing' | 'completed'
  progress: number
  collaborators: Array<{
    id: string
    name: string
    avatar: string
    role: string
  }>
  lastActivity: string
  genre: string[]
  dueDate?: string
}

interface CollaborationOpportunity {
  id: string
  title: string
  description: string
  artist: {
    name: string
    avatar: string
    verified: boolean
  }
  instruments: string[]
  genre: string[]
  deadline: string
  applications: number
  isLiked: boolean
  location?: string
}

const mockProjects: CollaborationProject[] = [
  {
    id: "1",
    name: "Midnight Vibes EP",
    description: "Collaborative EP with electronic and jazz fusion elements",
    status: "in_progress",
    progress: 65,
    collaborators: [
      { id: "1", name: "Sarah Chen", avatar: "/avatars/sarah.jpg", role: "Producer" },
      { id: "2", name: "Mike Johnson", avatar: "/avatars/mike.jpg", role: "Vocalist" }
    ],
    lastActivity: "2 hours ago",
    genre: ["Electronic", "Jazz"],
    dueDate: "2024-02-15"
  },
  {
    id: "2", 
    name: "Acoustic Sessions",
    description: "Intimate acoustic recordings for upcoming album",
    status: "planning",
    progress: 20,
    collaborators: [
      { id: "3", name: "Emma Davis", avatar: "/avatars/emma.jpg", role: "Guitarist" }
    ],
    lastActivity: "1 day ago",
    genre: ["Acoustic", "Folk"]
  }
]

const mockOpportunities: CollaborationOpportunity[] = [
  {
    id: "1",
    title: "Looking for Vocalist - R&B Track",
    description: "Need a soulful vocalist for an R&B track I'm producing. Looking for someone with experience in harmonies.",
    artist: { name: "Alex Rodriguez", avatar: "/avatars/alex.jpg", verified: true },
    instruments: ["Vocals", "Harmonies"],
    genre: ["R&B", "Soul"],
    deadline: "2024-01-30",
    applications: 8,
    isLiked: false,
    location: "Los Angeles, CA"
  },
  {
    id: "2",
    title: "Electronic Producer Needed",
    description: "Collaborating on a ambient electronic album. Need someone skilled in sound design and atmospheric production.",
    artist: { name: "Luna Park", avatar: "/avatars/luna.jpg", verified: false },
    instruments: ["Production", "Sound Design"],
    genre: ["Electronic", "Ambient"],
    deadline: "2024-02-10",
    applications: 3,
    isLiked: true,
    location: "Remote"
  }
]

const recentActivity = [
  { type: "project_update", user: "Sarah Chen", action: "uploaded new stems", project: "Midnight Vibes EP", time: "5 min ago" },
  { type: "invitation", user: "Alex Rodriguez", action: "invited you to collaborate", time: "1 hour ago" },
  { type: "application", user: "You", action: "applied to 'Electronic Producer Needed'", time: "3 hours ago" },
  { type: "milestone", user: "Mike Johnson", action: "completed vocal recording", project: "Midnight Vibes EP", time: "5 hours ago" }
]

function ProjectCard({ project }: { project: CollaborationProject }) {
  const statusColors = {
    planning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    recording: "bg-red-500/20 text-red-400 border-red-500/30",
    mixing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30"
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-white">{project.name}</CardTitle>
              <CardDescription className="text-slate-400 text-sm">{project.description}</CardDescription>
            </div>
            <Badge className={`text-xs ${statusColors[project.status]}`}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            {project.genre.map(g => (
              <Badge key={g} variant="outline" className="text-xs bg-slate-800/50 text-slate-300 border-slate-600">
                {g}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-purple-400 font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2 bg-slate-800" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {project.collaborators.map(collab => (
                <Avatar key={collab.id} className="h-8 w-8 border-2 border-slate-900">
                  <AvatarImage src={collab.avatar} alt={collab.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                    {collab.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="h-8 w-8 border-2 border-slate-900 rounded-full bg-slate-700/50 flex items-center justify-center">
                <Plus className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-500">{project.lastActivity}</span>
              <Link href={`/collaboration/projects/${project.id}`}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Open
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function OpportunityCard({ opportunity }: { opportunity: CollaborationOpportunity }) {
  const [isLiked, setIsLiked] = useState(opportunity.isLiked)
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={resolveAvatarSrc(opportunity.artist.avatar)} alt={opportunity.artist.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {opportunity.artist.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white">{opportunity.artist.name}</h3>
                  {opportunity.artist.verified && (
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400">{opportunity.location || "Remote"}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className="p-2"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-white">{opportunity.title}</CardTitle>
            <CardDescription className="text-slate-400 text-sm">{opportunity.description}</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {opportunity.instruments.map(instrument => (
              <Badge key={instrument} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                <Mic className="h-3 w-3 mr-1" />
                {instrument}
              </Badge>
            ))}
            {opportunity.genre.map(genre => (
              <Badge key={genre} variant="outline" className="text-xs bg-slate-800/50 text-slate-300 border-slate-600">
                {genre}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{opportunity.deadline}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{opportunity.applications} applied</span>
              </div>
            </div>
            
            <Link href={`/artist/collaborations/${opportunity.id}`}>
              <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                Apply
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function EnhancedCollaborationHub() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Collaboration Central
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your hub for creative partnerships and project management
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Project
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border-slate-700/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-purple-600">My Projects</TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-purple-600">Opportunities</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Active Projects", value: "2", icon: FolderOpen, color: "purple" },
              { label: "Applications", value: "5", icon: GitBranch, color: "blue" },
              { label: "Collaborators", value: "8", icon: Users, color: "green" },
              { label: "Completed", value: "3", icon: CheckCircle, color: "emerald" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Projects & Opportunities */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                <Link href="/collaboration/projects">
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                    View All →
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {mockProjects.slice(0, 2).map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Hot Opportunities</h3>
                <Link href="/artist/collaborations?tab=browse">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    Browse All →
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {mockOpportunities.slice(0, 2).map(opportunity => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {mockOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {activity.type === 'project_update' && <Upload className="h-4 w-4 text-white" />}
                      {activity.type === 'invitation' && <UserPlus className="h-4 w-4 text-white" />}
                      {activity.type === 'application' && <GitBranch className="h-4 w-4 text-white" />}
                      {activity.type === 'milestone' && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                        {activity.project && <span className="text-purple-400 ml-1">"{activity.project}"</span>}
                      </p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}