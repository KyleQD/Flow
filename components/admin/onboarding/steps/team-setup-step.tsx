"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Users, 
  UserPlus,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Mail
} from "lucide-react"

interface TeamSetupStepProps {
  onNext: () => void
}

export function TeamSetupStep({ onNext }: TeamSetupStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
            <Users className="h-12 w-12 text-blue-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Team Setup</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Assemble your team and assign roles. Manage crew members, artists, and staff for your tours and events.
          </p>
        </div>
      </div>

      {/* Team Management Demo */}
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Team Management</CardTitle>
            <Button size="sm" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Team Members */}
          <div className="space-y-4">
            {[
              {
                name: "Sarah Johnson",
                role: "Tour Manager",
                email: "sarah@example.com",
                status: "active",
                permissions: ["tours.manage", "team.manage", "budget.view"]
              },
              {
                name: "Mike Chen",
                role: "Sound Engineer",
                email: "mike@example.com",
                status: "active",
                permissions: ["events.manage", "equipment.manage"]
              },
              {
                name: "Lisa Rodriguez",
                role: "Event Coordinator",
                email: "lisa@example.com",
                status: "pending",
                permissions: ["events.create", "venue.coordinate"]
              }
            ].map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{member.email}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {member.permissions.slice(0, 2).map((perm, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {perm.split('.')[0]}
                        </Badge>
                      ))}
                      {member.permissions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.permissions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Key Team Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { role: "Tour Manager", description: "Oversees entire tour operations", icon: Shield },
              { role: "Event Coordinator", description: "Manages individual events", icon: Clock },
              { role: "Sound Engineer", description: "Handles audio and technical setup", icon: CheckCircle },
              { role: "Stage Manager", description: "Coordinates stage operations", icon: Users }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <Icon className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.role}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Team Management Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Role-based permissions</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Team member invitations</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Schedule management</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Communication tools</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={onNext} className="px-8">
          Continue to Analytics
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Your team is the backbone of successful tours. Now let's learn how to track performance and generate insights.
        </p>
      </div>
    </div>
  )
} 