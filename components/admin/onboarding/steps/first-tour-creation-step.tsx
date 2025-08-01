"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Globe, 
  Calendar, 
  MapPin,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react"

interface FirstTourCreationStepProps {
  onNext: () => void
}

export function FirstTourCreationStep({ onNext }: FirstTourCreationStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl">
            <Globe className="h-12 w-12 text-purple-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Your First Tour</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Let's create a sample tour to get you familiar with the process. You can modify or delete this later.
          </p>
        </div>
      </div>

      {/* Sample Tour Creation */}
      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Sample Tour: "Summer Festival Circuit"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tour Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">Duration</p>
                  <p className="text-sm text-slate-400">June 15 - August 30, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Cities</p>
                  <p className="text-sm text-slate-400">12 cities across the US</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-white">Crew Size</p>
                  <p className="text-sm text-slate-400">25 team members</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">Budget</p>
                  <p className="text-sm text-slate-400">$500,000</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Status</p>
                  <Badge variant="secondary">Planning</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Events */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Sample Events</h4>
            <div className="space-y-2">
              {[
                { name: "Summer Music Festival - NYC", date: "June 20, 2024", venue: "Central Park" },
                { name: "Indie Rock Night - LA", date: "July 5, 2024", venue: "Hollywood Bowl" },
                { name: "Electronic Showcase - Miami", date: "July 15, 2024", venue: "Bayfront Park" }
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{event.name}</p>
                    <p className="text-xs text-slate-400">{event.date} • {event.venue}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Creation Tips */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tour Creation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-500/20 rounded">
              <CheckCircle className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Start with a clear name</p>
              <p className="text-xs text-slate-400">Make it descriptive and memorable</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-green-500/20 rounded">
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Set realistic dates</p>
              <p className="text-xs text-slate-400">Consider travel time between cities</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-yellow-500/20 rounded">
              <CheckCircle className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Plan your budget</p>
              <p className="text-xs text-slate-400">Include all expenses and contingencies</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-purple-500/20 rounded">
              <CheckCircle className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Assemble your team</p>
              <p className="text-xs text-slate-400">Identify key roles and responsibilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={onNext} className="px-8">
          Continue to Event Management
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Great! You've created your first tour. Now let's learn how to add and manage events within your tour.
        </p>
      </div>
    </div>
  )
} 