'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SubscribeToggleProps {
  slug: string
  initialIsSubscribed?: boolean
}

export function SubscribeToggle({ slug, initialIsSubscribed }: SubscribeToggleProps) {
  const [isSubscribed, setIsSubscribed] = useState(!!initialIsSubscribed)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      const method = isSubscribed ? 'DELETE' : 'POST'
      const res = await fetch(`/api/forums/${slug}/subscribe`, { method })
      if (!res.ok) throw new Error('subscribe_failed')
      setIsSubscribed(v => !v)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={toggle} variant={isSubscribed ? 'secondary' : 'default'} disabled={loading} size="sm">
      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
    </Button>
  )
}


