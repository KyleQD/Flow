"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProfile } from "@/context/venue/profile-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { FileText, ImageIcon, Music, Plus, Video } from "lucide-react"
import { EPKUpgradeModal } from "./epk-upgrade-modal"

export function EPKCreator() {
  const { profile, createEPK } = useProfile()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [epkUrl, setEpkUrl] = useState("")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleGenerateEPK = async () => {
    setIsGenerating(true)
    try {
      const url = await createEPK()
      if (url) {
        setEpkUrl(url)
        toast({
          title: "EPK Created",
          description: "Your Electronic Press Kit has been created successfully.",
        })
      }
    } catch (error) {
      console.error("Error creating EPK:", error)
      toast({
        title: "Error creating EPK",
        description: "There was an error creating your EPK. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Electronic Press Kit (EPK)</h1>
          <p className="text-gray-400">Create a professional EPK to showcase your work</p>
        </div>

        <div className="flex items-center gap-2">
          {epkUrl ? (
            <Button variant="outline" className="border-gray-700" asChild>
              <a href={epkUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                View EPK
              </a>
            </Button>
          ) : null}

          <Button onClick={() => setShowUpgradeModal(true)} variant="outline" className="border-gray-700">
            <Badge className="mr-2 bg-purple-600">Premium</Badge>
            Upgrade EPK
          </Button>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Create Your EPK</CardTitle>
          <CardDescription>
            Your Electronic Press Kit is a professional overview of your work for promotional purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-800 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="press">Press</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Artist Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell your story as an artist..."
                  className="bg-gray-800 border-gray-700 min-h-[150px]"
                  defaultValue={profile?.bio || ""}
                />
                <p className="text-xs text-gray-400">
                  A compelling bio helps venues, fans, and press understand your journey and style.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artistType">Artist Type</Label>
                  <select
                    id="artistType"
                    className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
                    defaultValue={profile?.artistType || ""}
                  >
                    <option value="">Select artist type</option>
                    <option value="solo">Solo Artist</option>
                    <option value="band">Band</option>
                    <option value="dj">DJ</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genres">Genres</Label>
                  <Input
                    id="genres"
                    placeholder="e.g. Rock, Hip-Hop, Electronic"
                    className="bg-gray-800 border-gray-700"
                  />
                  <p className="text-xs text-gray-400">Separate multiple genres with commas</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Photos</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile?.gallery && profile.gallery.length > 0 ? (
                    profile.gallery.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="relative aspect-square rounded-md overflow-hidden">
                        <img
                          src={item.url || "/placeholder.svg"}
                          alt={item.alt}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 border border-dashed border-gray-700 rounded-lg p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ImageIcon className="h-8 w-8 text-gray-500" />
                        <p className="text-sm font-medium">No photos added</p>
                        <p className="text-xs text-gray-400">Add photos to your profile gallery first</p>
                        <Button variant="outline" size="sm" className="mt-2 border-gray-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Photos
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Videos</Label>
                <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Video className="h-8 w-8 text-gray-500" />
                    <p className="text-sm font-medium">Add Video Links</p>
                    <p className="text-xs text-gray-400">
                      <span className="text-purple-400">Premium feature</span> - Upgrade to add videos to your EPK
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-gray-700"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <Badge className="mr-2 bg-purple-600">Premium</Badge>
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="music" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Music Samples</Label>
                <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Music className="h-8 w-8 text-gray-500" />
                    <p className="text-sm font-medium">Add Music</p>
                    <p className="text-xs text-gray-400">
                      <span className="text-purple-400">Premium feature</span> - Upgrade to add music to your EPK
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-gray-700"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <Badge className="mr-2 bg-purple-600">Premium</Badge>
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="press" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Press Releases & Reviews</Label>
                <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <FileText className="h-8 w-8 text-gray-500" />
                    <p className="text-sm font-medium">Add Press Content</p>
                    <p className="text-xs text-gray-400">
                      Add press releases, reviews, or articles featuring your work
                    </p>
                    <Button variant="outline" size="sm" className="mt-2 border-gray-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Press Item
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="booking@example.com"
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Social Links</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <select className="bg-gray-800 border-gray-700 rounded-md p-2 w-1/3">
                      <option value="instagram">Instagram</option>
                      <option value="spotify">Spotify</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="soundcloud">SoundCloud</option>
                      <option value="bandcamp">Bandcamp</option>
                    </select>
                    <Input
                      placeholder="https://instagram.com/yourusername"
                      className="bg-gray-800 border-gray-700 flex-1"
                    />
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button variant="outline" size="sm" className="border-gray-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Link
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
          <Button variant="outline" className="border-gray-700">
            Save Draft
          </Button>
          <Button onClick={handleGenerateEPK} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate EPK"}
          </Button>
        </CardFooter>
      </Card>

      <EPKUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  )
}
