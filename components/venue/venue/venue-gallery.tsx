"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

interface VenueGalleryProps {
  venue: any
}

export function VenueGallery({ venue }: VenueGalleryProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-400" /> Venue Gallery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {venue.gallery.map((item: any) => (
            <motion.div key={item.id} whileHover={{ scale: 1.03 }} className="overflow-hidden rounded-lg">
              <img
                src={item.url || "/placeholder.svg"}
                alt={item.alt}
                className="w-full h-48 object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            </motion.div>
          ))}
        </div>

        {venue.isOwner && (
          <Button className="w-full mt-4">
            <ImageIcon className="h-4 w-4 mr-2" /> Manage Gallery
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
