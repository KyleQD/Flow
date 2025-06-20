"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Upload } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface GeneralProfileSetupProps {
  userData: {
    email: string
    password: string
    name: string
    username: string
  }
  onComplete: () => void
}

export default function GeneralProfileSetup({ userData, onComplete }: GeneralProfileSetupProps) {
  const [formData, setFormData] = useState({
    displayName: userData.name,
    bio: "",
    location: "",
    favoriteGenres: {
      rock: false,
      pop: false,
      hiphop: false,
      electronic: false,
      jazz: false,
      folk: false,
      metal: false,
      country: false,
      classical: false,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenreChange = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteGenres: {
        ...prev.favoriteGenres,
        [genre]: !prev.favoriteGenres[genre as keyof typeof prev.favoriteGenres],
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
        <User className="h-10 w-10 text-purple-600" />
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Fan Profile</h2>
      <p className="text-gray-500 text-center mb-6">Tell us about your music tastes and interests</p>

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
          <Label htmlFor="displayName">Display Name</Label>
          <Input id="displayName" name="displayName" value={formData.displayName} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">About You</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell the community about yourself and your music interests"
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
          <Label className="block mb-2">Favorite Music Genres</Label>
          <div className="grid grid-cols-3 gap-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rock"
                checked={formData.favoriteGenres.rock}
                onCheckedChange={() => handleGenreChange("rock")}
              />
              <label htmlFor="rock" className="text-sm">
                Rock
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pop"
                checked={formData.favoriteGenres.pop}
                onCheckedChange={() => handleGenreChange("pop")}
              />
              <label htmlFor="pop" className="text-sm">
                Pop
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hiphop"
                checked={formData.favoriteGenres.hiphop}
                onCheckedChange={() => handleGenreChange("hiphop")}
              />
              <label htmlFor="hiphop" className="text-sm">
                Hip Hop
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="electronic"
                checked={formData.favoriteGenres.electronic}
                onCheckedChange={() => handleGenreChange("electronic")}
              />
              <label htmlFor="electronic" className="text-sm">
                Electronic
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="jazz"
                checked={formData.favoriteGenres.jazz}
                onCheckedChange={() => handleGenreChange("jazz")}
              />
              <label htmlFor="jazz" className="text-sm">
                Jazz
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="folk"
                checked={formData.favoriteGenres.folk}
                onCheckedChange={() => handleGenreChange("folk")}
              />
              <label htmlFor="folk" className="text-sm">
                Folk
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metal"
                checked={formData.favoriteGenres.metal}
                onCheckedChange={() => handleGenreChange("metal")}
              />
              <label htmlFor="metal" className="text-sm">
                Metal
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="country"
                checked={formData.favoriteGenres.country}
                onCheckedChange={() => handleGenreChange("country")}
              />
              <label htmlFor="country" className="text-sm">
                Country
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="classical"
                checked={formData.favoriteGenres.classical}
                onCheckedChange={() => handleGenreChange("classical")}
              />
              <label htmlFor="classical" className="text-sm">
                Classical
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