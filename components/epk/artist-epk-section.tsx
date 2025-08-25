"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  Image,
  Music,
  Video,
  ExternalLink,
  Calendar,
  Award,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe
} from "lucide-react"

interface ArtistEPKSectionProps {
  profile: {
    id: string
    artist_name: string
    profile_data: {
      artist_name?: string
      bio?: string
      genre?: string
      genres?: string[]
      location?: string
      website?: string
      contact_email?: string
      phone?: string
      record_label?: string
      experience_years?: string
      notable_performances?: string
      awards?: string
      booking_rate?: string
    }
    avatar_url?: string
    stats: {
      followers: number
      streams?: number
      monthly_listeners?: number
      events?: number
    }
    social_links?: any
    created_at: string
  }
}

export function ArtistEPKSection({ profile }: ArtistEPKSectionProps) {
  const artistName = profile.profile_data?.artist_name || profile.artist_name
  const genres = profile.profile_data?.genres || (profile.profile_data?.genre ? [profile.profile_data.genre] : [])

  const handleDownloadEPK = () => {
    // This would generate and download a PDF EPK
    console.log('Downloading EPK for', artistName)
  }

  return (
    <Card className="bg-white/5 backdrop-blur border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Electronic Press Kit (EPK)
          </CardTitle>
          <Button 
            onClick={handleDownloadEPK}
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Download EPK
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Artist Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Artist Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-white/70">
                <Users className="h-4 w-4 text-purple-400" />
                <span><strong>Artist:</strong> {artistName}</span>
              </div>
              {genres.length > 0 && (
                <div className="flex items-center gap-3 text-white/70">
                  <Music className="h-4 w-4 text-purple-400" />
                  <span><strong>Genre:</strong> {genres.join(', ')}</span>
                </div>
              )}
              {profile.profile_data?.location && (
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span><strong>Location:</strong> {profile.profile_data.location}</span>
                </div>
              )}
              {profile.profile_data?.record_label && (
                <div className="flex items-center gap-3 text-white/70">
                  <Award className="h-4 w-4 text-purple-400" />
                  <span><strong>Label:</strong> {profile.profile_data.record_label}</span>
                </div>
              )}
              {profile.profile_data?.experience_years && (
                <div className="flex items-center gap-3 text-white/70">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span><strong>Experience:</strong> {profile.profile_data.experience_years} years</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            <div className="space-y-3 text-sm">
              {profile.profile_data?.contact_email && (
                <div className="flex items-center gap-3 text-white/70">
                  <Mail className="h-4 w-4 text-purple-400" />
                  <a 
                    href={`mailto:${profile.profile_data.contact_email}`}
                    className="hover:text-white transition-colors"
                  >
                    {profile.profile_data.contact_email}
                  </a>
                </div>
              )}
              {profile.profile_data?.phone && (
                <div className="flex items-center gap-3 text-white/70">
                  <Phone className="h-4 w-4 text-purple-400" />
                  <a 
                    href={`tel:${profile.profile_data.phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {profile.profile_data.phone}
                  </a>
                </div>
              )}
              {profile.profile_data?.website && (
                <div className="flex items-center gap-3 text-white/70">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <a 
                    href={profile.profile_data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {profile.profile_data.website}
                  </a>
                </div>
              )}
              {profile.profile_data?.booking_rate && (
                <div className="flex items-center gap-3 text-white/70">
                  <span><strong>Booking Rate:</strong> {profile.profile_data.booking_rate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.profile_data?.bio && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Biography</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {profile.profile_data.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{profile.stats.followers.toLocaleString()}</div>
              <div className="text-xs text-white/60">Followers</div>
            </div>
            {profile.stats.streams && (
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{profile.stats.streams.toLocaleString()}</div>
                <div className="text-xs text-white/60">Total Streams</div>
              </div>
            )}
            {profile.stats.monthly_listeners && (
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{profile.stats.monthly_listeners.toLocaleString()}</div>
                <div className="text-xs text-white/60">Monthly Listeners</div>
              </div>
            )}
            {profile.stats.events && (
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{profile.stats.events}</div>
                <div className="text-xs text-white/60">Live Events</div>
              </div>
            )}
          </div>
        </div>

        {/* Notable Performances */}
        {profile.profile_data?.notable_performances && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Notable Performances</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {profile.profile_data.notable_performances}
            </p>
          </div>
        )}

        {/* Awards */}
        {profile.profile_data?.awards && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Awards & Recognition</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {profile.profile_data.awards}
            </p>
          </div>
        )}

        {/* Social Media Links */}
        {profile.social_links && Object.keys(profile.social_links).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Social Media & Streaming</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.social_links).map(([platform, url]) => 
                url ? (
                  <Badge
                    key={platform}
                    variant="outline"
                    className="border-white/30 text-white/80 hover:bg-white/10 cursor-pointer"
                    onClick={() => window.open(url as string, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ')}
                  </Badge>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* EPK Assets */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Press Kit Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 justify-start"
            >
              <Image className="h-4 w-4 mr-2" />
              High-Res Photos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 justify-start"
            >
              <Music className="h-4 w-4 mr-2" />
              Audio Samples
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 justify-start"
            >
              <Video className="h-4 w-4 mr-2" />
              Video Content
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
