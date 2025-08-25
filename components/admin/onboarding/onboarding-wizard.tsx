"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  User, 
  Settings,
  ArrowRight,
  Play,
  BookOpen,
  Users,
  BarChart3,
  Globe,
  Calendar
} from "lucide-react"
import { AdminOnboardingService, type AdminRole, type OnboardingStep } from "@/lib/services/admin-onboarding.service"
import { RoleSelectionStep } from "./steps/role-selection-step"
import { PlatformOverviewStep } from "./steps/platform-overview-step"
import { FirstTourCreationStep } from "./steps/first-tour-creation-step"
import { EventManagementStep } from "./steps/event-management-step"
import { TeamSetupStep } from "./steps/team-setup-step"



interface OnboardingWizardProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [progress, setProgress] = useState({
    current_step: 1,
    total_steps: 7,
    completed_steps: [] as number[],
    progress_percentage: 0,
    is_completed: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [rolesData, stepsData, progressData] = await Promise.all([
          AdminOnboardingService.getAdminRoles(),
          AdminOnboardingService.getOnboardingSteps(),
          AdminOnboardingService.getOnboardingProgress()
        ])
        
        setRoles(rolesData)
        setSteps(stepsData)
        setProgress(progressData)
        
        // Set current step from progress
        setCurrentStep(progressData.current_step)
      } catch (err) {
        console.error('Error fetching onboarding data:', err)
        setError('Failed to load onboarding data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleNext = async () => {
    try {
      // Complete current step
      await AdminOnboardingService.completeStep({
        step_number: currentStep,
        step_data: {
          selected_role: selectedRole,
          completed_at: new Date().toISOString()
        }
      })

      // Update progress
      const newProgress = await AdminOnboardingService.getOnboardingProgress()
      setProgress(newProgress)

      // Move to next step
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1)
      } else {
        // Onboarding completed
        onComplete?.()
      }
    } catch (err) {
      console.error('Error completing step:', err)
      setError('Failed to complete step')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRoleSelect = (roleName: string) => {
    setSelectedRole(roleName)
  }

  const handleStartOnboarding = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue')
      return
    }

    try {
      await AdminOnboardingService.startOnboarding({ admin_role: selectedRole })
      setCurrentStep(2) // Move to platform overview
    } catch (err) {
      console.error('Error starting onboarding:', err)
      setError('Failed to start onboarding')
    }
  }

  const renderStep = () => {
    const step = steps.find(s => s.step_number === currentStep)
    
    switch (currentStep) {
      case 1:
        return (
          <RoleSelectionStep
            roles={roles}
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            onStart={handleStartOnboarding}
            error={error}
          />
        )
      case 2:
        return <PlatformOverviewStep onNext={handleNext} />
      case 3:
        return <FirstTourCreationStep onNext={handleNext} />
      case 4:
        return <EventManagementStep onNext={handleNext} />
      case 5:
        return <TeamSetupStep onNext={handleNext} />
      case 6:
        return <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Onboarding Complete!</h2>
          <p className="text-slate-400 mb-6">You're all set to start managing your tours and events.</p>
          <Button onClick={onComplete}>Get Started</Button>
        </div>
      default:
        return <div>Step not found</div>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-400">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Onboarding</h1>
            <p className="text-slate-400">
              Complete your setup to start managing tours and events
            </p>
          </div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Skip for now
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Step {currentStep} of {progress.total_steps}
            </span>
            <span className="text-sm text-slate-400">
              {progress.progress_percentage}% Complete
            </span>
          </div>
          <Progress value={progress.progress_percentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.step_number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step.step_number < currentStep
                  ? 'bg-green-500 text-white'
                  : step.step_number === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {step.step_number < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.step_number
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step.step_number < currentStep ? 'bg-green-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {currentStep > 1 && currentStep < 7 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-slate-400">
              <Clock className="w-4 h-4 mr-1" />
              {steps.find(s => s.step_number === currentStep)?.estimated_time || 5} min
            </div>
            
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 