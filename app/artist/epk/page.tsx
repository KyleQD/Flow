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
  Camera, FileText, Calendar, Users, TrendingUp, Star, CheckCircle, Play
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import EPKPreview from "@/components/epk/epk-preview"
import MusicSection from "@/components/epk/music-section"
import SocialSection from "@/components/epk/social-section"
import ShowsSection from "@/components/epk/shows-section"
import ContactSection from "@/components/epk/contact-section"

interface EPKData {
  artistName: string
  bio: string
  genre: string
  location: string
  avatarUrl: string
  coverUrl: string
  theme: string
  template: string
  isPublic: boolean
  stats: {
    followers: number
    monthlyListeners: number
    totalStreams: number
    eventsPlayed: number
  }
  music: {
    id: string
    title: string
    url: string
    releaseDate: string
    streams: number
    coverArt: string
    platform: string
    featured?: boolean
  }[]
  photos: {
    id: string
    url: string
    caption: string
    isHero: boolean
  }[]
  press: {
    id: string
    title: string
    url: string
    date: string
    outlet: string
    excerpt: string
  }[]
  contact: {
    email: string
    phone: string
    website: string
    bookingEmail: string
    managementEmail: string
    address?: string
    businessName?: string
    timezone?: string
    availability?: string
    preferredContact?: 'email' | 'phone'
    verified: {
      email: boolean
      phone: boolean
      website: boolean
    }
  }
  social: {
    id: string
    platform: string
    url: string
    username: string
    verified?: boolean
    followers?: number
  }[]
  upcomingShows: {
    id: string
    date: string
    venue: string
    location: string
    ticketUrl: string
    status: 'upcoming' | 'completed' | 'cancelled'
    capacity?: number
    attendance?: number
    setLength?: number
    notes?: string
    poster?: string
    featured?: boolean
  }[]
  customDomain: string
  seoTitle: string
  seoDescription: string
}

// Quick Action Sidebar Component
function QuickActions({ onPreview, onShare, onDownload }: { 
  onPreview: () => void
  onShare: () => void 
  onDownload: () => void
}) {
  return (
    <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a] sticky top-4">
      <CardHeader>
        <CardTitle className="text-base text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onPreview}
          className="w-full rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          <Eye className="h-4 w-4 mr-2" />
          Live Preview
        </Button>
        <Button 
          onClick={onShare}
          variant="outline" 
          className="w-full rounded-lg bg-[#23263a] border-0 text-white hover:bg-purple-600/80 transition"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share EPK
        </Button>
        <Button 
          onClick={onDownload}
          variant="outline" 
          className="w-full rounded-lg bg-[#23263a] border-0 text-white hover:bg-purple-600/80 transition"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </CardContent>
    </Card>
  )
}

