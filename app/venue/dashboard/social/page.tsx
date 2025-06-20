"use client"

import { useAuth } from "@/context/auth"
import { useSocial } from "@/context/social"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedPostFeed } from "@/app/venue/components/social/enhanced-post-feed"
import { ActivityFeed } from "@/app/venue/components/social/activity-feed"
import { SuggestedConnections } from "@/app/venue/components/social/suggested-connections"
import { TrendingTopics } from "@/app/venue/components/social/trending-topics"
import { UpcomingEvents } from "@/app/venue/components/social/upcoming-events"
import { MusicReleases } from "@/app/venue/components/social/music-releases"
import { EventUpdates } from "@/app/venue/components/social/event-updates"

export default function SocialPage() {
  const { user } = useAuth()
  const { posts, users } = useSocial()

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedPostFeed filter="all" showPostCreator={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <SuggestedConnections />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingTopics />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingEvents />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Music Releases</CardTitle>
            </CardHeader>
            <CardContent>
              <MusicReleases />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <EventUpdates />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
