"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Headphones, Upload } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-center mb-6">
        <Headphones className="h-10 w-10 text-purple-600" />
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Industry Profile</h2>
      <p className="text-gray-500 text-center mb-6">Showcase your skills and experience to get hired for shows</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <Button size="sm" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload profile picture</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalName">Professional Name</Label>
          <Input
            id="professionalName"
            name="professionalName"
            value={formData.professionalName}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Primary Role</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
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
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Describe your experience and what you bring to events"
            className="min-h-[100px]"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">Less than 1 year</SelectItem>
              <SelectItem value="1-3">1-3 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5-10">5-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Availability</Label>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fullTime"
                checked={formData.availability.fullTime}
                onCheckedChange={() => handleAvailabilityChange("fullTime")}
              />
              <label htmlFor="fullTime" className="text-sm">
                Full-time
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partTime"
                checked={formData.availability.partTime}
                onCheckedChange={() => handleAvailabilityChange("partTime")}
              />
              <label htmlFor="partTime" className="text-sm">
                Part-time
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekends"
                checked={formData.availability.weekends}
                onCheckedChange={() => handleAvailabilityChange("weekends")}
              />
              <label htmlFor="weekends" className="text-sm">
                Weekends
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="touring"
                checked={formData.availability.touring}
                onCheckedChange={() => handleAvailabilityChange("touring")}
              />
              <label htmlFor="touring" className="text-sm">
                Touring
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button variant="outline" type="button">
            Back
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Complete Setup
          </Button>
        </div>
      </form>
    </div>
  )
} 