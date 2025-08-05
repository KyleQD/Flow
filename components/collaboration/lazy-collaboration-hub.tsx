"use client"

import { Suspense, lazy } from 'react'
import { CollaborationErrorBoundary } from './collaboration-error-boundary'
import { SimpleCollaborationHub } from './simple-collaboration-hub'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Lazy load the enhanced components
const EnhancedCollaborationHub = lazy(() => 
  import('./enhanced-collaboration-hub').then(module => ({
    default: module.EnhancedCollaborationHub
  }))
)

const RealTimeActivityFeed = lazy(() => 
  import('./real-time-activity-feed').then(module => ({
    default: module.RealTimeActivityFeed
  }))
)

// Loading fallback
function CollaborationLoading() {
  return (
    <Card className="bg-slate-950/90 border-slate-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Collaboration Hub...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityLoading() {
  return (
    <Card className="bg-slate-950/90 border-slate-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Activity Feed...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-800 rounded-full animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-slate-800 rounded animate-pulse" />
                <div className="h-2 bg-slate-800 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Lazy collaboration hub with error boundary and fallbacks
export function LazyCollaborationHub() {
  return (
    <CollaborationErrorBoundary fallback={<SimpleCollaborationHub />}>
      <Suspense fallback={<CollaborationLoading />}>
        <EnhancedCollaborationHub />
      </Suspense>
    </CollaborationErrorBoundary>
  )
}

// Lazy activity feed with error boundary and fallbacks
export function LazyActivityFeed({ className }: { className?: string }) {
  return (
    <CollaborationErrorBoundary fallback={
      <Card className="bg-slate-950/90 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Activity feed temporarily unavailable</p>
        </CardContent>
      </Card>
    }>
      <Suspense fallback={<ActivityLoading />}>
        <RealTimeActivityFeed className={className} />
      </Suspense>
    </CollaborationErrorBoundary>
  )
}