import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarIcon, HomeIcon } from "lucide-react"

export default function EventNotFound() {
  return (
    <div className="container mx-auto py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/venue/events">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/venue/dashboard">
              <HomeIcon className="mr-2 h-4 w-4" />
              Venue Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


