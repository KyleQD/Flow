import { Filter, Plus, Search, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function VenueGallery({ venueId }: { venueId: string }) {
  // This would be fetched from an API in a real application
  const images = [
    {
      id: "1",
      url: "/vibrant-concert-stage.png",
      title: "Main Stage",
      category: "Venue",
    },
    {
      id: "2",
      url: "/vibrant-venue-bar.png",
      title: "Bar Area",
      category: "Venue",
    },
    {
      id: "3",
      url: "/placeholder.svg?height=200&width=300&query=concert%20venue%20entrance",
      title: "Entrance",
      category: "Venue",
    },
    {
      id: "4",
      url: "/placeholder.svg?height=200&width=300&query=concert%20venue%20vip%20section",
      title: "VIP Section",
      category: "Venue",
    },
    {
      id: "5",
      url: "/placeholder.svg?height=200&width=300&query=rock%20concert%20crowd",
      title: "Rock Concert",
      category: "Events",
    },
    {
      id: "6",
      url: "/placeholder.svg?height=200&width=300&query=jazz%20performance%20on%20stage",
      title: "Jazz Night",
      category: "Events",
    },
  ]

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gallery</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Album
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search gallery..."
              className="pl-9 bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
            />
          </div>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="venue" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Venue
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-md">
                  <div className="aspect-[3/2] relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <h3 className="font-medium">{image.title}</h3>
                      <p className="text-sm text-white/70">{image.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="venue" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images
                .filter((img) => img.category === "Venue")
                .map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-md">
                    <div className="aspect-[3/2] relative group">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <div className="absolute bottom-0 left-0 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <h3 className="font-medium">{image.title}</h3>
                        <p className="text-sm text-white/70">{image.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images
                .filter((img) => img.category === "Events")
                .map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-md">
                    <div className="aspect-[3/2] relative group">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <div className="absolute bottom-0 left-0 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <h3 className="font-medium">{image.title}</h3>
                        <p className="text-sm text-white/70">{image.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
