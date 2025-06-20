"use client"

import { useEffect, useState } from "react"
import { getProfile } from "@/services/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  userId: string
  isArtist: boolean
  isVenue: boolean
}

export function DashboardHeader({ userId, isArtist, isVenue }: DashboardHeaderProps) {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile(userId)
        setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }

    loadProfile()
  }, [userId])

  if (!profile) return null

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
          <AvatarFallback>{profile.full_name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
          <p className="text-slate-400">
            {isArtist && 'Artist'} 
            {isArtist && isVenue && ' & '} 
            {isVenue && 'Venue Manager'}
          </p>
        </div>
      </div>
    </div>
  )
} 