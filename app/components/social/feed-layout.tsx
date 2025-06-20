"use client"

import { ReactNode } from "react"
import { EnhancedPostFeed } from "./enhanced-post-feed"
import { SuggestedConnections } from "./suggested-connections"
import { TrendingTopics } from "./trending-topics"
import { ActivityFeed } from "./activity-feed"

interface FeedLayoutProps {
  children?: ReactNode
  showSidebars?: boolean
  userId?: string
  tag?: string
  className?: string
}

export function FeedLayout({ children, showSidebars = true, userId, tag, className = "" }: FeedLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        {showSidebars && (
          <aside className="hidden md:block md:col-span-3 space-y-6">
            <TrendingTopics limit={5} />
            <ActivityFeed />
          </aside>
        )}

        {/* Main Content */}
        <main className="md:col-span-6">
          {children || <EnhancedPostFeed userId={userId} tag={tag} />}
        </main>

        {/* Right Sidebar */}
        {showSidebars && (
          <aside className="hidden md:block md:col-span-3 space-y-6">
            <SuggestedConnections />
          </aside>
        )}
      </div>
    </div>
  )
} 