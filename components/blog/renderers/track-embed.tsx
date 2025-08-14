"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MusicPlayer } from '@/components/music/music-player'

interface Props { id: string }

export function TrackEmbed({ id }: Props) {
  const [payload, setPayload] = useState<any>(null)

  useEffect(() => {
    let aborted = false
    async function load() {
      try {
        const res = await fetch('/api/music/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ musicId: id })
        })
        if (!aborted && res.ok) {
          const json = await res.json()
          setPayload(json.payload)
        }
      } catch {}
    }
    load()
    return () => { aborted = true }
  }, [id])

  if (!payload) {
    return <Card className="bg-slate-900/50 border-slate-700/50"><CardContent className="p-4 text-sm text-gray-400">Loading track…</CardContent></Card>
  }

  return (
    <MusicPlayer
      compact
      track={{
        id: payload.id,
        title: payload.title,
        artist: '',
        file_url: payload.preview,
        cover_art_url: payload.cover,
      } as any}
      showActions={false}
    />
  )
}


