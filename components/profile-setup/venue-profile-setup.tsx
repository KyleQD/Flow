"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Upload } from "lucide-react"

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
    <div className="p-8">
      <div className="flex items-center justify-center mb-6">
        <Building2 className="h-10 w-10 text-purple-600" />
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Venue Profile</h2>
      <p className="text-gray-500 text-center mb-6">Tell us about your venue and what makes it special</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <Button size="sm" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload venue photo</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueName">Venue Name</Label>
          <Input id="venueName" name="venueName" value={formData.venueName} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueType">Venue Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select venue type" />
            </SelectTrigger>
            <SelectContent>
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
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              placeholder="e.g. 250"
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              placeholder="(123) 456-7890"
              value={formData.contactPhone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="Full venue address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Venue Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your venue, its history, and what makes it unique"
            className="min-h-[100px]"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            placeholder="https://yourvenue.com"
            value={formData.website}
            onChange={handleChange}
          />
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