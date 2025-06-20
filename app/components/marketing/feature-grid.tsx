"use client"

import { motion } from "framer-motion"
import {
  Music2,
  Calendar,
  Users,
  MessageSquare,
  Radio,
  Headphones,
  Map,
  TrendingUp,
  Star,
  Settings,
} from "lucide-react"

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

interface FeatureGridProps {
  className?: string
}

export function FeatureGrid({ className = "" }: FeatureGridProps) {
  const features: Feature[] = [
    {
      title: "Music Management",
      description: "Upload, organize, and share your tracks and playlists with your audience.",
      icon: <Music2 className="h-6 w-6" />,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Event Planning",
      description: "Schedule and manage your gigs, tours, and festivals with ease.",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Network Building",
      description: "Connect with other artists, venues, and industry professionals.",
      icon: <Users className="h-6 w-6" />,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Messaging",
      description: "Communicate with your team and collaborators in real-time.",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      title: "Radio Station",
      description: "Host your own radio shows and reach a global audience.",
      icon: <Radio className="h-6 w-6" />,
      color: "bg-red-500/10 text-red-500",
    },
    {
      title: "Equipment Management",
      description: "Track and maintain your gear inventory and technical specs.",
      icon: <Headphones className="h-6 w-6" />,
      color: "bg-indigo-500/10 text-indigo-500",
    },
    {
      title: "Tour Mapping",
      description: "Plan and optimize your tour routes with interactive maps.",
      icon: <Map className="h-6 w-6" />,
      color: "bg-teal-500/10 text-teal-500",
    },
    {
      title: "Analytics",
      description: "Track your performance and audience engagement metrics.",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Reviews & Ratings",
      description: "Build your reputation with verified reviews from clients.",
      icon: <Star className="h-6 w-6" />,
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      title: "Customization",
      description: "Personalize your experience with advanced settings and preferences.",
      icon: <Settings className="h-6 w-6" />,
      color: "bg-gray-500/10 text-gray-500",
    },
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900 p-6 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className={`rounded-lg p-3 ${feature.color}`}>{feature.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-gray-400">{feature.description}</p>
            </div>
          </div>
          <div className="absolute inset-0 border border-purple-500/0 group-hover:border-purple-500/50 rounded-lg transition-colors" />
        </motion.div>
      ))}
    </div>
  )
} 