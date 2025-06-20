"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Mic } from "lucide-react"
import Image from "next/image"

interface ArtistProfileSetupProps {
  userData: {
    email: string
    password: string
    name: string
    username: string
  }
  onComplete: () => void
}

export default function ArtistProfileSetup({ userData, onComplete }: ArtistProfileSetupProps) {
  const [formData, setFormData] = useState({
    artistName: userData.name,
    genre: "",
    bio: "",
    location: "",
    website: "",
    socialLinks: {
      instagram: "",
      spotify: "",
      youtube: "",
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
    onComplete()
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-center mb-8">
        <Image src="/tourify-logo-white.png" alt="Tourify Logo" width={180} height={60} className="h-16 w-auto" />
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="h-14 w-14 bg-[#6d28d9] rounded-xl flex items-center justify-center">
          <Mic className="h-7 w-7 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Artist Profile</h2>
      <p className="text-gray-400 text-center mb-6">Tell us more about your music and brand</p>

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
          <Label htmlFor="artistName" className="text-gray-300">
            Artist/Band Name
          </Label>
          <Input
            id="artistName"
            name="artistName"
            value={formData.artistName}
            onChange={handleChange}
            className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre" className="text-gray-300">
            Primary Genre
          </Label>
          <Select>
            <SelectTrigger className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]">
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1e2e] border-gray-700 text-white">
              <SelectItem value="rock">Rock</SelectItem>
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="hiphop">Hip Hop</SelectItem>
              <SelectItem value="electronic">Electronic</SelectItem>
              <SelectItem value="jazz">Jazz</SelectItem>
              <SelectItem value="folk">Folk</SelectItem>
              <SelectItem value="metal">Metal</SelectItem>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="classical">Classical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-gray-300">
            Bio
          </Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell fans about your music and story"
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
          <Label className="text-gray-300">Social Media Links</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-24 text-gray-400">Instagram</span>
              <Input
                name="instagram"
                placeholder="@username"
                value={formData.socialLinks.instagram}
                onChange={handleSocialChange}
                className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-24 text-gray-400">Spotify</span>
              <Input
                name="spotify"
                placeholder="Profile URL"
                value={formData.socialLinks.spotify}
                onChange={handleSocialChange}
                className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-24 text-gray-400">YouTube</span>
              <Input
                name="youtube"
                placeholder="Channel URL"
                value={formData.socialLinks.youtube}
                onChange={handleSocialChange}
                className="bg-[#1a1e2e] border-gray-700 text-white focus:border-[#9333ea] focus:ring-[#9333ea]"
              />
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
            Start Your Artist Journey
          </Button>
        </div>
      </form>
    </div>
  )
}
