"use client"

import { useState, useEffect } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { format, addDays } from "date-fns"
import { 
  Users, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Settings,
  Share2,
  FileText,
  Target,
  Folder,
  MessageSquare,
  Video
} from "lucide-react"
import Link from "next/link"

interface TeamMember {
  id?: string
  name: string
  email: string
  role: string
  avatar?: string
  status: 'active' | 'pending' | 'inactive'
  skills: string[]
  joined_at?: string
}

interface Project {
  id?: string
  name: string
  description: string
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date: string
  end_date?: string
  team_members: string[]
  progress: number
  tasks_completed: number
  tasks_total: number
  type: 'song' | 'album' | 'video' | 'marketing' | 'event' | 'other'
  created_at?: string
}

const PROJECT_TYPES = [
  { value: 'song', label: 'Song Production' },
  { value: 'album', label: 'Album Creation' },
  { value: 'video', label: 'Music Video' },
  { value: 'marketing', label: 'Marketing Campaign' },
  { value: 'event', label: 'Event Planning' },
  { value: 'other', label: 'Other' }
]

const ROLES = [
  'Producer', 'Sound Engineer', 'Songwriter', 'Manager', 'Marketing Specialist',
  'Graphic Designer', 'Video Editor', 'Photographer', 'Social Media Manager', 'Other'
]

