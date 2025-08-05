"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Globe, Music, Image, Newspaper } from "lucide-react"
import { generateEPKPDF } from "@/utils/pdf"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Link as LinkIcon } from "lucide-react"

interface EPKData {
  artistName: string
  bio: string
  genre: string
  location: string
  stats: {
    followers: number
    monthlyListeners: number
    totalStreams: number
    eventsPlayed: number
  }
  music: {
    title: string
    url: string
    releaseDate: string
    streams: number
  }[]
  photos: string[]
  press: {
    title: string
    url: string
    date: string
    outlet: string
  }[]
  contact: {
    email: string
    phone: string
    website: string
    bookingEmail: string
    managementEmail: string
  }
  social: {
    platform: string
    url: string
  }[]
  upcomingShows: {
    date: string
    venue: string
    location: string
    ticketUrl: string
  }[]
  avatarUrl?: string
}

export default function PublicEPKPage({ params }: { params: Promise<{ slug: string }> }) {
  // TODO: Fetch EPK data from Supabase based on slug
  const [epkData, setEpkData] = React.useState<EPKData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [slug, setSlug] = React.useState<string>("")

  React.useEffect(() => {
    // Get the slug from params
    params.then(({ slug }) => {
      setSlug(slug)
      // TODO: Implement data fetching
      setLoading(false)
    })
  }, [params])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/4"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!epkData) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-white">EPK Not Found</h1>
        <p className="text-gray-400 mt-2">The requested EPK could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex flex-col items-center mb-6">
                  {epkData.avatarUrl && (
                    <img src={epkData.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-800 mb-2" />
                  )}
                </div>
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://example.com/avatar.jpg" />
                  <AvatarFallback>{epkData.artistName[0]}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h1 className="text-2xl font-bold">{epkData.artistName}</h1>
                  <p className="text-muted-foreground">{epkData.genre} • {epkData.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{epkData.stats.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{epkData.stats.monthlyListeners.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Monthly Listeners</div>
                  </div>
                </div>
                <div className="w-full">
                  {generateEPKPDF(epkData)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div>{epkData.contact.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Booking</div>
                  <div>{epkData.contact.bookingEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Management</div>
                  <div>{epkData.contact.managementEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div>{epkData.contact.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Website</div>
                  <a href={epkData.contact.website} className="text-primary hover:underline">
                    {epkData.contact.website}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Social Media</h2>
              <div className="space-y-2">
                {epkData.social.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {link.platform}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 space-y-8">
          {/* Bio */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Biography</h2>
              <p className="whitespace-pre-line">{epkData.bio}</p>
            </CardContent>
          </Card>

          {/* Music */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Music className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Music</h2>
              </div>
              <div className="space-y-4">
                {epkData.music.map((track) => (
                  <div key={track.title} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Released: {track.releaseDate} • {track.streams.toLocaleString()} streams
                      </div>
                    </div>
                    <a href={track.url} className="text-primary hover:underline">
                      Listen
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Shows */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Upcoming Shows</h2>
              </div>
              <div className="space-y-4">
                {epkData.upcomingShows.map((show) => (
                  <div key={show.date} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{show.venue}</div>
                      <div className="text-sm text-muted-foreground">
                        {show.date} • {show.location}
                      </div>
                    </div>
                    <a href={show.ticketUrl} className="text-primary hover:underline">
                      Get Tickets
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Press */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Press Coverage</h2>
              </div>
              <div className="space-y-4">
                {epkData.press.map((item) => (
                  <div key={item.title} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.outlet} • {item.date}
                      </div>
                    </div>
                    <a href={item.url} className="text-primary hover:underline">
                      Read Article
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Photos</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {epkData.photos.map((photo, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={photo}
                      alt={`${epkData.artistName} photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 