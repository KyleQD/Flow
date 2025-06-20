"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, Mail, Phone, Instagram, Facebook, Twitter, Youtube, 
  Apple, Music, Calendar, MapPin, ExternalLink, Play, Download, Share2 
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

function ModernTemplate({ data }: { data: EPKData }) {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'facebook': return <Facebook className="h-4 w-4" />
      case 'twitter': return <Twitter className="h-4 w-4" />
      case 'youtube': return <Youtube className="h-4 w-4" />
      case 'spotify': return <Music className="h-4 w-4" />
      case 'apple': return <Apple className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto bg-white text-gray-900 overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-96">
        {data.coverUrl ? (
          <img 
            src={data.coverUrl} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end p-8">
          <div className="flex items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage src={data.avatarUrl} />
              <AvatarFallback className="text-2xl">{data.artistName[0]}</AvatarFallback>
            </Avatar>
            
            <div className="text-white mb-4">
              <h1 className="text-5xl font-bold mb-2">{data.artistName}</h1>
              <p className="text-xl opacity-90">{data.genre} • {data.location}</p>
              
              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.stats.followers.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.stats.monthlyListeners.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Monthly Listeners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.stats.totalStreams.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Total Streams</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="ml-auto mb-4 flex gap-3">
            <Button className="bg-white text-black hover:bg-gray-100">
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-lg leading-relaxed text-gray-700">{data.bio}</p>
            </section>
            
            {/* Music */}
            {data.music.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Latest Music</h2>
                <div className="space-y-4">
                  {data.music.map((track) => (
                    <div key={track.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                        {track.coverArt ? (
                          <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Music className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{track.title}</h3>
                        <p className="text-sm text-gray-600">
                          Released {track.releaseDate} • {track.streams.toLocaleString()} streams
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Listen
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Photos */}
            {data.photos.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {data.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square">
                      <img 
                        src={photo.url} 
                        alt={photo.caption} 
                        className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Press */}
            {data.press.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Press & Media</h2>
                <div className="space-y-4">
                  {data.press.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge variant="secondary">{item.outlet}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{item.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{item.date}</span>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{data.contact.email}</span>
                  </div>
                )}
                {data.contact.bookingEmail && (
                  <div>
                    <div className="text-sm font-medium mb-1">Booking</div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{data.contact.bookingEmail}</span>
                    </div>
                  </div>
                )}
                {data.contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{data.contact.phone}</span>
                  </div>
                )}
                {data.contact.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a href={data.contact.website} className="text-sm text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Social Media */}
            {data.social.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Follow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.social.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        className="flex items-center gap-3 text-sm hover:text-blue-600 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon(link.platform)}
                        <span>{link.username || link.platform}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Upcoming Shows */}
            {data.upcomingShows.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Shows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.upcomingShows.map((show) => (
                      <div key={show.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{show.venue}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {show.location}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {show.date}
                            </div>
                          </div>
                          {show.ticketUrl && (
                            <Button size="sm" variant="outline">
                              Tickets
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EPKPreview({ data, template = "modern" }: EPKPreviewProps) {
  if (!data.artistName) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-gray-400">
          <Music className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Start Building Your EPK</h2>
          <p>Add your artist information to see the preview</p>
        </div>
      </div>
    )
  }

  switch (template) {
    case "modern":
      return <ModernTemplate data={data} />
    case "classic":
      // TODO: Implement classic template
      return <ModernTemplate data={data} />
    case "minimal":
      // TODO: Implement minimal template
      return <ModernTemplate data={data} />
    case "bold":
      // TODO: Implement bold template
      return <ModernTemplate data={data} />
    default:
      return <ModernTemplate data={data} />
  }
} 