export default function CollaborationPage() {
  const { user } = useArtist()
  const supabase = createClientComponentClient()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  
  const [projectForm, setProjectForm] = useState<Project>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    team_members: [],
    progress: 0,
    tasks_completed: 0,
    tasks_total: 0,
    type: 'song'
  })

  const [memberForm, setMemberForm] = useState<TeamMember>({
    name: '',
    email: '',
    role: '',
    status: 'pending',
    skills: []
  })

  useEffect(() => {
    if (user) {
      loadCollaborationData()
    }
  }, [user])

  const loadCollaborationData = async () => {
    try {
      setIsLoading(true)
      
      // Mock data - in real app, load from Supabase
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'New Single Production',
          description: 'Recording and producing our next single release',
          status: 'in_progress',
          priority: 'high',
          start_date: '2024-01-15',
          end_date: '2024-02-28',
          team_members: ['producer-1', 'engineer-1'],
          progress: 65,
          tasks_completed: 13,
          tasks_total: 20,
          type: 'song',
          created_at: '2024-01-10T00:00:00Z'
        },
        {
          id: '2',
          name: 'Music Video Shoot',
          description: 'Creating music video for upcoming single',
          status: 'planning',
          priority: 'medium',
          start_date: '2024-02-01',
          end_date: '2024-02-15',
          team_members: ['director-1', 'camera-1'],
          progress: 25,
          tasks_completed: 3,
          tasks_total: 12,
          type: 'video',
          created_at: '2024-01-20T00:00:00Z'
        }
      ]

      const mockTeamMembers: TeamMember[] = [
        {
          id: 'producer-1',
          name: 'Alex Johnson',
          email: 'alex@studio.com',
          role: 'Producer',
          status: 'active',
          skills: ['Music Production', 'Mixing', 'Mastering'],
          joined_at: '2023-06-15T00:00:00Z'
        },
        {
          id: 'engineer-1',
          name: 'Sarah Chen',
          email: 'sarah@audio.com',
          role: 'Sound Engineer',
          status: 'active',
          skills: ['Recording', 'Audio Engineering', 'Studio Setup'],
          joined_at: '2023-08-20T00:00:00Z'
        },
        {
          id: 'director-1',
          name: 'Mike Rodriguez',
          email: 'mike@visual.com',
          role: 'Video Director',
          status: 'pending',
          skills: ['Directing', 'Cinematography', 'Post-Production'],
          joined_at: '2024-01-01T00:00:00Z'
        }
      ]

      setProjects(mockProjects)
      setTeamMembers(mockTeamMembers)
    } catch (error) {
      console.error('Error loading collaboration data:', error)
      toast.error('Failed to load collaboration data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) {
      toast.error('Please enter a project name')
      return
    }

    try {
      const newProject: Project = {
        ...projectForm,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      
      setProjects(prev => [newProject, ...prev])
      setShowCreateProject(false)
      setProjectForm({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        team_members: [],
        progress: 0,
        tasks_completed: 0,
        tasks_total: 0,
        type: 'song'
      })
      
      toast.success('Project created successfully!')
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  const handleInviteMember = async () => {
    if (!memberForm.name.trim() || !memberForm.email.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const newMember: TeamMember = {
        ...memberForm,
        id: Date.now().toString(),
        joined_at: new Date().toISOString()
      }
      
      setTeamMembers(prev => [newMember, ...prev])
      setShowInviteMember(false)
      setMemberForm({
        name: '',
        email: '',
        role: '',
        status: 'pending',
        skills: []
      })
      
      toast.success('Team member invited successfully!')
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error('Failed to invite team member')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-600/20 text-blue-300'
      case 'in_progress': return 'bg-yellow-600/20 text-yellow-300'
      case 'review': return 'bg-purple-600/20 text-purple-300'
      case 'completed': return 'bg-green-600/20 text-green-300'
      case 'cancelled': return 'bg-red-600/20 text-red-300'
      case 'active': return 'bg-green-600/20 text-green-300'
      case 'pending': return 'bg-yellow-600/20 text-yellow-300'
      case 'inactive': return 'bg-gray-600/20 text-gray-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600/20 text-red-300'
      case 'high': return 'bg-orange-600/20 text-orange-300'
      case 'medium': return 'bg-yellow-600/20 text-yellow-300'
      case 'low': return 'bg-green-600/20 text-green-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artist/business">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Business
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Team Collaboration</h1>
              <p className="text-gray-400">Manage projects and team members</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowInviteMember(true)} variant="outline" className="border-slate-700">
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
          <Button onClick={() => setShowCreateProject(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Projects</p>
                <p className="text-2xl font-bold text-white">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <Folder className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Team Members</p>
                <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-white">
                  {projects.reduce((sum, p) => sum + p.tasks_completed, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-white">Active Projects</h2>
          
          {projects.map((project) => (
            <Card key={project.id} className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-600/20 text-blue-300">
                        {PROJECT_TYPES.find(t => t.value === project.type)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Tasks: {project.tasks_completed}/{project.tasks_total}
                    </span>
                    <span className="text-gray-400">
                      Due: {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'No deadline'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Team:</span>
                    <div className="flex -space-x-2">
                      {project.team_members.slice(0, 3).map((memberId) => {
                        const member = teamMembers.find(m => m.id === memberId)
                        return (
                          <Avatar key={memberId} className="w-6 h-6 border-2 border-slate-800">
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {member?.name.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )
                      })}
                      {project.team_members.length > 3 && (
                        <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs text-gray-300">
                          +{project.team_members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Team Members</h2>
          
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <Card key={member.id} className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white">{member.name}</h3>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">{member.role}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                      
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.slice(0, 2).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs bg-slate-800 text-gray-300">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-slate-800 text-gray-300">
                              +{member.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Project</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Project Name</Label>
              <Input
                value={projectForm.name}
                onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Project name..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Type</Label>
                <Select 
                  value={projectForm.type}
                  onValueChange={(value) => setProjectForm(prev => ({ ...prev, type: value as Project['type'] }))}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Priority</Label>
                <Select 
                  value={projectForm.priority}
                  onValueChange={(value) => setProjectForm(prev => ({ ...prev, priority: value as Project['priority'] }))}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Start Date</Label>
                <Input
                  type="date"
                  value={projectForm.start_date}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">End Date</Label>
                <Input
                  type="date"
                  value={projectForm.end_date || ''}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} className="bg-indigo-600 hover:bg-indigo-700">
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Member Modal */}
      <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Invite Team Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Name</Label>
              <Input
                value={memberForm.name}
                onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Role</Label>
              <Select 
                value={memberForm.role}
                onValueChange={(value) => setMemberForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowInviteMember(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember} className="bg-purple-600 hover:bg-purple-700">
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 