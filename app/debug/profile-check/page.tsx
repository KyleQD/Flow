"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Music, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ProfileDebugData {
  user: {
    id: string
    email: string
    user_metadata: any
  }
  profile: {
    id: string
    username: string | null
    full_name: string | null
    bio: string | null
    avatar_url: string | null
  } | null
  artistProfile: {
    id: string
    user_id: string
    artist_name: string | null
    bio: string | null
    genres: string[]
  } | null
  suggestedUrls: {
    profile: string
    artist: string
  }
}

export default function ProfileCheckPage() {
  const { user, isAuthenticated } = useAuth()
  const [debugData, setDebugData] = useState<ProfileDebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fixing, setFixing] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDebugData()
    }
  }, [isAuthenticated, user])

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/debug/profile-check')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setDebugData(data)
    } catch (err) {
      console.error('Error fetching debug data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch profile data')
    } finally {
      setLoading(false)
    }
  }

  const fixProfile = async () => {
    try {
      setFixing(true)
      const response = await fetch('/api/debug/fix-profile', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Profile fix result:', result)
      
      // Refresh the debug data
      await fetchDebugData()
    } catch (err) {
      console.error('Error fixing profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fix profile')
    } finally {
      setFixing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-400">Please log in to check your profile</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Checking your profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button onClick={fetchDebugData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Debug Check</h1>
          <p className="text-slate-400">Let's see what's going on with your profile setup</p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>User ID:</strong> {debugData?.user.id}</p>
              <p><strong>Email:</strong> {debugData?.user.email}</p>
              <p><strong>Metadata:</strong> {JSON.stringify(debugData?.user.user_metadata, null, 2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Main Profile
              {debugData?.profile ? (
                <Badge variant="default">Found</Badge>
              ) : (
                <Badge variant="destructive">Missing</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugData?.profile ? (
              <div className="space-y-2">
                <p><strong>Username:</strong> {debugData.profile.username || 'Not set'}</p>
                <p><strong>Full Name:</strong> {debugData.profile.full_name || 'Not set'}</p>
                <p><strong>Bio:</strong> {debugData.profile.bio || 'Not set'}</p>
                <p><strong>Avatar:</strong> {debugData.profile.avatar_url ? 'Set' : 'Not set'}</p>
              </div>
            ) : (
              <p className="text-slate-400">No main profile found</p>
            )}
          </CardContent>
        </Card>

        {/* Artist Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Artist Profile
              {debugData?.artistProfile ? (
                <Badge variant="default">Found</Badge>
              ) : (
                <Badge variant="destructive">Missing</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugData?.artistProfile ? (
              <div className="space-y-2">
                <p><strong>Artist Name:</strong> {debugData.artistProfile.artist_name || 'Not set'}</p>
                <p><strong>Bio:</strong> {debugData.artistProfile.bio || 'Not set'}</p>
                <p><strong>Genres:</strong> {debugData.artistProfile.genres?.join(', ') || 'None'}</p>
              </div>
            ) : (
              <p className="text-slate-400">No artist profile found</p>
            )}
          </CardContent>
        </Card>

        {/* Suggested URLs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Profile URLs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Main Profile:</p>
                <Link 
                  href={debugData?.suggestedUrls.profile || '#'}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {debugData?.suggestedUrls.profile}
                </Link>
              </div>
              <div>
                <p className="font-medium mb-2">Artist Profile:</p>
                <Link 
                  href={debugData?.suggestedUrls.artist || '#'}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {debugData?.suggestedUrls.artist}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fix Button */}
        <div className="text-center">
          <Button 
            onClick={fixProfile}
            disabled={fixing}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {fixing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Fixing Profile...
              </>
            ) : (
              'Fix My Profile Setup'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
