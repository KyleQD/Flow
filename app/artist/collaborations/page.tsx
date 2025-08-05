'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Calendar, 
  Star,
  TrendingUp,
  Eye,
  Briefcase,
  Music
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { 
  ArtistJob, 
  CollaborationApplication,
  CreateJobFormData,
  CreateCollaborationApplicationFormData 
} from '@/types/artist-jobs'
import { ArtistJobsService } from '@/lib/services/artist-jobs.service'
import { 
  CollaborationPostForm, 
  CollaborationFeed, 
  CollaborationDetail 
} from '@/components/collaborations'

export default function CollaborationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('browse')
  const [myCollaborations, setMyCollaborations] = useState<ArtistJob[]>([])
  const [myApplications, setMyApplications] = useState<CollaborationApplication[]>([])
  const [stats, setStats] = useState({
    posted: 0,
    active: 0,
    applications_received: 0,
    applications_sent: 0
  })
  const [selectedCollaboration, setSelectedCollaboration] = useState<ArtistJob | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadMyCollaborations()
      loadMyApplications()
      loadStats()
    }
  }, [user])

  const loadMyCollaborations = async () => {
    if (!user) return
    try {
      const collaborations = await ArtistJobsService.getUserCollaborations(user.id)
      setMyCollaborations(collaborations)
    } catch (error) {
      console.error('Error loading collaborations:', error)
    }
  }

  const loadMyApplications = async () => {
    if (!user) return
    try {
      const applications = await ArtistJobsService.getUserCollaborationApplications(user.id)
      setMyApplications(applications)
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const loadStats = async () => {
    if (!user) return
    try {
      const collaborationStats = await ArtistJobsService.getCollaborationStats(user.id)
      setStats(collaborationStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleCreateCollaboration = async (data: CreateJobFormData) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      await ArtistJobsService.createCollaboration(data, user.id)
      setShowCreateDialog(false)
      loadMyCollaborations()
      loadStats()
    } catch (error) {
      console.error('Error creating collaboration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyToCollaboration = async (applicationData: CreateCollaborationApplicationFormData) => {
    if (!user) return
    
    try {
      await ArtistJobsService.applyToCollaboration(applicationData, user.id)
      loadMyApplications()
      loadStats()
    } catch (error) {
      console.error('Error applying to collaboration:', error)
    }
  }

  const handleSaveCollaboration = async (collaborationId: string) => {
    if (!user) return
    
    try {
      await ArtistJobsService.saveJob(collaborationId, user.id)
      // Refresh data
    } catch (error) {
      console.error('Error saving collaboration:', error)
    }
  }

  const handleUnsaveCollaboration = async (collaborationId: string) => {
    if (!user) return
    
    try {
      await ArtistJobsService.unsaveJob(collaborationId, user.id)
      // Refresh data
    } catch (error) {
      console.error('Error unsaving collaboration:', error)
    }
  }

  const statisticsCards = [
    {
      title: "Posted",
      value: stats.posted,
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
      description: "Collaborations you've posted"
    },
    {
      title: "Active",
      value: stats.active,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      description: "Currently open collaborations"
    },
    {
      title: "Applications Received",
      value: stats.applications_received,
      icon: MessageCircle,
      color: "from-purple-500 to-pink-500",
      description: "People interested in your collaborations"
    },
    {
      title: "Applications Sent",
      value: stats.applications_sent,
      icon: Users,
      color: "from-orange-500 to-red-500",
      description: "Collaborations you've applied to"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))] opacity-60" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4">
            Collaboration Hub
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Connect with fellow artists, find creative partners, and bring your musical visions to life together.
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statisticsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 17 } }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/30 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                      <p className="text-slate-500 text-xs mt-1">{stat.description}</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-r",
                      stat.color
                    )}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 rounded-xl p-1">
                <TabsTrigger 
                  value="browse" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <Music className="h-4 w-4 mr-2" />
                  Browse Collaborations
                </TabsTrigger>
                <TabsTrigger 
                  value="my-posts" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  My Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="applications" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  My Applications
                </TabsTrigger>
              </TabsList>

              {(activeTab === 'browse' || activeTab === 'my-posts') && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Collaboration
                </Button>
              )}
            </div>

            <TabsContent value="browse" className="space-y-6">
              <CollaborationFeed
                onCollaborationClick={setSelectedCollaboration}
                onApply={handleApplyToCollaboration}
                onSave={handleSaveCollaboration}
                onUnsave={handleUnsaveCollaboration}
                userId={user?.id}
              />
            </TabsContent>

            <TabsContent value="my-posts" className="space-y-6">
              <div className="grid gap-6">
                {myCollaborations.length > 0 ? (
                  myCollaborations.map((collaboration) => (
                    <motion.div
                      key={collaboration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 17 } }}
                    >
                      <Card 
                        className="bg-slate-800/50 backdrop-blur-xl border-slate-700/30 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedCollaboration(collaboration)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white">{collaboration.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={collaboration.status === 'open' ? 'default' : 'secondary'}>
                                  {collaboration.status}
                                </Badge>
                                {collaboration.featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{collaboration.views_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{collaboration.applications_count}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-300 text-sm line-clamp-2 mb-4">
                            {collaboration.description}
                          </p>
                          
                          {collaboration.instruments_needed && collaboration.instruments_needed.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {collaboration.instruments_needed.slice(0, 3).map((instrument) => (
                                <Badge key={instrument} variant="outline" className="text-xs">
                                  {instrument}
                                </Badge>
                              ))}
                              {collaboration.instruments_needed.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{collaboration.instruments_needed.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/30">
                    <CardContent className="text-center py-12">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No Collaborations Posted
                      </h3>
                      <p className="text-slate-400 mb-4">
                        Start building your creative network by posting your first collaboration.
                      </p>
                      <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Collaboration
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <div className="grid gap-6">
                {myApplications.length > 0 ? (
                  myApplications.map((application) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 17 } }}
                    >
                      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/30 hover:bg-slate-800/70 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-white mb-1">
                                {application.job_title || 'Collaboration Application'}
                              </h3>
                              <p className="text-sm text-slate-400">
                                Applied {application.time_since_applied || 'recently'}
                              </p>
                            </div>
                            <Badge variant={
                              application.status === 'accepted' ? 'default' :
                              application.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {application.status}
                            </Badge>
                          </div>
                          
                          {application.message && (
                            <p className="text-slate-300 text-sm mb-4">
                              {application.message}
                            </p>
                          )}
                          
                          {application.response_message && (
                            <div className="bg-slate-700/50 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Response:</p>
                              <p className="text-sm text-slate-300">{application.response_message}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/30">
                    <CardContent className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No Applications Yet
                      </h3>
                      <p className="text-slate-400 mb-4">
                        Browse collaborations and apply to projects that interest you.
                      </p>
                      <Button
                        onClick={() => setActiveTab('browse')}
                        variant="outline"
                      >
                        Browse Collaborations
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Create Collaboration Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Collaboration</DialogTitle>
          </DialogHeader>
          <CollaborationPostForm
            onSubmit={handleCreateCollaboration}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Collaboration Detail Dialog */}
      {selectedCollaboration && (
        <Dialog open={!!selectedCollaboration} onOpenChange={() => setSelectedCollaboration(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <CollaborationDetail
              collaboration={selectedCollaboration}
              userId={user?.id}
              onApply={handleApplyToCollaboration}
              onSave={handleSaveCollaboration}
              onUnsave={handleUnsaveCollaboration}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}