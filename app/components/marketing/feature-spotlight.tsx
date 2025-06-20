"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Music2, Calendar, Users, Radio, Headphones, Map } from "lucide-react"

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  image: string
}

interface FeatureSpotlightProps {
  className?: string
  autoPlay?: boolean
  interval?: number
}

export function FeatureSpotlight({
  className = "",
  autoPlay = true,
  interval = 5000,
}: FeatureSpotlightProps) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const features: Feature[] = [
    {
      title: "Music Management",
      description:
        "Take control of your music with our comprehensive management tools. Upload tracks, create playlists, and share your music with fans worldwide. Our platform makes it easy to organize your catalog and track performance metrics.",
      icon: <Music2 className="h-6 w-6" />,
      color: "bg-purple-500/10 text-purple-500",
      image: "/images/features/music-management.jpg",
    },
    {
      title: "Event Planning",
      description:
        "Plan and manage your events with precision. From intimate gigs to major festivals, our event planning tools help you handle scheduling, ticketing, and promotion. Keep your team coordinated and your fans informed.",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-500/10 text-blue-500",
      image: "/images/features/event-planning.jpg",
    },
    {
      title: "Network Building",
      description:
        "Connect with industry professionals and grow your network. Find collaborators, venues, and promoters. Our platform helps you build meaningful relationships and expand your reach in the music industry.",
      icon: <Users className="h-6 w-6" />,
      color: "bg-green-500/10 text-green-500",
      image: "/images/features/network-building.jpg",
    },
    {
      title: "Radio Station",
      description:
        "Launch your own radio station and reach listeners worldwide. Schedule shows, manage playlists, and interact with your audience in real-time. Build your brand and grow your following with professional broadcasting tools.",
      icon: <Radio className="h-6 w-6" />,
      color: "bg-red-500/10 text-red-500",
      image: "/images/features/radio-station.jpg",
    },
    {
      title: "Equipment Management",
      description:
        "Keep track of your gear with our equipment management system. Monitor inventory, maintenance schedules, and technical specifications. Ensure your equipment is always performance-ready.",
      icon: <Headphones className="h-6 w-6" />,
      color: "bg-indigo-500/10 text-indigo-500",
      image: "/images/features/equipment-management.jpg",
    },
    {
      title: "Tour Mapping",
      description:
        "Plan your tours efficiently with our mapping tools. Optimize routes, manage venues, and coordinate logistics. Keep your tour running smoothly with comprehensive planning and tracking features.",
      icon: <Map className="h-6 w-6" />,
      color: "bg-teal-500/10 text-teal-500",
      image: "/images/features/tour-mapping.jpg",
    },
  ]

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered) return

    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, features.length, isHovered])

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Feature Navigation */}
        <div className="border-r border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Features</h2>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <Button
                key={feature.title}
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  activeFeature === index
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className={`rounded-lg p-2 ${feature.color}`}>{feature.icon}</div>
                <span>{feature.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Feature Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <Card className="border-0 bg-transparent">
                <CardContent className="space-y-4">
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-800">
                    <img
                      src={features[activeFeature].image}
                      alt={features[activeFeature].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-gray-400">{features[activeFeature].description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar */}
      {autoPlay && !isHovered && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: interval / 1000, ease: "linear" }}
            key={activeFeature}
          />
        </div>
      )}
    </div>
  )
} 