// Enhanced Stats Overview Component
function StatsOverview({ stats, epkData }: { 
  stats: EPKData['stats']
  epkData: EPKData 
}) {
  const totalSocialFollowers = epkData.social.reduce((total, link) => total + (link.followers || 0), 0)
  const totalShows = epkData.upcomingShows.length
  const totalStreams = epkData.music.reduce((total, track) => total + track.streams, 0)

  return (
    <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
      <CardHeader>
        <CardTitle className="text-base text-white flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-500" />
          Performance Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-[#23263a] rounded-lg">
            <div className="text-xl font-bold text-white">
              {stats.monthlyListeners > 0 ? `${stats.monthlyListeners.toLocaleString()}K` : '0'}
            </div>
            <div className="text-xs text-gray-400">Monthly Listeners</div>
          </div>
          <div className="text-center p-2 bg-[#23263a] rounded-lg">
            <div className="text-xl font-bold text-white">
              {totalSocialFollowers > 0 ? totalSocialFollowers.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-gray-400">Social Followers</div>
          </div>
          <div className="text-center p-2 bg-[#23263a] rounded-lg">
            <div className="text-xl font-bold text-white">
              {totalStreams > 0 ? `${Math.round(totalStreams / 1000)}K` : '0'}
            </div>
            <div className="text-xs text-gray-400">Total Streams</div>
          </div>
          <div className="text-center p-2 bg-[#23263a] rounded-lg">
            <div className="text-xl font-bold text-white">{totalShows}</div>
            <div className="text-xs text-gray-400">Total Shows</div>
          </div>
        </div>
        
        {/* Quick Import Button */}
        <Button 
          size="sm" 
          variant="outline"
          className="w-full mt-3 border-gray-700 text-white text-xs"
          onClick={() => {
            // TODO: Implement profile data import
          }}
        >
          Import from Profile
        </Button>
      </CardContent>
    </Card>
  )
}

// Enhanced Template Selector Component with Visual Previews
function TemplateSelector({ selectedTemplate, onTemplateChange, epkData }: {
  selectedTemplate: string
  onTemplateChange: (template: string) => void
  epkData: EPKData
}) {
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string>('')

  const templates = [
    { 
      id: 'modern', 
      name: 'Modern', 
      description: 'Sleek gradients with premium aesthetics',
      colors: ['from-indigo-600', 'via-purple-600', 'to-pink-600'],
      textColor: 'text-white',
      accent: 'border-purple-400',
      style: 'premium-gradient'
    },
    { 
      id: 'black', 
      name: 'Black', 
      description: 'Pure black with neon accents',
      colors: ['from-black', 'via-gray-900', 'to-black'],
      textColor: 'text-white',
      accent: 'border-green-400',
      style: 'cyberpunk'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      description: 'Clean monochrome with subtle depth',
      colors: ['from-gray-50', 'via-white', 'to-gray-100'],
      textColor: 'text-gray-900',
      accent: 'border-gray-300',
      style: 'clean'
    },
    { 
      id: 'neon', 
      name: 'Neon', 
      description: 'Electric blue with vibrant highlights',
      colors: ['from-blue-900', 'via-cyan-800', 'to-teal-700'],
      textColor: 'text-white',
      accent: 'border-cyan-400',
      style: 'electric'
    },
    { 
      id: 'sunset', 
      name: 'Sunset', 
      description: 'Warm orange to pink transitions',
      colors: ['from-orange-500', 'via-pink-500', 'to-purple-600'],
      textColor: 'text-white',
      accent: 'border-orange-400',
      style: 'warm'
    }
  ]

  const handlePreviewClick = (templateId: string) => {
    setPreviewTemplate(templateId)
    setShowPreviewModal(true)
  }

  return (
    <>
      <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Layout className="h-4 w-4 text-purple-500" />
            EPK Template
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Choose your EPK's visual style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="space-y-2">
              {/* Template Preview Card */}
              <div
                className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedTemplate === template.id 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => onTemplateChange(template.id)}
              >
                {/* Enhanced Mini EPK Preview */}
                <div className={`h-24 bg-gradient-to-br ${template.colors.join(' ')} rounded-lg p-3 mb-3 relative overflow-hidden shadow-lg`}>
                  {/* Special effects for different styles */}
                  {template.style === 'cyberpunk' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-transparent to-green-400/10"></div>
                  )}
                  {template.style === 'electric' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-transparent to-cyan-400/20"></div>
                  )}
                  
                  {/* Modern header simulation */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      template.id === 'minimal' ? 'bg-gray-600 border-gray-400' : 
                      template.id === 'black' ? 'bg-black border-green-400' :
                      'bg-white/20 border-white/40'
                    } shadow-md`}></div>
                    <div className={`h-2 w-20 rounded-full ${
                      template.id === 'minimal' ? 'bg-gray-600' : 
                      template.id === 'black' ? 'bg-green-400/80' :
                      'bg-white/40'
                    } shadow-sm`}></div>
                  </div>
                  
                  {/* Enhanced content lines */}
                  <div className="space-y-1">
                    <div className={`h-1.5 w-24 rounded-full ${
                      template.id === 'minimal' ? 'bg-gray-500' : 
                      template.id === 'black' ? 'bg-green-400/60' :
                      'bg-white/30'
                    } shadow-sm`}></div>
                    <div className={`h-1 w-16 rounded-full ${
                      template.id === 'minimal' ? 'bg-gray-400' : 
                      template.id === 'black' ? 'bg-green-400/40' :
                      'bg-white/25'
                    }`}></div>
                    <div className={`h-1 w-14 rounded-full ${
                      template.id === 'minimal' ? 'bg-gray-400' : 
                      template.id === 'black' ? 'bg-green-400/40' :
                      'bg-white/25'
                    }`}></div>
                  </div>
                  
                  {/* Accent elements */}
                  <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ${
                    template.id === 'minimal' ? 'bg-gray-600' :
                    template.id === 'black' ? 'bg-green-400' :
                    template.id === 'neon' ? 'bg-cyan-400' :
                    template.id === 'sunset' ? 'bg-orange-400' :
                    'bg-purple-400'
                  } shadow-lg`}></div>
                  
                  {/* Selected indicator */}
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-purple-400 drop-shadow-lg" />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium text-sm">{template.name}</h4>
                    <p className="text-gray-400 text-xs">{template.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviewClick(template.id)
                    }}
                    className="text-gray-400 hover:text-white p-1 h-auto"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-700">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-gray-700 text-white text-xs"
              onClick={() => handlePreviewClick(selectedTemplate)}
            >
              <Eye className="h-3 w-3 mr-2" />
              Preview Current Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Template Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-br from-[#191c24] to-[#23263a] text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Template Preview: {templates.find(t => t.id === previewTemplate)?.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    See how your EPK will look with this template
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onTemplateChange(previewTemplate)
                      setShowPreviewModal(false)
                    }}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Select Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPreviewModal(false)}
                    className="border-gray-700 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TemplatePreview template={previewTemplate} epkData={epkData} />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Template Preview Component
