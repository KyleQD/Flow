"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Music, 
  User, 
  FileText, 
  Image as ImageIcon,
  CheckCircle
} from "lucide-react"

interface TourInitiationStepProps {
  tourData: {
    name: string
    description: string
    mainArtist: string
    genre: string
    coverImage: string
  }
  updateTourData: (updates: any) => void
}

const genres = [
  "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Country", 
  "R&B", "Classical", "Folk", "Metal", "Punk", "Indie", "Alternative"
]

export function TourInitiationStep({ tourData, updateTourData }: TourInitiationStepProps) {
  const handleInputChange = (field: string, value: string) => {
    updateTourData({ [field]: value })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you'd upload to Supabase Storage
      const reader = new FileReader()
      reader.onload = (e) => {
        updateTourData({ coverImage: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tour Name */}
      <div className="space-y-2">
        <Label htmlFor="tour-name" className="text-white font-medium">
          Tour Name *
        </Label>
        <Input
          id="tour-name"
          placeholder="Enter tour name..."
          value={tourData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Main Artist */}
      <div className="space-y-2">
        <Label htmlFor="main-artist" className="text-white font-medium">
          Main Artist/Headliner *
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
          <Input
            id="main-artist"
            placeholder="Enter main artist name..."
            value={tourData.mainArtist}
            onChange={(e) => handleInputChange("mainArtist", e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 pl-10"
          />
        </div>
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label className="text-white font-medium">Genre *</Label>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={tourData.genre === genre ? "default" : "secondary"}
              className={`cursor-pointer transition-all ${
                tourData.genre === genre
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
              onClick={() => handleInputChange("genre", genre)}
            >
              <Music className="w-3 h-3 mr-1" />
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white font-medium">
          Tour Description
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
          <Textarea
            id="description"
            placeholder="Describe your tour, concept, or theme..."
            value={tourData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 pl-10 min-h-[100px]"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label className="text-white font-medium">Tour Cover Image</Label>
        <Card className="p-6 bg-slate-900/30 border-slate-700 border-dashed">
          {tourData.coverImage ? (
            <div className="text-center">
              <img
                src={tourData.coverImage}
                alt="Tour cover"
                className="w-full max-w-xs mx-auto rounded-lg mb-4"
              />
              <Button
                variant="outline"
                onClick={() => handleInputChange("coverImage", "")}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Remove Image
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                Upload a cover image for your tour
              </p>
              <Button
                variant="outline"
                onClick={() => document.getElementById("cover-image-upload")?.click()}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Validation Status */}
      <div className="flex items-center space-x-2 text-sm">
        {tourData.name && tourData.mainArtist && tourData.genre ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400">All required fields completed</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
            <span className="text-slate-400">Complete required fields to continue</span>
          </>
        )}
      </div>
    </div>
  )
} 