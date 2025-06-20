"use client"

import { FeedLayout } from "../../components/social/feed-layout"

export default function NetworkFeedPage() {
  return <FeedLayout defaultTab="following" showPostCreator={true} showSidebar={true} />
}
