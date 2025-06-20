"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUpIcon } from "lucide-react"

interface TrendingTopic {
  id: string
  name: string
  count: number
}

const MOCK_TRENDING_TOPICS: TrendingTopic[] = [
  { id: "1", name: "LiveMusic", count: 1234 },
  { id: "2", name: "TourLife", count: 987 },
  { id: "3", name: "VenueSpotlight", count: 856 },
  { id: "4", name: "BehindTheScenes", count: 743 },
  { id: "5", name: "UpcomingShows", count: 621 },
]

export function TrendingTopics() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold">
          <TrendingUpIcon className="h-5 w-5 mr-2" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {MOCK_TRENDING_TOPICS.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-secondary/80">
                #{topic.name}
              </Badge>
              <span className="text-sm text-muted-foreground">{topic.count} posts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 