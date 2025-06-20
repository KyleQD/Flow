"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, FileText, Music } from "lucide-react"

interface VenueSpecsProps {
  venue: any
  expandedSections: Record<string, boolean>
  toggleSection: (section: string) => void
}

export function VenueSpecs({ venue, expandedSections, toggleSection }: VenueSpecsProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("specs")}>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-400" /> Venue Specifications
          </CardTitle>
          {expandedSections.specs ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </CardHeader>
      {expandedSections.specs && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white">Capacity</h3>
                <p className="text-gray-400">{venue.capacity} people</p>
              </div>

              <div>
                <h3 className="font-medium text-white">Sound System</h3>
                <p className="text-gray-400">{venue.specs.soundSystem}</p>
              </div>

              <div>
                <h3 className="font-medium text-white">Lighting</h3>
                <p className="text-gray-400">{venue.specs.lighting}</p>
              </div>

              <div>
                <h3 className="font-medium text-white">Stage</h3>
                <p className="text-gray-400">{venue.specs.stage}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white">Parking</h3>
                <p className="text-gray-400">{venue.specs.parking}</p>
              </div>

              <div>
                <h3 className="font-medium text-white">Accessibility</h3>
                <p className="text-gray-400">{venue.specs.accessibility}</p>
              </div>

              <div>
                <h3 className="font-medium text-white">Bar Service</h3>
                <p className="text-gray-400">{venue.specs.bar}</p>
              </div>

              <div>
                <h3 className="font-medium text-white">Food Service</h3>
                <p className="text-gray-400">{venue.specs.foodService}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="font-medium text-white">Technical Documents</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" /> Stage Plot
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" /> Technical Rider
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" /> Floor Plan
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