function TemplatePreview({ template, epkData }: {
  template: string
  epkData: EPKData
}) {
  const getTemplateStyles = (templateId: string) => {
    switch (templateId) {
      case 'modern':
        return {
          bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
          cardBg: 'bg-white/5 backdrop-blur-xl border border-white/10',
          textPrimary: 'text-white',
          textSecondary: 'text-purple-200',
          accent: 'text-purple-400',
          border: 'border-purple-400/20',
          shadow: 'shadow-2xl shadow-purple-500/10'
        }
      case 'black':
        return {
          bg: 'bg-black',
          cardBg: 'bg-gray-900/80 backdrop-blur-xl border border-green-400/20',
          textPrimary: 'text-white',
          textSecondary: 'text-gray-300',
          accent: 'text-green-400',
          border: 'border-green-400/30',
          shadow: 'shadow-2xl shadow-green-400/20',
          glow: 'shadow-lg shadow-green-400/30'
        }
      case 'minimal':
        return {
          bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
          cardBg: 'bg-white/90 backdrop-blur-sm border border-gray-200/50',
          textPrimary: 'text-gray-900',
          textSecondary: 'text-gray-600',
          accent: 'text-gray-800',
          border: 'border-gray-200',
          shadow: 'shadow-xl shadow-gray-200/50'
        }
      case 'neon':
        return {
          bg: 'bg-gradient-to-br from-blue-950 via-cyan-900 to-teal-900',
          cardBg: 'bg-black/40 backdrop-blur-xl border border-cyan-400/20',
          textPrimary: 'text-white',
          textSecondary: 'text-cyan-200',
          accent: 'text-cyan-400',
          border: 'border-cyan-400/30',
          shadow: 'shadow-2xl shadow-cyan-400/20',
          glow: 'shadow-lg shadow-cyan-400/30'
        }
      case 'sunset':
        return {
          bg: 'bg-gradient-to-br from-orange-900 via-pink-900 to-purple-900',
          cardBg: 'bg-black/30 backdrop-blur-xl border border-orange-400/20',
          textPrimary: 'text-white',
          textSecondary: 'text-orange-200',
          accent: 'text-orange-400',
          border: 'border-orange-400/30',
          shadow: 'shadow-2xl shadow-orange-400/20'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-indigo-900 to-purple-900',
          cardBg: 'bg-white/10 backdrop-blur-xl',
          textPrimary: 'text-white',
          textSecondary: 'text-purple-200',
          accent: 'text-purple-400',
          border: 'border-purple-400/30',
          shadow: 'shadow-2xl shadow-purple-500/10'
        }
    }
  }

  const styles = getTemplateStyles(template)

  return (
    <div className={`min-h-[600px] p-8 ${styles.bg}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Enhanced Header with Modern Design */}
        <div className={`${styles.cardBg} ${styles.shadow} rounded-2xl p-8 relative overflow-hidden`}>
          {/* Background effects for special templates */}
          {template === 'black' && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-transparent to-green-400/5"></div>
          )}
          {template === 'neon' && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-cyan-400/10"></div>
          )}
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className={`w-20 h-20 rounded-2xl ${
                template === 'black' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                template === 'neon' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
                template === 'sunset' ? 'bg-gradient-to-br from-orange-400 to-pink-500' :
                'bg-gradient-to-br from-purple-500 to-pink-500'
              } flex items-center justify-center shadow-xl ${
                template === 'black' ? 'shadow-green-400/30' :
                template === 'neon' ? 'shadow-cyan-400/30' :
                'shadow-purple-500/30'
              }`}>
                <span className="text-white font-bold text-2xl">
                  {epkData.artistName ? epkData.artistName[0] : 'A'}
                </span>
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${styles.textPrimary} mb-1`}>
                  {epkData.artistName || 'Artist Name'}
                </h1>
                <p className={`${styles.textSecondary} text-lg`}>
                  {epkData.genre || 'Genre'} • {epkData.location || 'Location'}
                </p>
              </div>
            </div>
            <p className={`${styles.textSecondary} leading-relaxed text-lg`}>
              {epkData.bio || 'Artist biography will appear here. This is where you can share your musical journey, influences, and what makes your sound unique.'}
            </p>
          </div>
        </div>

        {/* Enhanced Stats with Modern Design */}
        <div className={`${styles.cardBg} ${styles.shadow} rounded-2xl p-8`}>
          <h3 className={`text-xl font-bold ${styles.textPrimary} mb-6 flex items-center gap-2`}>
            <TrendingUp className={`h-5 w-5 ${styles.accent}`} />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`text-center p-4 rounded-xl ${
              template === 'minimal' ? 'bg-gray-100' : 'bg-black/20'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${styles.accent} mb-1 ${
                template === 'black' ? styles.glow : ''
              }`}>
                {epkData.stats?.monthlyListeners || 0}K
              </div>
              <div className={`text-sm ${styles.textSecondary} font-medium`}>Monthly Listeners</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${
              template === 'minimal' ? 'bg-gray-100' : 'bg-black/20'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${styles.accent} mb-1 ${
                template === 'black' ? styles.glow : ''
              }`}>
                {epkData.social.reduce((total, link) => total + (link.followers || 0), 0).toLocaleString()}
              </div>
              <div className={`text-sm ${styles.textSecondary} font-medium`}>Followers</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${
              template === 'minimal' ? 'bg-gray-100' : 'bg-black/20'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${styles.accent} mb-1 ${
                template === 'black' ? styles.glow : ''
              }`}>
                {epkData.music.length}
              </div>
              <div className={`text-sm ${styles.textSecondary} font-medium`}>Releases</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${
              template === 'minimal' ? 'bg-gray-100' : 'bg-black/20'
            } backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${styles.accent} mb-1 ${
                template === 'black' ? styles.glow : ''
              }`}>
                {epkData.upcomingShows.length}
              </div>
              <div className={`text-sm ${styles.textSecondary} font-medium`}>Shows</div>
            </div>
          </div>
        </div>

        {/* Enhanced Music & Social Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${styles.cardBg} ${styles.shadow} rounded-2xl p-8`}>
            <h3 className={`text-xl font-bold ${styles.textPrimary} mb-6 flex items-center gap-2`}>
              <Music className={`h-5 w-5 ${styles.accent}`} />
              Latest Music
            </h3>
            <div className="space-y-4">
              {(epkData.music.length > 0 ? epkData.music.slice(0, 3) : [
                { title: 'Latest Single', platform: 'Spotify' },
                { title: 'Popular Track', platform: 'Apple Music' },
                { title: 'Fan Favorite', platform: 'SoundCloud' }
              ]).map((track, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-xl ${
                  template === 'minimal' ? 'bg-gray-100' : 'bg-black/20'
                } backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
                  <div>
                    <div className={`font-semibold ${styles.textPrimary} text-lg`}>{track.title}</div>
                    <div className={`text-sm ${styles.textSecondary} font-medium`}>{track.platform}</div>
                  </div>
                  <div className={`${styles.accent} p-2 rounded-lg ${
                    template === 'minimal' ? 'bg-white' : 'bg-white/10'
                  } ${template === 'black' ? styles.glow : ''}`}>
                    <Play className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.cardBg} ${styles.shadow} rounded-2xl p-8`}>
            <h3 className={`text-xl font-bold ${styles.textPrimary} mb-6 flex items-center gap-2`}>
              <Globe className={`h-5 w-5 ${styles.accent}`} />
              Connect
            </h3>
            <div className="space-y-4">
              {(epkData.social.length > 0 ? epkData.social.slice(0, 3) : [
                { platform: 'Instagram', username: '@artist' },
                { platform: 'Spotify', username: 'Artist Profile' },
                { platform: 'YouTube', username: '@artistchannel' }
              ]).map((social, index) => (
                <div key={index} className={`flex items-center gap-4 p-4 rounded-xl ${
                  template === 'minimal' ? 'bg-gray-100' : 'bg-black/20'
                } backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
                  <div className={`w-12 h-12 rounded-xl ${
                    template === 'black' ? 'bg-green-400/20 border border-green-400/30' :
                    template === 'neon' ? 'bg-cyan-400/20 border border-cyan-400/30' :
                    template === 'sunset' ? 'bg-orange-400/20 border border-orange-400/30' :
                    template === 'minimal' ? 'bg-gray-200' :
                    'bg-purple-400/20 border border-purple-400/30'
                  } flex items-center justify-center ${
                    template === 'black' ? styles.glow : ''
                  }`}>
                    <Globe className={`h-5 w-5 ${styles.accent}`} />
                  </div>
                  <div>
                    <div className={`font-semibold ${styles.textPrimary} text-lg`}>{social.platform}</div>
                    <div className={`text-sm ${styles.textSecondary} font-medium`}>{social.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className={`${styles.cardBg} ${styles.border} border rounded-xl p-6`}>
          <h3 className={`text-lg font-semibold ${styles.textPrimary} mb-4`}>Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className={`font-medium ${styles.textPrimary}`}>Email</div>
              <div className={`text-sm ${styles.textSecondary}`}>
                {epkData.contact.email || 'contact@artist.com'}
              </div>
            </div>
            <div>
              <div className={`font-medium ${styles.textPrimary}`}>Booking</div>
              <div className={`text-sm ${styles.textSecondary}`}>
                {epkData.contact.bookingEmail || 'booking@artist.com'}
              </div>
            </div>
            <div>
              <div className={`font-medium ${styles.textPrimary}`}>Website</div>
              <div className={`text-sm ${styles.textSecondary}`}>
                {epkData.contact.website || 'www.artist.com'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EPKPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [epkData, setEpkData] = useState<EPKData>({
    artistName: "",
    bio: "",
    genre: "",
    location: "",
    avatarUrl: "",
    coverUrl: "",
    theme: "dark",
    template: "modern",
    isPublic: false,
    stats: {
      followers: 0,
      monthlyListeners: 0,
      totalStreams: 0,
      eventsPlayed: 0,
    },
    music: [],
    photos: [],
    press: [],
    contact: {
      email: "",
      phone: "",
      website: "",
      bookingEmail: "",
      managementEmail: "",
      verified: {
        email: false,
        phone: false,
        website: false,
      },
    },
    social: [],
    upcomingShows: [],
    customDomain: "",
    seoTitle: "",
    seoDescription: "",
  })

  const [activeTab, setActiveTab] = useState("overview")
  const [previewMode, setPreviewMode] = useState(false)

  const handleSave = async () => {
    try {
      // TODO: Implement save to Supabase
      toast({
        title: "EPK saved successfully",
        description: "Your EPK has been updated and is ready to share.",
      })
    } catch (error) {
      toast({
        title: "Error saving EPK",
        description: "There was an error saving your EPK. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/epk/${epkData.artistName.toLowerCase().replace(/\s+/g, '-')}`
    navigator.clipboard.writeText(url)
    toast({
      title: "EPK URL copied!",
      description: "Share this link to showcase your EPK.",
    })
  }

  const handleDownload = async () => {
    // TODO: Implement PDF generation
    toast({
      title: "Generating PDF...",
      description: "Your EPK PDF will download shortly.",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover' | 'photos') => {
    const files = e.target.files
    if (!files) return

    // TODO: Replace with Supabase upload
    if (type === 'avatar' && files[0]) {
      const url = URL.createObjectURL(files[0])
      setEpkData(prev => ({ ...prev, avatarUrl: url }))
    } else if (type === 'cover' && files[0]) {
      const url = URL.createObjectURL(files[0])
      setEpkData(prev => ({ ...prev, coverUrl: url }))
    } else if (type === 'photos') {
      const urls = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        url: URL.createObjectURL(file),
        caption: "",
        isHero: false
      }))
      setEpkData(prev => ({ ...prev, photos: [...prev.photos, ...urls] }))
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
    <div className="flex min-h-screen bg-[#181b23]">
      {/* Main Content */}
      <main className="flex-1 px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Electronic Press Kit</h1>
            <p className="text-gray-400 mt-1">Create a stunning EPK to showcase your artistry</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave} className="border-gray-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handlePreview} className="bg-purple-600 text-white hover:bg-purple-700">
              <Eye className="h-4 w-4 mr-2" />
              Preview EPK
            </Button>
          </div>
        </div>

        {/* EPK Status */}
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
                  onCheckedChange={(checked) => setEpkData(prev => ({ ...prev, isPublic: checked }))}
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#13151c] border border-gray-800 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="music" className="rounded-lg">Music</TabsTrigger>
            <TabsTrigger value="shows" className="rounded-lg">Shows</TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg">Social</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg">Contact</TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg">Media</TabsTrigger>
            <TabsTrigger value="press" className="rounded-lg">Press</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Hero Section */}
                <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-500" />
                      Hero Section
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <div className="h-32 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {epkData.coverUrl ? (
                          <img src={epkData.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-white">
                            <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm opacity-75">Add cover image</p>
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Upload className="h-6 w-6 text-white" />
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'cover')}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-purple-500">
                          <AvatarImage src={epkData.avatarUrl} />
                          <AvatarFallback>{epkData.artistName[0] || 'A'}</AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = (e) => handleFileUpload(e as any, 'avatar')
                            input.click()
                          }}
                          className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1 hover:bg-purple-700 transition"
                        >
                          <Camera className="h-3 w-3 text-white" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Artist Name"
                          value={epkData.artistName}
                          onChange={(e) => setEpkData(prev => ({ ...prev, artistName: e.target.value }))}
                          className="bg-[#23263a] border-0 text-white text-xl font-semibold"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Genre"
                            value={epkData.genre}
                            onChange={(e) => setEpkData(prev => ({ ...prev, genre: e.target.value }))}
                            className="bg-[#23263a] border-0 text-white text-sm"
                          />
                          <Input
                            placeholder="Location"
                            value={epkData.location}
                            onChange={(e) => setEpkData(prev => ({ ...prev, location: e.target.value }))}
                            className="bg-[#23263a] border-0 text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bio Section */}
                <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      Artist Biography
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Tell your story in a compelling way that captures your artistic journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write your artist biography here... Share your musical journey, influences, achievements, and what makes your sound unique."
                      value={epkData.bio}
                      onChange={(e) => setEpkData(prev => ({ ...prev, bio: e.target.value }))}
                      className="min-h-[200px] bg-[#23263a] border-0 text-white resize-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                      <span>{epkData.bio.length} characters</span>
                      <span>Tip: Aim for 150-300 words</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <StatsOverview stats={epkData.stats} epkData={epkData} />
                <TemplateSelector 
                  selectedTemplate={epkData.template}
                  onTemplateChange={(template) => setEpkData(prev => ({ ...prev, template }))}
                  epkData={epkData}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="music">
            <MusicSection
              tracks={epkData.music}
              onTracksChange={(tracks) => setEpkData(prev => ({ ...prev, music: tracks }))}
            />
          </TabsContent>

          <TabsContent value="shows">
            <ShowsSection
              shows={epkData.upcomingShows}
              onShowsChange={(shows) => setEpkData(prev => ({ ...prev, upcomingShows: shows }))}
            />
          </TabsContent>

          <TabsContent value="social">
            <SocialSection
              socialLinks={epkData.social}
              onSocialLinksChange={(social) => setEpkData(prev => ({ ...prev, social }))}
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
              onContactChange={(contact) => setEpkData(prev => ({ ...prev, contact }))}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center text-gray-400 py-20">
              <Palette className="h-12 w-12 mx-auto mb-4" />
              <p>Settings section coming soon with customization options</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Right Sidebar */}
      <aside className="w-[320px] flex flex-col gap-4 p-4 border-l border-gray-800 bg-[#181b23]">
        <QuickActions 
          onPreview={handlePreview}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      </aside>
    </div>
  )
} 