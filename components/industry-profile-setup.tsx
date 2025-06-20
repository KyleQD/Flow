"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Headphones } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface IndustryProfileSetupProps {
  userData: {
    email: string
    password: string
    name: string
    username: string
  }
  onComplete: () => void
}

export default function IndustryProfileSetup({ userData, onComplete }: IndustryProfileSetupProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    professionalName: userData.name,
    role: "",
    bio: "",
    location: "",
    experience: "",
    skills: [],
    portfolio: "",
    availability: {
      fullTime: false,
      partTime: false,
      weekends: false,
      touring: false,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvailabilityChange = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [key]: !prev.availability[key as keyof typeof prev.availability],
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onComplete()
    router.push("/dashboard/staff/job-board")
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-center mb-8">
        <Image src="/tourify-logo-white.png" alt="Tourify Logo" width={180} height={60} className="h-16 w-auto" />
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="h-14 w-14 bg-[#6d28d9] rounded-xl flex items-center justify-center">
          <Headphones className="h-7 w-7 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Industry Profile</h2>
      <p className="text-gray-400 text-center mb-6">Showcase your skills and experience to get hired for shows</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-[#1a1e2e] border border-gray-700 flex items-center justify-center overflow-hidden">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-[#1a1e2e] border-gray-700 hover:bg-[#2a304a]"
            >
              <Upload className="h-4 w-4 text-white" />
              <span className="sr-only">Upload profile picture</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalName" className="text-gray-300">
            Professional Name
          </Label>
          <Input
            id="professionalName"
            name="professionalName"
            value={formData.professionalName}
            onChange={handleChange}
            className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-gray-300">
            Primary Role
          </Label>
          <Select>
            <SelectTrigger className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1e2e] border-gray-700 text-white">
              <SelectItem value="sound">Sound Engineer</SelectItem>
              <SelectItem value="lighting">Lighting Designer</SelectItem>
              <SelectItem value="stage">Stage Manager</SelectItem>
              <SelectItem value="tour">Tour Manager</SelectItem>
              <SelectItem value="photographer">Photographer</SelectItem>
              <SelectItem value="videographer">Videographer</SelectItem>
              <SelectItem value="promoter">Promoter</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-gray-300">
            Professional Bio
          </Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Describe your experience and what you bring to events"
            className="min-h-[100px] bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-gray-300">
            Location
          </Label>
          <Input
            id="location"
            name="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={handleChange}
            className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience" className="text-gray-300">
            Years of Experience
          </Label>
          <Select>
            <SelectTrigger className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1e2e] border-gray-700 text-white">
              <SelectItem value="0-1">Less than 1 year</SelectItem>
              <SelectItem value="1-3">1-3 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5-10">5-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Availability</Label>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fullTime"
                checked={formData.availability.fullTime}
                onCheckedChange={() => handleAvailabilityChange("fullTime")}
                className="border-gray-600 data-[state=checked]:bg-[#9333ea] data-[state=checked]:border-[#9333ea]"
              />
              <label htmlFor="fullTime" className="text-sm text-gray-300">
                Full-time
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partTime"
                checked={formData.availability.partTime}
                onCheckedChange={() => handleAvailabilityChange("partTime")}
                className="border-gray-600 data-[state=checked]:bg-[#9333ea] data-[state=checked]:border-[#9333ea]"
              />
              <label htmlFor="partTime" className="text-sm text-gray-300">
                Part-time
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekends"
                checked={formData.availability.weekends}
                onCheckedChange={() => handleAvailabilityChange("weekends")}
                className="border-gray-600 data-[state=checked]:bg-[#9333ea] data-[state=checked]:border-[#9333ea]"
              />
              <label htmlFor="weekends" className="text-sm text-gray-300">
                Weekends
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="touring"
                checked={formData.availability.touring}
                onCheckedChange={() => handleAvailabilityChange("touring")}
                className="border-gray-600 data-[state=checked]:bg-[#9333ea] data-[state=checked]:border-[#9333ea]"
              />
              <label htmlFor="touring" className="text-sm text-gray-300">
                Touring
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button
            variant="outline"
            type="button"
            className="border-[#4f46e5]/30 bg-[#1e1e2d] text-[#a5b4fc] hover:bg-[#252538] hover:border-[#4f46e5]/50 transition-all duration-300"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] hover:from-[#5b21b6] hover:to-[#2563eb] border-0"
          >
            Showcase Your Talent
          </Button>
        </div>
      </form>
    </div>
  )
}
