"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { FileText, Image, Music, Link, Download } from "lucide-react"

interface PressKitSection {
  id: string
  type: "bio" | "press-release" | "media" | "social" | "contact"
  content: string
  media?: string[]
}

const templates = [
  {
    id: "modern",
    name: "Modern Minimalist",
    description: "Clean and professional design with focus on content"
  },
  {
    id: "creative",
    name: "Creative Showcase",
    description: "Bold and artistic layout for visual impact"
  },
  {
    id: "classic",
    name: "Classic Professional",
    description: "Traditional press kit layout with comprehensive sections"
  }
]

export function PressKitBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [sections, setSections] = useState<PressKitSection[]>([])
  const [artistInfo, setArtistInfo] = useState({
    name: "",
    genre: "",
    location: "",
    website: "",
    email: "",
    phone: ""
  })

  const addSection = (type: PressKitSection["type"]) => {
    const newSection: PressKitSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: ""
    }
    setSections([...sections, newSection])
  }

  const updateSection = (id: string, content: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, content } : section
    ))
  }

  const generatePressKit = () => {
    // TODO: Implement press kit generation based on template and content
    console.log("Generating press kit...")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Press Kit Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Artist Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Artist Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Artist Name"
                  value={artistInfo.name}
                  onChange={e => setArtistInfo({ ...artistInfo, name: e.target.value })}
                />
                <Input
                  placeholder="Genre"
                  value={artistInfo.genre}
                  onChange={e => setArtistInfo({ ...artistInfo, genre: e.target.value })}
                />
                <Input
                  placeholder="Location"
                  value={artistInfo.location}
                  onChange={e => setArtistInfo({ ...artistInfo, location: e.target.value })}
                />
                <Input
                  placeholder="Website"
                  value={artistInfo.website}
                  onChange={e => setArtistInfo({ ...artistInfo, website: e.target.value })}
                />
              </div>
            </div>

            {/* Sections */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Press Kit Sections</h3>
                <Select onValueChange={(value: PressKitSection["type"]) => addSection(value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bio">Biography</SelectItem>
                    <SelectItem value="press-release">Press Release</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="social">Social Links</SelectItem>
                    <SelectItem value="contact">Contact Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {sections.map(section => (
                <Card key={section.id} className="mb-4">
                  <CardContent className="p-4">
                    <Textarea
                      value={section.content}
                      onChange={e => updateSection(section.id, e.target.value)}
                      placeholder={`Enter ${section.type} content...`}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generate Button */}
            <Button
              className="w-full"
              onClick={generatePressKit}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Press Kit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 