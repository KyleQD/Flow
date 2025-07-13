"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Building2 } from "lucide-react"
import Image from "next/image"
import { TourifyLogo } from "@/components/tourify-logo"

interface VenueProfileSetupProps {
  userData: {
    email: string
    password: string
    name: string
    username: string
  }
  onComplete: () => void
}

export default function VenueProfileSetup({ userData, onComplete }: VenueProfileSetupProps) {
  const [formData, setFormData] = useState({
    venueName: userData.name,
    venueType: "",
    capacity: "",
    address: "",
    description: "",
    website: "",
    contactEmail: userData.email,
    contactPhone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete()
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-center mb-8">
        <TourifyLogo variant="white" size="xl" className="h-16 w-auto" />
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="h-14 w-14 bg-[#6d28d9] rounded-xl flex items-center justify-center">
          <Building2 className="h-7 w-7 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Venue Profile</h2>
      <p className="text-gray-400 text-center mb-6">Tell us about your venue and what makes it special</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-lg bg-[#1a1e2e] border border-gray-700 flex items-center justify-center overflow-hidden">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-[#1a1e2e] border-gray-700 hover:bg-[#2a304a]"
            >
              <Upload className="h-4 w-4 text-white" />
              <span className="sr-only">Upload venue photo</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueName" className="text-gray-300">
            Venue Name
          </Label>
          <Input
            id="venueName"
            name="venueName"
            value={formData.venueName}
            onChange={handleChange}
            className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueType" className="text-gray-300">
            Venue Type
          </Label>
          <Select>
            <SelectTrigger className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]">
              <SelectValue placeholder="Select venue type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1e2e] border-gray-700 text-white">
              <SelectItem value="bar">Bar/Club</SelectItem>
              <SelectItem value="theater">Theater</SelectItem>
              <SelectItem value="arena">Arena</SelectItem>
              <SelectItem value="festival">Festival Grounds</SelectItem>
              <SelectItem value="cafe">Café</SelectItem>
              <SelectItem value="gallery">Art Gallery</SelectItem>
              <SelectItem value="outdoor">Outdoor Space</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-gray-300">
              Capacity
            </Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              placeholder="e.g. 250"
              value={formData.capacity}
              onChange={handleChange}
              className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-gray-300">
              Contact Phone
            </Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              placeholder="(123) 456-7890"
              value={formData.contactPhone}
              onChange={handleChange}
              className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-300">
            Address
          </Label>
          <Input
            id="address"
            name="address"
            placeholder="Full venue address"
            value={formData.address}
            onChange={handleChange}
            className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-300">
            Venue Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your venue, its history, and what makes it unique"
            className="min-h-[100px] bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-gray-300">
            Website
          </Label>
          <Input
            id="website"
            name="website"
            placeholder="https://yourvenue.com"
            value={formData.website}
            onChange={handleChange}
            className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
          />
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
            Elevate Your Venue
          </Button>
        </div>
      </form>
    </div>
  )
}
