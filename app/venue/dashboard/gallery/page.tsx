import { PageHeader } from "../../../components/navigation/page-header"
import { FeatureTabs } from "../../../components/navigation/feature-tabs"
import { Button } from "@/components/ui/button"
import { Plus, ImageIcon, Video, Music, Filter, Grid3X3, LayoutList } from "lucide-react"

export default function GalleryPage() {
  const tabs = [
    { id: "all", label: "All Media" },
    { id: "images", label: "Images" },
    { id: "videos", label: "Videos" },
    { id: "audio", label: "Audio" },
  ]

  const galleryItems = [
    { id: 1, type: "image", title: "Live at Summer Festival", src: "/abstract-soundscape.png" },
    { id: 2, type: "image", title: "Studio Session", src: "/recording-studio-booth.png" },
    { id: 3, type: "image", title: "Backstage", src: "/backstage-waiting.png" },
    { id: 4, type: "image", title: "Crowd Shot", src: "/diverse-city-crowd.png" },
    { id: 5, type: "image", title: "Venue Exterior", src: "/abstract-southwest.png" },
    { id: 6, type: "image", title: "Equipment Setup", src: "/microphone-crowd.png" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Gallery"
        description="Manage your photos, videos, and audio files"
        breadcrumbs={[
          { label: "Resources", href: "/resources" },
          { label: "Gallery", href: "/gallery" },
        ]}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Upload Media</span>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <FeatureTabs tabs={tabs} defaultTab="all" className="flex-1" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryItems.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-md border bg-background">
            <div className="aspect-square overflow-hidden">
              <img
                src={item.src || "/placeholder.svg"}
                alt={item.title}
                className="h-full w-full object-cover transition-all group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium">{item.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  {item.type === "image" && <ImageIcon className="h-3 w-3 mr-1" />}
                  {item.type === "video" && <Video className="h-3 w-3 mr-1" />}
                  {item.type === "audio" && <Music className="h-3 w-3 mr-1" />}
                  <span className="capitalize">{item.type}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <span className="sr-only">Options</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
