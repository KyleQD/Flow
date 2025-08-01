"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, Mail, Phone, Instagram, Facebook, Twitter, Youtube, 
  Apple, Music, Calendar, MapPin, ExternalLink, Play, Download, Share2, 
  Sparkles, Zap, Star, TrendingUp, Heart, Headphones
} from "lucide-react"

interface EPKData {
  artistName: string
  bio: string
  genre: string
  location: string
  avatarUrl: string
  coverUrl: string
  theme: string
  template: string
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
  }
  social: {
    id: string
    platform: string
    url: string
    username: string
  }[]
  upcomingShows: {
    id: string
    date: string
    venue: string
    location: string
    ticketUrl: string
    status: string
  }[]
}

interface EPKPreviewProps {
  data: EPKData
  template?: string
}

// Shared utility functions
const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram className="h-5 w-5" />
    case 'facebook': return <Facebook className="h-5 w-5" />
    case 'twitter': return <Twitter className="h-5 w-5" />
    case 'youtube': return <Youtube className="h-5 w-5" />
    case 'spotify': return <Music className="h-5 w-5" />
    case 'apple': return <Apple className="h-5 w-5" />
    default: return <Globe className="h-5 w-5" />
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

// Modern Template - Glassmorphism & Gradients
function ModernTemplate({ data }: { data: EPKData }) {
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Glassmorphism container */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-12 mb-8">
            <div className="text-center mb-12">
              {/* Avatar with glow effect */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-75 animate-pulse"></div>
                <Avatar className="relative h-40 w-40 border-4 border-white/30 shadow-xl">
                  <AvatarImage src={data.avatarUrl} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    {data.artistName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Artist name with gradient text */}
              <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
                {data.artistName}
              </h1>
              
              <div className="flex items-center justify-center gap-3 mb-8">
                <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 px-4 py-2 text-lg">
                  {data.genre}
                </Badge>
                <span className="text-xl text-white/70">•</span>
                <span className="text-xl text-white/90 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {data.location}
                </span>
              </div>

              {/* Stats with animation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  { icon: Heart, label: 'Followers', value: data.stats.followers },
                  { icon: Headphones, label: 'Monthly Listeners', value: data.stats.monthlyListeners },
                  { icon: TrendingUp, label: 'Total Streams', value: data.stats.totalStreams }
                ].map((stat, index) => (
                  <div key={stat.label} className="group cursor-pointer">
                    <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                      <stat.icon className="h-8 w-8 mx-auto mb-3 text-purple-300 group-hover:text-pink-300 transition-colors" />
                      <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        {formatNumber(stat.value)}
                      </div>
                      <div className="text-white/70 text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-105">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Content sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* About section */}
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-purple-400" />
                About
              </h2>
              <p className="text-white/90 leading-relaxed text-lg">{data.bio}</p>
            </div>

            {/* Latest music */}
            {data.music.length > 0 && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Music className="h-8 w-8 text-purple-400" />
                  Latest Music
                </h2>
                <div className="space-y-4">
                  {data.music.slice(0, 3).map((track) => (
                    <div 
                      key={track.id} 
                      className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                        hoveredTrack === track.id 
                          ? 'bg-white/20 scale-[1.02]' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onMouseEnter={() => setHoveredTrack(track.id)}
                      onMouseLeave={() => setHoveredTrack(null)}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden">
                        {track.coverArt ? (
                          <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors">{track.title}</h3>
                        <p className="text-white/70 text-sm">
                          {formatNumber(track.streams)} streams
                        </p>
                      </div>
                      <Button size="sm" className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border-purple-400/30">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming shows */}
            {data.upcomingShows.length > 0 && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 lg:col-span-2">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-400" />
                  Upcoming Shows
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.upcomingShows.map((show) => (
                    <div key={show.id} className="group bg-white/5 hover:bg-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl text-white group-hover:text-purple-200 transition-colors">{show.venue}</h3>
                          <p className="text-white/70 flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {show.location}
                          </p>
                          <p className="text-white/70 flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(show.date).toLocaleDateString()}
                          </p>
                        </div>
                        {show.ticketUrl && (
                          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                            Tickets
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {data.social.length > 0 && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Globe className="h-8 w-8 text-purple-400" />
                  Connect
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {data.social.map((link) => (
                    <Button
                      key={link.id}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 justify-start gap-3 p-4 h-auto rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-105"
                    >
                      {getSocialIcon(link.platform)}
                      <span className="font-medium">{link.platform}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Classic Template - Elegant & Refined
function ClassicTemplate({ data }: { data: EPKData }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover image or gradient */}
        <div className="h-96 bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 relative overflow-hidden">
          {data.coverUrl && (
            <img src={data.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Elegant overlay pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
        </div>

        {/* Profile section */}
        <div className="relative -mt-20 px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={data.avatarUrl} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    {data.artistName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-5xl font-serif font-bold text-gray-900 mb-3">{data.artistName}</h1>
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 text-base font-medium">
                      {data.genre}
                    </Badge>
                    <span className="text-gray-600 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {data.location}
                    </span>
                  </div>
                  
                  {/* Elegant stats */}
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { label: 'Followers', value: data.stats.followers },
                      { label: 'Monthly Listeners', value: data.stats.monthlyListeners },
                      { label: 'Total Streams', value: data.stats.totalStreams }
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatNumber(stat.value)}
                        </div>
                        <div className="text-sm text-gray-600 uppercase tracking-wide">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3">
                    <Mail className="h-5 w-5 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 border-b-2 border-amber-200 pb-3">
                Biography
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{data.bio}</p>
              </div>
            </section>

            {/* Music */}
            {data.music.length > 0 && (
              <section>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 border-b-2 border-amber-200 pb-3">
                  Featured Music
                </h2>
                <div className="grid gap-4">
                  {data.music.map((track) => (
                    <div key={track.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center overflow-hidden">
                          {track.coverArt ? (
                            <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{track.title}</h3>
                          <p className="text-gray-600">
                            {formatNumber(track.streams)} streams • Released {track.releaseDate}
                          </p>
                        </div>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                          <Play className="h-4 w-4 mr-2" />
                          Listen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming shows */}
            {data.upcomingShows.length > 0 && (
              <Card className="border-2 border-amber-100">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif text-gray-900 flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-amber-600" />
                    Upcoming Shows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {data.upcomingShows.map((show) => (
                      <div key={show.id} className="border-b border-amber-100 pb-4 last:border-b-0">
                        <h3 className="font-semibold text-gray-900 mb-2">{show.venue}</h3>
                        <p className="text-gray-600 text-sm flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4" />
                          {show.location}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4" />
                          {new Date(show.date).toLocaleDateString()}
                        </p>
                        {show.ticketUrl && (
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white w-full">
                            Get Tickets
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact & Social */}
            <Card className="border-2 border-amber-100">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-gray-900">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.social.map((link) => (
                    <Button
                      key={link.id}
                      variant="outline"
                      className="w-full justify-start gap-3 border-amber-200 text-gray-700 hover:bg-amber-50"
                    >
                      {getSocialIcon(link.platform)}
                      <span>{link.platform}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Minimal Template - Clean & Futuristic
function MinimalTemplate({ data }: { data: EPKData }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero section */}
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Minimalist avatar */}
          <div className="relative mb-12">
            <div className="w-48 h-48 mx-auto relative">
              <div className="absolute inset-0 border border-white/20 rounded-full"></div>
              <div className="absolute inset-2 border border-white/10 rounded-full"></div>
              <Avatar className="w-full h-full border-0">
                <AvatarImage src={data.avatarUrl} className="object-cover" />
                <AvatarFallback className="text-6xl bg-transparent text-white">
                  {data.artistName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Typography-focused name */}
          <h1 className="text-8xl font-light tracking-widest text-white mb-8 leading-none">
            {data.artistName.toUpperCase()}
          </h1>

          {/* Minimal details */}
          <div className="space-y-4 mb-16">
            <p className="text-2xl font-light text-white/70 tracking-wide">{data.genre}</p>
            <p className="text-lg text-white/50 tracking-wider">{data.location}</p>
          </div>

          {/* Clean stats */}
          <div className="grid grid-cols-3 gap-16 mb-16">
            {[
              { label: 'FOLLOWERS', value: data.stats.followers },
              { label: 'MONTHLY', value: data.stats.monthlyListeners },
              { label: 'STREAMS', value: data.stats.totalStreams }
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="text-4xl font-light mb-3 group-hover:text-white/80 transition-colors">
                  {formatNumber(stat.value)}
                </div>
                <div className="text-xs text-white/40 tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Minimal buttons */}
          <div className="flex gap-8 justify-center">
            <Button className="bg-transparent border border-white/30 text-white hover:bg-white hover:text-black px-12 py-4 text-lg font-light tracking-wide">
              CONTACT
            </Button>
            <Button className="bg-white text-black hover:bg-white/90 px-12 py-4 text-lg font-light tracking-wide">
              SHARE
            </Button>
          </div>
        </div>
      </div>

      {/* Content sections with minimal spacing */}
      <div className="max-w-6xl mx-auto px-8 py-24 space-y-32">
        {/* About */}
        <section className="text-center">
          <h2 className="text-6xl font-light tracking-widest text-white/80 mb-16">ABOUT</h2>
          <p className="text-xl leading-relaxed text-white/70 max-w-4xl mx-auto font-light">
            {data.bio}
          </p>
        </section>

        {/* Music */}
        {data.music.length > 0 && (
          <section>
            <h2 className="text-6xl font-light tracking-widest text-white/80 mb-16 text-center">MUSIC</h2>
            <div className="space-y-8">
              {data.music.map((track, index) => (
                <div key={track.id} className="group border-t border-white/10 pt-8 hover:border-white/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <span className="text-4xl font-light text-white/30 group-hover:text-white/50 transition-colors w-16">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-2xl font-light tracking-wide group-hover:text-white/80 transition-colors">
                          {track.title}
                        </h3>
                        <p className="text-white/40 mt-1">{formatNumber(track.streams)} streams</p>
                      </div>
                    </div>
                    <Button className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Shows */}
        {data.upcomingShows.length > 0 && (
          <section>
            <h2 className="text-6xl font-light tracking-widest text-white/80 mb-16 text-center">SHOWS</h2>
            <div className="space-y-8">
              {data.upcomingShows.map((show) => (
                <div key={show.id} className="group border-t border-white/10 pt-8 hover:border-white/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-light tracking-wide group-hover:text-white/80 transition-colors">
                        {show.venue}
                      </h3>
                      <p className="text-white/40 mt-1">{show.location}</p>
                      <p className="text-white/40 text-sm">{new Date(show.date).toLocaleDateString()}</p>
                    </div>
                    {show.ticketUrl && (
                      <Button className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black">
                        TICKETS
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// Bold Template - Dynamic & Colorful
function BoldTemplate({ data }: { data: EPKData }) {
  const gradients = [
    'from-red-500 to-orange-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-blue-500',
    'from-yellow-500 to-red-500'
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Dynamic hero with animated background */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-yellow-600 to-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center px-8">
          {/* Bold avatar with multiple rings */}
          <div className="relative mb-12">
            <div className="absolute inset-0 animate-spin-slow">
              <div className="w-64 h-64 mx-auto border-4 border-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
            <div className="absolute inset-4 animate-spin-slow" style={{animationDirection: 'reverse'}}>
              <div className="w-56 h-56 mx-auto border-2 border-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            </div>
            <Avatar className="relative w-48 h-48 mx-auto border-4 border-white">
              <AvatarImage src={data.avatarUrl} className="object-cover" />
              <AvatarFallback className="text-6xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                {data.artistName[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Explosive title */}
          <h1 className="text-9xl font-black mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent leading-none transform hover:scale-105 transition-transform duration-300">
            {data.artistName.toUpperCase()}
          </h1>

          {/* Colorful badges */}
          <div className="flex justify-center gap-4 mb-12">
            <Badge className={`bg-gradient-to-r ${gradients[0]} text-white px-8 py-3 text-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110`}>
              {data.genre}
            </Badge>
            <Badge className={`bg-gradient-to-r ${gradients[1]} text-white px-8 py-3 text-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110`}>
              {data.location}
            </Badge>
          </div>

          {/* Dynamic stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { label: 'FOLLOWERS', value: data.stats.followers, gradient: gradients[0], icon: Heart },
              { label: 'MONTHLY LISTENERS', value: data.stats.monthlyListeners, gradient: gradients[2], icon: Headphones },
              { label: 'TOTAL STREAMS', value: data.stats.totalStreams, gradient: gradients[4], icon: TrendingUp }
            ].map((stat, index) => (
              <div key={stat.label} className="group cursor-pointer">
                <div className={`bg-gradient-to-r ${stat.gradient} p-8 rounded-3xl shadow-2xl hover:shadow-4xl transition-all duration-300 hover:scale-110 hover:-rotate-2`}>
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-white" />
                  <div className="text-5xl font-black text-white mb-2">
                    {formatNumber(stat.value)}
                  </div>
                  <div className="text-white/90 font-bold tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bold action buttons */}
          <div className="flex gap-6 justify-center">
            <Button className={`bg-gradient-to-r ${gradients[0]} hover:from-red-600 hover:to-orange-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 transform hover:-rotate-1`}>
              <Mail className="h-6 w-6 mr-3" />
              CONTACT ME
            </Button>
            <Button className={`bg-gradient-to-r ${gradients[1]} hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 transform hover:rotate-1`}>
              <Share2 className="h-6 w-6 mr-3" />
              SHARE
            </Button>
          </div>
        </div>
      </div>

      {/* Content with bold cards */}
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* About */}
          <div className={`bg-gradient-to-br ${gradients[0]} p-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]`}>
            <h2 className="text-5xl font-black text-white mb-8 flex items-center gap-4">
              <Zap className="h-12 w-12" />
              ABOUT
            </h2>
            <p className="text-xl text-white/90 leading-relaxed font-medium">{data.bio}</p>
          </div>

          {/* Music */}
          {data.music.length > 0 && (
            <div className={`bg-gradient-to-br ${gradients[2]} p-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]`}>
              <h2 className="text-5xl font-black text-white mb-8 flex items-center gap-4">
                <Music className="h-12 w-12" />
                MUSIC
              </h2>
              <div className="space-y-6">
                {data.music.slice(0, 3).map((track) => (
                  <div key={track.id} className="bg-white/20 backdrop-blur-md rounded-2xl p-6 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{track.title}</h3>
                        <p className="text-white/80">{formatNumber(track.streams)} streams</p>
                      </div>
                      <Button className="bg-white/20 hover:bg-white/40 text-white border-0 rounded-xl">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shows */}
          {data.upcomingShows.length > 0 && (
            <div className={`bg-gradient-to-br ${gradients[3]} p-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] lg:col-span-2`}>
              <h2 className="text-5xl font-black text-white mb-8 flex items-center gap-4">
                <Star className="h-12 w-12" />
                UPCOMING SHOWS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.upcomingShows.map((show) => (
                  <div key={show.id} className="bg-white/20 backdrop-blur-md rounded-2xl p-8 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                    <h3 className="text-3xl font-bold text-white mb-2">{show.venue}</h3>
                    <p className="text-white/80 text-lg mb-1">{show.location}</p>
                    <p className="text-white/80 text-lg mb-6">{new Date(show.date).toLocaleDateString()}</p>
                    {show.ticketUrl && (
                      <Button className="bg-white text-black hover:bg-white/90 font-bold px-8 py-3 rounded-xl w-full">
                        GET TICKETS
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default function EPKPreview({ data, template = "modern" }: EPKPreviewProps) {
  if (!data.artistName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-20 animate-pulse"></div>
            <Music className="relative h-24 w-24 mx-auto text-white/40" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white/80">Start Building Your EPK</h2>
          <p className="text-lg text-white/60">Add your artist information to see the preview</p>
        </div>
      </div>
    )
  }

  switch (template) {
    case "modern":
      return <ModernTemplate data={data} />
    case "classic":
      return <ClassicTemplate data={data} />
    case "minimal":
      return <MinimalTemplate data={data} />
    case "bold":
      return <BoldTemplate data={data} />
    default:
      return <ModernTemplate data={data} />
  }
} 