import { ExternalLink, Mail, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface VenueData {
  id: string
  name: string
  type: string
  location: string
  capacity: number
  rating: number
  reviewCount: number
  description: string
  amenities: string[]
  contactEmail: string
  contactPhone: string
  website: string
  socialMedia: {
    instagram: string
    twitter: string
    facebook: string
  }
}

export function VenueOverview({ venue }: { venue: VenueData }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-[#1a1d29] border-0 text-white">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 leading-relaxed">{venue.description}</p>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="outline"
                    className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-0 text-white">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-md bg-[#0f1117] flex items-center justify-center">
              <MapPin className="h-12 w-12 text-white/20" />
              <p className="ml-2 text-white/60">Map would be displayed here</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Google Maps
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#1a1d29] border-0 text-white">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-white/80">{venue.contactEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium">Phone</h4>
                <p className="text-white/80">{venue.contactPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium">Website</h4>
                <p className="text-white/80">{venue.website}</p>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h4 className="font-medium mb-2">Social Media</h4>
              <div className="space-y-2 text-white/80">
                <p>Instagram: {venue.socialMedia.instagram}</p>
                <p>Twitter: {venue.socialMedia.twitter}</p>
                <p>Facebook: {venue.socialMedia.facebook}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d29] border-0 text-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Book This Venue</Button>
            <Button variant="outline" className="w-full border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
              Request Technical Specs
            </Button>
            <Button variant="outline" className="w-full border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
              Schedule a Tour
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
