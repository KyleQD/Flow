"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Globe, 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings,
  Play,
  ArrowRight,
  CheckCircle
} from "lucide-react"

interface PlatformOverviewStepProps {
  onNext: () => void
}

const features = [
  {
    icon: Globe,
    title: "Tour Management",
    description: "Create and manage multi-city tours with comprehensive planning tools",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20"
  },
  {
    icon: Calendar,
    title: "Event Scheduling",
    description: "Schedule shows, travel days, and rest periods with drag-and-drop ease",
    color: "text-green-400",
    bgColor: "bg-green-500/20"
  },
  {
    icon: Users,
    title: "Team Coordination",
    description: "Manage crew, artists, and staff assignments with real-time updates",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20"
  },
  {
    icon: DollarSign,
    title: "Budget Tracking",
    description: "Monitor expenses and revenue in real-time with detailed reporting",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20"
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Track performance and generate insights with comprehensive dashboards",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20"
  },
  {
    icon: Settings,
    title: "Admin Controls",
    description: "Manage permissions, settings, and system configuration",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20"
  }
]

export function PlatformOverviewStep({ onNext }: PlatformOverviewStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl">
            <Play className="h-12 w-12 text-green-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Platform Overview</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Let's take a quick tour of the key features you'll be using to manage tours and events.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:bg-slate-800/50 transition-colors border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Create Tour</p>
              <p className="text-xs text-slate-400">Start planning your first tour</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Add Events</p>
              <p className="text-xs text-slate-400">Schedule shows and performances</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Manage Team</p>
              <p className="text-xs text-slate-400">Add crew and assign roles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={onNext} className="px-8">
          Continue to Tour Creation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          You can explore these features in detail later. Let's get you started with creating your first tour!
        </p>
      </div>
    </div>
  )
} 