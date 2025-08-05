"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Music, Building2, Headphones, User, Tag, Check, X } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { achievementTriggerService } from "@/lib/services/achievement-trigger.service"

interface OnboardingCompleteProps {
  profileType: string | null
  userData: {
    name: string
    username: string
    email: string
  }
  profileId: string
}

export default function OnboardingComplete({ profileType, userData, profileId }: OnboardingCompleteProps) {
  const [promoCode, setPromoCode] = useState("")
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">("idle")
  const [isPromoVisible, setIsPromoVisible] = useState(false)
  const router = useRouter()

  // Trigger profile completion achievement when component mounts
  useEffect(() => {
    if (profileType && profileId) {
      achievementTriggerService.triggerProfileCompletion(profileId, profileType)
    }
  }, [profileType, profileId])

  const validatePromoCode = () => {
    if (promoCode.trim().toLowerCase() === "tourifyftw") {
      setPromoStatus("valid")
    } else {
      setPromoStatus("invalid")
    }
  }

  const getProfileIcon = () => {
    switch (profileType) {
      case "artist":
        return <Music className="h-12 w-12 text-white" />
      case "venue":
        return <Building2 className="h-12 w-12 text-white" />
      case "industry":
        return <Headphones className="h-12 w-12 text-white" />
      case "general":
        return <User className="h-12 w-12 text-white" />
      default:
        return <CheckCircle className="h-12 w-12 text-white" />
    }
  }

  const getProfileTitle = () => {
    switch (profileType) {
      case "artist":
        return "Artist Profile"
      case "venue":
        return "Venue Profile"
      case "industry":
        return "Industry Profile"
      case "general":
        return "Fan Profile"
      default:
        return "Your Profile"
    }
  }

  const getNextSteps = () => {
    switch (profileType) {
      case "artist":
        return [
          "Upload your music and media",
          "Connect with venues to book shows",
          "Set up your merch store",
          "Create your first event",
        ]
      case "venue":
        return [
          "Complete your venue specifications",
          "Set up your calendar availability",
          "Connect with artists in your area",
          "Create your first event",
        ]
      case "industry":
        return [
          "Upload your portfolio",
          "Add your skills and certifications",
          "Connect with venues and artists",
          "Browse available gigs",
        ]
      case "general":
        return [
          "Follow your favorite artists and venues",
          "Join fan communities",
          "Discover upcoming shows in your area",
          "Create your first playlist",
        ]
      default:
        return ["Complete your profile", "Connect with others", "Explore the platform", "Attend your first event"]
    }
  }

  const getActionButton = () => {
    switch (profileType) {
      case "artist":
        return "Start Your Artist Journey"
      case "venue":
        return "Elevate Your Venue"
      case "industry":
        return "Showcase Your Talent"
      case "general":
        return "Start Discovering"
      default:
        return "Go to Dashboard"
    }
  }

  const handleContinue = () => {
    router.push("/dashboard")
  }

  return (
    <div className="p-8 text-center text-white">
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center justify-center h-20 w-20 rounded-xl bg-[#6d28d9] mb-4">
          {getProfileIcon()}
        </div>
        <CheckCircle className="h-8 w-8 text-green-400" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Welcome to Tourify!</h2>
      <p className="text-gray-400 mb-6">Your {getProfileTitle()} has been created successfully</p>

      <div className="bg-[#1a1e2e] rounded-lg p-6 mb-8 border border-gray-700">
        <h3 className="font-medium text-lg mb-4 text-white">Next Steps</h3>
        <ul className="space-y-3 text-left">
          {getNextSteps().map((step, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-[#9333ea] mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {(profileType === "artist" || profileType === "venue") && (
        <div className="bg-[#2d2a3e] border border-[#9333ea]/30 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-medium text-sm mb-2 text-[#9333ea]">Complete Your Subscription</h3>
          <p className="text-sm text-gray-300 mb-3">
            Your {profileType === "artist" ? "Artist" : "Venue"} Profile requires a subscription to access all features.
          </p>

          {isPromoVisible ? (
            <div className="mb-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea] h-8 text-sm"
                />
                <Button
                  onClick={validatePromoCode}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] h-8 px-3"
                  disabled={promoStatus === "valid"}
                >
                  Apply
                </Button>
              </div>

              {promoStatus === "valid" && (
                <div className="flex items-center text-green-400 text-xs">
                  <Check className="h-4 w-4 mr-1" />
                  <span>Success! You've received 1 free month.</span>
                </div>
              )}

              {promoStatus === "invalid" && (
                <div className="flex items-center text-red-400 text-xs">
                  <X className="h-4 w-4 mr-1" />
                  <span>Invalid promo code. Please try again.</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsPromoVisible(true)}
              className="flex items-center text-[#a5b4fc] text-xs mb-3 hover:text-[#c7d2fe] transition-colors"
            >
              <Tag className="h-3.5 w-3.5 mr-1" />
              <span>Have a promo code?</span>
            </button>
          )}

          <Button className="bg-[#9333ea] hover:bg-[#7928ca] text-white text-sm h-8">
            {promoStatus === "valid" ? "Continue with Free Month" : "Set Up Payment"}
          </Button>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <Button className="bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] hover:from-[#5b21b6] hover:to-[#2563eb] border-0" onClick={handleContinue}>
          {getActionButton()}
        </Button>
        <Button
          variant="outline"
          className="border-[#4f46e5]/30 bg-[#1e1e2d] text-[#a5b4fc] hover:bg-[#252538] hover:border-[#4f46e5]/50 transition-all duration-300"
        >
          Explore Tourify
        </Button>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        <p>
          Need help?{" "}
          <Link href="#" className="text-[#9333ea] hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}
