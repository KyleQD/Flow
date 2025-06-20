"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Globe, Target, Users } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
  contentId?: string
  contentType?: "event" | "post" | "profile" | "job"
  contentTitle?: string
}

export function CreatePromotionModal({
  isOpen,
  onClose,
  contentId,
  contentType = "event",
  contentTitle = "Your Content",
}: CreatePromotionModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [budget, setBudget] = useState([50])
  const [duration, setDuration] = useState("7")
  const [targetAudience, setTargetAudience] = useState<string[]>([])

  const handleAddLocation = (location: string) => {
    if (!targetAudience.includes(location)) {
      setTargetAudience([...targetAudience, location])
    }
  }

  const handleRemoveLocation = (location: string) => {
    setTargetAudience(targetAudience.filter((loc) => loc !== location))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // This would be an API call in a real application
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Promotion created",
        description: `Your promotion for "${contentTitle}" has been created successfully.`,
      })

      onClose()
    } catch (error) {
      console.error("Error creating promotion:", error)
      toast({
        title: "Error creating promotion",
        description: "There was an error creating your promotion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "event":
        return "Event"
      case "post":
        return "Post"
      case "profile":
        return "Profile"
      case "job":
        return "Job Posting"
      default:
        return "Content"
    }
  }

  const popularLocations = ["New York", "Los Angeles", "Chicago", "Nashville", "Miami", "Austin"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Create Promotion</DialogTitle>
          <DialogDescription className="text-gray-400">
            Boost visibility for your {getContentTypeLabel().toLowerCase()} with paid promotion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge>{getContentTypeLabel()}</Badge>
              <h3 className="font-medium">{contentTitle}</h3>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Promotion Budget</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">$10</span>
                <span className="text-sm text-gray-400">$500</span>
              </div>
              <Slider
                defaultValue={[50]}
                min={10}
                max={500}
                step={5}
                value={budget}
                onValueChange={setBudget}
                className="py-2"
              />
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-400">Your budget: </span>
                  <span className="font-medium">${budget[0]}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Estimated reach: </span>
                  <span className="font-medium">
                    {budget[0] * 20}-{budget[0] * 40} people
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Promotion Duration</h3>
            <RadioGroup defaultValue="7" value={duration} onValueChange={setDuration}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="duration-3" />
                  <Label htmlFor="duration-3" className="cursor-pointer">
                    3 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7" id="duration-7" />
                  <Label htmlFor="duration-7" className="cursor-pointer">
                    7 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="14" id="duration-14" />
                  <Label htmlFor="duration-14" className="cursor-pointer">
                    14 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="duration-30" />
                  <Label htmlFor="duration-30" className="cursor-pointer">
                    30 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="duration-custom" />
                  <Label htmlFor="duration-custom" className="cursor-pointer">
                    Custom
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {duration === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="startDate" type="date" className="bg-gray-800 border-gray-700 pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="endDate" type="date" className="bg-gray-800 border-gray-700 pl-10" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Target Audience</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <Label>Target Locations</Label>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {targetAudience.map((location) => (
                    <Badge key={location} variant="outline" className="border-gray-700">
                      {location}
                      <button
                        className="ml-2 text-gray-400 hover:text-gray-300"
                        onClick={() => handleRemoveLocation(location)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularLocations.map((location) => (
                    <Badge
                      key={location}
                      variant="outline"
                      className={`cursor-pointer border-gray-700 hover:border-gray-500 ${
                        targetAudience.includes(location) ? "opacity-50" : ""
                      }`}
                      onClick={() => handleAddLocation(location)}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <Label>Age Range</Label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">18</span>
                  <span className="text-sm text-gray-400">65+</span>
                </div>
                <Slider defaultValue={[18, 65]} min={18} max={65} step={1} className="py-2" />
                <div className="text-center text-sm">
                  <span className="text-gray-400">Target ages: </span>
                  <span className="font-medium">18-65+</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <Label>Interests</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Music",
                    "Live Events",
                    "Concerts",
                    "Festivals",
                    "Rock",
                    "Pop",
                    "Hip-Hop",
                    "Jazz",
                    "Electronic",
                  ].map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="cursor-pointer border-gray-700 hover:border-gray-500"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Total Cost</h3>
                <p className="text-sm text-gray-400">
                  {duration === "custom" ? "Custom duration" : `${duration} days`} at ${budget[0]}/day
                </p>
              </div>
              <div className="text-xl font-bold">
                ${duration === "custom" ? budget[0] : budget[0] * Number.parseInt(duration)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <DollarSign className="h-4 w-4 mr-2" />
            {isSubmitting ? "Processing..." : "Create Promotion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
