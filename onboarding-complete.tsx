import { Button } from "@/components/ui/button"
import { CheckCircle, Music, Building2, Headphones, User } from "lucide-react"
import Link from "next/link"

interface OnboardingCompleteProps {
  profileType: string | null
  userData: {
    name: string
    username: string
    email: string
  }
}

export default function OnboardingComplete({ profileType, userData }: OnboardingCompleteProps) {
  const getProfileIcon = () => {
    switch (profileType) {
      case "artist":
        return <Music className="h-12 w-12 text-purple-600" />
      case "venue":
        return <Building2 className="h-12 w-12 text-purple-600" />
      case "industry":
        return <Headphones className="h-12 w-12 text-purple-600" />
      case "general":
        return <User className="h-12 w-12 text-purple-600" />
      default:
        return <CheckCircle className="h-12 w-12 text-purple-600" />
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

  return (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-purple-100 mb-4">
          {getProfileIcon()}
        </div>
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Welcome to Tourify!</h2>
      <p className="text-gray-500 mb-6">Your {getProfileTitle()} has been created successfully</p>

      <div className="bg-purple-50 rounded-lg p-6 mb-8">
        <h3 className="font-medium text-lg mb-4">Next Steps</h3>
        <ul className="space-y-3 text-left">
          {getNextSteps().map((step, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {(profileType === "artist" || profileType === "venue") && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-medium text-sm mb-2 text-yellow-800">Complete Your Subscription</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Your {profileType === "artist" ? "Artist" : "Venue"} Profile requires a subscription to access all features.
          </p>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm h-8">Set Up Payment</Button>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <Button className="bg-purple-600 hover:bg-purple-700">Go to Dashboard</Button>
        <Button variant="outline">Explore Tourify</Button>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Need help?{" "}
          <Link href="#" className="text-purple-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}
