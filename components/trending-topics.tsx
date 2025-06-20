'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Music2 } from 'lucide-react'

interface TrendingTopic {
  id: string
  name: string
  count: number
}

export default function TrendingTopics() {
  const topics: TrendingTopic[] = [
    { id: '1', name: 'Summer Tour', count: 245 },
    { id: '2', name: 'Album Release', count: 189 },
    { id: '3', name: 'Music Festival', count: 156 },
    { id: '4', name: 'Concert', count: 132 },
    { id: '5', name: 'Live Performance', count: 98 },
  ]

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Music2 className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-lg">Trending Topics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between">
            <span className="text-slate-300">{topic.name}</span>
            <Badge variant="secondary" className="bg-purple-900/50 text-purple-400">
              {topic.count}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 