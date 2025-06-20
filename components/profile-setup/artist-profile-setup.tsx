"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, Upload } from "lucide-react"

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
    <div className="p-8">
      <div className="flex items-center justify-center mb-6">
        <Mic className="h-10 w-10 text-purple-600" />
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Artist Profile</h2>
      <p className="text-gray-500 text-center mb-6">Tell us more about your music and brand</p>

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
          <Label htmlFor="artistName">Artist/Band Name</Label>
          <Input id="artistName" name="artistName" value={formData.artistName} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Primary Genre</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent>
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
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell fans about your music and story"
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
          <Label>Social Media Links</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-24">Instagram</span>
              <Input
                name="instagram"
                placeholder="@username"
                value={formData.socialLinks.instagram}
                onChange={handleSocialChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-24">Spotify</span>
              <Input
                name="spotify"
                placeholder="Profile URL"
                value={formData.socialLinks.spotify}
                onChange={handleSocialChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-24">YouTube</span>
              <Input
                name="youtube"
                placeholder="Channel URL"
                value={formData.socialLinks.youtube}
                onChange={handleSocialChange}
              />
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