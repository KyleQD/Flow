'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter,
  Video,
  Youtube,
  Linkedin,
  Users,
  Clock,
  Star,
  Calendar,
  Music,
  Wifi,
  Car,
  Accessibility,
  Shield,
  Coffee,
  Utensils,
  Mic,
  Lightbulb,
  Volume2,
  Camera,
  Share2,
  Heart,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  X
} from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

interface VenueProfile {
  id: string
  venue_name: string
  tagline?: string
  description?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  neighborhood?: string
  capacity_standing?: number
  capacity_seated?: number
  capacity_total?: number
  venue_types: string[]
  age_restrictions?: string
  operating_hours?: Record<string, any>
  contact_info?: Record<string, any>
  social_links?: Record<string, any>
  settings?: Record<string, any>
  avatar_url?: string
  cover_image_url?: string
  meta_description?: string
  keywords?: string[]
  is_public: boolean
  profile_completion: number
  created_at: string
  updated_at: string
  stats?: {
    average_rating: number
    total_reviews: number
    monthly_views: number
    upcoming_events: number
  }
  recent_events?: any[]
  reviews?: any[]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function VenueProfilePage() {
  const params = useParams()
  const [venue, setVenue] = useState<VenueProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.slug) {
      fetchVenueProfile(params.slug as string)
    }
  }, [params.slug])

  const fetchVenueProfile = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/venues/${slug}?track_view=true`)
      
      if (!response.ok) {
        throw new Error('Venue not found')
      }

      const data = await response.json()
      setVenue(data.venue)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load venue')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!venue) return

    const shareData = {
      title: venue.venue_name,
      text: venue.tagline || venue.description || `Check out ${venue.venue_name}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "Venue profile link copied to clipboard",
        })
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  const renderAmenities = () => {
    if (!venue?.settings?.amenities) return null

    const amenityIcons: Record<string, any> = {
      sound_system: Volume2,
      lighting_system: Lightbulb,
      stage: Music,
      wifi: Wifi,
      parking: Car,
      accessible: Accessibility,
      security: Shield,
      bar_service: Coffee,
      food_service: Utensils,
      recording_capabilities: Mic,
      photography_services: Camera,
    }

    const amenities = Object.entries(venue.settings.amenities)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => {
        const Icon = amenityIcons[key] || CheckCircle
        return (
          <div key={key} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
            <Icon className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-300 capitalize">
              {key.replace(/_/g, ' ')}
            </span>
          </div>
        )
      })

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {amenities}
      </div>
    )
  }

  const renderOperatingHours = () => {
    if (!venue?.operating_hours) return null

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    return (
      <div className="space-y-2">
        {days.map((day) => {
          const hours = venue.operating_hours?.[day]
          return (
            <div key={day} className="flex justify-between items-center">
              <span className="text-gray-300 capitalize">{day}</span>
              <span className="text-white">
                {hours?.closed ? 'Closed' : `${hours?.open || 'N/A'} - ${hours?.close || 'N/A'}`}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderSocialLinks = () => {
    if (!venue?.social_links) return null

    const socialIcons: Record<string, any> = {
      website: Globe,
      instagram: Instagram,
      facebook: Facebook,
      twitter: Twitter,
      tiktok: TikTok,
      youtube: Youtube,
      linkedin: Linkedin,
    }

    const links = Object.entries(venue.social_links)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([platform, url]) => {
        const Icon = socialIcons[platform] || ExternalLink
        return (
          <a
            key={platform}
            href={url as string}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Icon className="h-5 w-5 text-gray-300" />
          </a>
        )
      })

    return (
      <div className="flex gap-2 flex-wrap">
        {links}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading venue...</div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-2">{error || 'Venue not found'}</div>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Cover Image */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-green-600 to-blue-600">
        {venue.cover_image_url && (
          <img 
            src={venue.cover_image_url} 
            alt={venue.venue_name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-white">
              <AvatarImage src={venue.avatar_url} alt={venue.venue_name} />
              <AvatarFallback className="bg-green-600 text-white text-2xl">
                {venue.venue_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{venue.venue_name}</h1>
              {venue.tagline && (
                <p className="text-lg text-gray-200 mt-1">{venue.tagline}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                {venue.stats && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{venue.stats.average_rating}</span>
                    <span className="text-gray-300">({venue.stats.total_reviews} reviews)</span>
                  </div>
                )}
                <div className="flex gap-1">
                  {venue.venue_types.map((type) => (
                    <Badge key={type} variant="secondary" className="bg-green-600">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {venue.description || 'No description available.'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Venue Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Total Capacity</h4>
                        <p className="text-white">{venue.capacity_total || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Age Restrictions</h4>
                        <p className="text-white">{venue.age_restrictions || 'All ages'}</p>
                      </div>
                      {venue.capacity_standing && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Standing Capacity</h4>
                          <p className="text-white">{venue.capacity_standing}</p>
                        </div>
                      )}
                      {venue.capacity_seated && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Seated Capacity</h4>
                          <p className="text-white">{venue.capacity_seated}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Operating Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderOperatingHours()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Available Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderAmenities()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {venue.recent_events && venue.recent_events.length > 0 ? (
                      <div className="space-y-4">
                        {venue.recent_events.map((event) => (
                          <div key={event.id} className="p-4 bg-gray-700 rounded-lg">
                            <h4 className="font-semibold text-white">{event.title}</h4>
                            <p className="text-gray-300 text-sm mt-1">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.event_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.event_time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No upcoming events.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {venue.reviews && venue.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {venue.reviews.map((review) => (
                          <div key={review.id} className="p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-gray-300 text-sm">
                                {review.reviewer?.username || 'Anonymous'}
                              </span>
                            </div>
                            {review.title && (
                              <h4 className="font-semibold text-white mb-1">{review.title}</h4>
                            )}
                            <p className="text-gray-300 text-sm">{review.comment}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No reviews yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {venue.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-white">{venue.address}</p>
                      <p className="text-gray-400 text-sm">
                        {[venue.city, venue.state, venue.postal_code].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {venue.contact_info?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a href={`tel:${venue.contact_info.phone}`} className="text-white hover:text-green-400">
                      {venue.contact_info.phone}
                    </a>
                  </div>
                )}
                {venue.contact_info?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <a href={`mailto:${venue.contact_info.email}`} className="text-white hover:text-green-400">
                      {venue.contact_info.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                {renderSocialLinks()}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Venue Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {venue.stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-white">{venue.stats.total_reviews}</p>
                      <p className="text-gray-400 text-sm">Reviews</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{venue.stats.monthly_views}</p>
                      <p className="text-gray-400 text-sm">Monthly Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{venue.stats.upcoming_events}</p>
                      <p className="text-gray-400 text-sm">Upcoming Events</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{venue.profile_completion}%</p>
                      <p className="text-gray-400 text-sm">Profile Complete</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 