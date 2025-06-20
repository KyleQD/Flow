"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight, Music, Calendar, Users, BarChart3, Grid3X3 } from "lucide-react"

interface FeatureSpotlightProps {
  onDismiss: () => void
}

export function FeatureSpotlight({ onDismiss }: FeatureSpotlightProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const spotlightSteps = [
    {
      title: "Welcome to the New Tourify",
      description: "We've redesigned our navigation to make all features easily accessible. Let's take a quick tour!",
      icon: Grid3X3,
      highlight: "top-navigation",
    },
    {
      title: "Enhanced Sidebar",
      description: "All features are now organized by category in the sidebar for quick access.",
      icon: Users,
      highlight: "sidebar",
    },
    {
      title: "Music Upload & Management",
      description: "Upload, manage, and promote your music all in one place.",
      icon: Music,
      highlight: "music-features",
    },
    {
      title: "Event Management",
      description: "Create, manage, and promote your events with our comprehensive tools.",
      icon: Calendar,
      highlight: "event-features",
    },
    {
      title: "Analytics Dashboard",
      description: "Track your performance with detailed analytics across all your content.",
      icon: BarChart3,
      highlight: "analytics-features",
    },
  ]

  const nextStep = () => {
    if (currentStep < spotlightSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onDismiss()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentSpotlight = spotlightSteps[currentStep]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="relative max-w-md w-full bg-gray-900 rounded-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
          onClick={onDismiss}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600/20 p-3 rounded-full mr-4">
              <currentSpotlight.icon className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold">{currentSpotlight.title}</h2>
          </div>

          <p className="text-gray-300 mb-6">{currentSpotlight.description}</p>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={cn("text-gray-400 hover:text-white", currentStep === 0 && "opacity-50 cursor-not-allowed")}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </Button>

            <div className="flex space-x-1">
              {spotlightSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn("h-1.5 rounded-full w-6", index === currentStep ? "bg-purple-500" : "bg-gray-700")}
                />
              ))}
            </div>

            <Button
              variant={currentStep === spotlightSteps.length - 1 ? "default" : "ghost"}
              onClick={nextStep}
              className={
                currentStep === spotlightSteps.length - 1
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "text-gray-400 hover:text-white"
              }
            >
              {currentStep === spotlightSteps.length - 1 ? "Get Started" : "Next"}
              {currentStep !== spotlightSteps.length - 1 && <ChevronRight className="h-5 w-5 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
