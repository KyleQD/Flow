"use client"

import { useState } from "react"
import { EPKCreator } from "../../components/epk/epk-creator"
import { EPKPreview } from "../../components/epk/epk-preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProfile } from "../../context/profile-context"

export default function EPKPage() {
  const { profile } = useProfile()
  const [activeTab, setActiveTab] = useState("create")

  // Mock EPK data based on profile
  const mockEpkData = profile
    ? {
        ...profile,
        genres: ["Rock", "Alternative", "Indie"],
      }
    : null

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="create">Create EPK</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="premium">Premium Features</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <EPKCreator />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <EPKPreview epkData={mockEpkData} />
        </TabsContent>

        <TabsContent value="premium" className="mt-6">
          <EPKPreview epkData={mockEpkData} isPremium={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
