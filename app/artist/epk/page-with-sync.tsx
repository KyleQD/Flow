"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, Upload, Link, Music, Image as ImageIcon, Newspaper, Mail, Globe, Save, X, 
  Eye, Sparkles, Palette, Layout, Copy, ExternalLink, Download, Share2, 
  Camera, FileText, Calendar, Users, TrendingUp, Star, CheckCircle, Play, Loader2
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useEPKSync } from "@/hooks/use-epk-sync"
import EPKPreview from "@/components/epk/epk-preview"
import MusicSection from "@/components/epk/music-section"
import SocialSection from "@/components/epk/social-section"
import ShowsSection from "@/components/epk/shows-section"
import ContactSection from "@/components/epk/contact-section"

// Quick Action Sidebar Component
function QuickActions({ onAction }: { onAction: (action: string) => void }) {
  const quickActions = [
    { id: 'add-music', label: 'Add Music', icon: Music, color: 'bg-blue-500' },
    { id: 'add-photo', label: 'Add Photo', icon: Camera, color: 'bg-green-500' },
    { id: 'add-show', label: 'Add Show', icon: Calendar, color: 'bg-purple-500' },
    { id: 'add-press', label: 'Add Press', icon: Newspaper, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Quick Actions</h3>
      {quickActions.map((action) => (
        <Button
          key={action.id}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={() => onAction(action.id)}
        >
          <action.icon className="h-4 w-4 mr-3" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}

export default function EPKPageWithSync() {
  const { toast } = useToast()
  const { 
    epkData, 
    isLoading, 
    isSaving, 
    updateEPKData, 
    saveEPKData, 
    syncWithProfile 
  } = useEPKSync()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [previewMode, setPreviewMode] = useState(false)

  // Show loading state
  if (isLoading || !epkData) {
    return (
      <div className="min-h-screen bg-[#181b23] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto text-purple-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading your EPK...</h2>
          <p className="text-gray-400">This might take a moment</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    await saveEPKData()
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
  }

  const handleShare = () => {
    if (!epkData?.artistName) return
    
    const url = `${window.location.origin}/epk/${epkData.artistName.toLowerCase().replace(/\s+/g, '-')}`
    navigator.clipboard.writeText(url)
    toast({
      title: "EPK URL copied!",
      description: "Share this link to showcase your EPK.",
    })
  }

  const handleDownload = async () => {
    toast({
      title: "Generating PDF...",
      description: "Your EPK PDF will download shortly.",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover' | 'photos') => {
    const files = e.target.files
    if (!files) return

    if (type === 'avatar' && files[0]) {
      const url = URL.createObjectURL(files[0])
      updateEPKData({ avatarUrl: url })
    } else if (type === 'cover' && files[0]) {
      const url = URL.createObjectURL(files[0])
      updateEPKData({ coverUrl: url })
    } else if (type === 'photos') {
      const urls = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        url: URL.createObjectURL(file),
        caption: "",
        isHero: false
      }))
      updateEPKData({ 
        photos: [...epkData.photos, ...urls] 
      })
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-music':
        setActiveTab('music')
        break
      case 'add-photo':
        fileInputRef.current?.click()
        break
      case 'add-show':
        setActiveTab('shows')
        break
      case 'add-press':
        setActiveTab('press')
        break
    }
  }

  if (previewMode) {
    return (
      <div className="min-h-screen bg-[#181b23]">
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">EPK Preview</h1>
            <div className="flex gap-3">
              <Button onClick={handleShare} variant="outline" className="border-gray-700 text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Share EPK
              </Button>
              <Button onClick={handlePreview} variant="outline" className="border-gray-700 text-white">
                <X className="h-4 w-4 mr-2" />
                Exit Preview
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <EPKPreview data={epkData} template={epkData.template} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#181b23]">
      <main className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Electronic Press Kit</h1>
            <p className="text-gray-400">Create a professional EPK to showcase your music and connect with industry professionals.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={syncWithProfile} variant="outline" className="border-gray-700 text-white">
              <Link className="h-4 w-4 mr-2" />
              Sync with Profile
            </Button>
            <Button onClick={handlePreview} variant="outline" className="border-gray-700 text-white">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleDownload} variant="outline" className="border-gray-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleShare} variant="outline" className="border-gray-700 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save EPK
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Public Status Card */}
        <Card className="mb-8 rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <span className="text-white font-medium">Public EPK</span>
                </div>
                <Switch 
                  checked={epkData.isPublic}
                  onCheckedChange={(checked) => updateEPKData({ isPublic: checked })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={epkData.isPublic ? "default" : "secondary"} className="bg-purple-600">
                  {epkData.isPublic ? "Live" : "Draft"}
                </Badge>
                {epkData.isPublic && (
                  <Button size="sm" variant="ghost" onClick={handleShare} className="text-purple-400 hover:text-purple-300">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Live
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="music" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Music
                </TabsTrigger>
                <TabsTrigger value="shows" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Shows
                </TabsTrigger>
                <TabsTrigger value="social" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Social
                </TabsTrigger>
                <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Media
                </TabsTrigger>
                <TabsTrigger value="press" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Press
                </TabsTrigger>
                <TabsTrigger value="contact" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Contact
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="artistName" className="text-gray-300 mb-2 block">Artist Name</Label>
                        <Input
                          id="artistName"
                          value={epkData.artistName}
                          onChange={(e) => updateEPKData({ artistName: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Enter your artist name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="genre" className="text-gray-300 mb-2 block">Genre</Label>
                        <Select 
                          value={epkData.genre} 
                          onValueChange={(value) => updateEPKData({ genre: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="hip-hop">Hip Hop</SelectItem>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="country">Country</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="indie">Indie</SelectItem>
                            <SelectItem value="r&b">R&B</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="location" className="text-gray-300 mb-2 block">Location</Label>
                        <Input
                          id="location"
                          value={epkData.location}
                          onChange={(e) => updateEPKData({ location: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="City, Country"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Template Selection */}
                  <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Layout className="h-5 w-5 text-blue-500" />
                        Template & Theme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="template" className="text-gray-300 mb-2 block">Template</Label>
                        <Select 
                          value={epkData.template} 
                          onValueChange={(value) => updateEPKData({ template: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bio Section */}
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      Artist Biography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={epkData.bio}
                      onChange={(e) => updateEPKData({ bio: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                      placeholder="Tell your story in a compelling way that captures your artistic journey, influences, achievements, and what makes your sound unique."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="music">
                <MusicSection
                  tracks={epkData.music}
                  onTracksChange={(tracks) => updateEPKData({ music: tracks })}
                />
              </TabsContent>

              <TabsContent value="shows">
                <ShowsSection
                  shows={epkData.upcomingShows}
                  onShowsChange={(shows) => updateEPKData({ upcomingShows: shows })}
                />
              </TabsContent>

              <TabsContent value="social">
                <SocialSection
                  socialLinks={epkData.social}
                  onSocialLinksChange={(social) => updateEPKData({ social })}
                />
              </TabsContent>

              <TabsContent value="media">
                <div className="text-center text-gray-400 py-20">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Media gallery coming soon with drag & drop</p>
                </div>
              </TabsContent>

              <TabsContent value="press">
                <div className="text-center text-gray-400 py-20">
                  <Newspaper className="h-12 w-12 mx-auto mb-4" />
                  <p>Press section coming soon with media kit features</p>
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <ContactSection
                  contact={epkData.contact}
                  onContactChange={(contact) => updateEPKData({ contact })}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions onAction={handleQuickAction} />
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{epkData.stats.followers.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{epkData.stats.monthlyListeners.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Monthly Listeners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{epkData.stats.totalStreams.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Streams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{epkData.stats.eventsPlayed}</div>
                    <div className="text-sm text-gray-400">Events Played</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e, 'photos')}
          className="hidden"
        />
      </main>
    </div>
  )
} 