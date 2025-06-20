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

interface OrganizationProfileSetupProps {
  userData: {
    email: string
    password: string
    name: string
    username: string
  }
  onComplete: () => void
}

export default function OrganizationProfileSetup({ userData, onComplete }: OrganizationProfileSetupProps) {
  const [formData, setFormData] = useState({
    organizationName: userData.name,
    organizationType: "",
    description: "",
    location: "",
    website: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the organization profile data
    onComplete()
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-center mb-8">
        <TourifyLogo />
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6">Organization Profile Setup</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="organizationType">Organization Type</Label>
            <Select
              value={formData.organizationType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, organizationType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="label">Record Label</SelectItem>
                <SelectItem value="management">Management Company</SelectItem>
                <SelectItem value="agency">Booking Agency</SelectItem>
                <SelectItem value="promotion">Promotion Company</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your organization..."
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              required
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Social Media Links</h3>
            
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.socialLinks.instagram}
                onChange={handleSocialChange}
                placeholder="@username"
              />
            </div>

            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.socialLinks.twitter}
                onChange={handleSocialChange}
                placeholder="@username"
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleSocialChange}
                placeholder="Company LinkedIn URL"
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Complete Profile Setup
        </Button>
      </form>
    </div>
  )
} 