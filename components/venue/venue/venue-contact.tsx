import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Mail, MapPin, MessageSquare, Phone } from "lucide-react"

interface VenueContactProps {
  venue: any
}

export function VenueContact({ venue }: VenueContactProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-400" /> Location & Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-white">Address</h3>
          <p className="text-gray-400">{venue.address}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-white">Booking Contact</h3>
            <div className="flex items-center mt-2">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <a href={`mailto:${venue.bookingContact.email}`} className="text-purple-400 hover:underline">
                {venue.bookingContact.email}
              </a>
            </div>
            <div className="flex items-center mt-2">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <a href={`tel:${venue.bookingContact.phone}`} className="text-purple-400 hover:underline">
                {venue.bookingContact.phone}
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-white">Website</h3>
            <div className="flex items-center mt-2">
              <Globe className="h-4 w-4 text-gray-400 mr-2" />
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                {venue.website}
              </a>
            </div>
          </div>
        </div>

        <Button className="bg-purple-600 hover:bg-purple-700">
          <MessageSquare className="h-4 w-4 mr-2" /> Contact Venue
        </Button>
      </CardContent>
    </Card>
  )
}
