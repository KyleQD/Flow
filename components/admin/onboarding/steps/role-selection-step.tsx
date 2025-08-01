"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  User, 
  Settings, 
  Users, 
  BarChart3, 
  Globe, 
  Calendar,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { type AdminRole } from "@/lib/services/admin-onboarding.service"

interface RoleSelectionStepProps {
  roles: AdminRole[]
  selectedRole: string
  onRoleSelect: (roleName: string) => void
  onStart: () => void
  error?: string | null
}

const roleIcons = {
  tour_manager: Globe,
  event_coordinator: Calendar,
  financial_manager: BarChart3,
  team_manager: Users,
  analytics_admin: Settings
}

export function RoleSelectionStep({ 
  roles, 
  selectedRole, 
  onRoleSelect, 
  onStart, 
  error 
}: RoleSelectionStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
            <User className="h-12 w-12 text-blue-400" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Admin Role</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Select the role that best describes your responsibilities. This will help us customize your experience and provide relevant features.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const Icon = roleIcons[role.name as keyof typeof roleIcons] || User
          const isSelected = selectedRole === role.name
          
          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-500/10 border-blue-500/20' 
                    : 'hover:bg-slate-800/50 border-slate-700'
                }`}
                onClick={() => onRoleSelect(role.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{role.display_name}</CardTitle>
                        <Badge variant={isSelected ? "default" : "secondary"} className="mt-1">
                          {role.name.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3">
                    {role.description}
                  </p>
                  
                  {/* Permissions Preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-300">Key Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission.replace('.', ' ')}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <Button 
          size="lg" 
          onClick={onStart}
          disabled={!selectedRole}
          className="px-8"
        >
          Start Onboarding
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Don't worry, you can change your role later in the settings.
        </p>
      </div>
    </div>
  )
} 