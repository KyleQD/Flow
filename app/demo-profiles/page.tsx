"use client"

import { useState } from "react"
import { PublicProfileView } from "@/components/profile/public-profile-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Music, Building, Users, Sparkles } from "lucide-react"
import demoAccountsData from "@/seed/demo-accounts-data.json"

export default function DemoProfilesPage() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState("general")

  const { general_accounts, venue_accounts, artist_accounts } = demoAccountsData

  const handleProfileSelect = (profile: any, accountType: string) => {
    setSelectedProfile({
      ...profile,
      account_type: accountType,
      bio: profile.profile_data.bio,
      location: profile.profile_data.location || profile.profile_data.address
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'artist': return <Music className="h-5 w-5" />
      case 'venue': return <Building className="h-5 w-5" />
      default: return <Users className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'artist': return 'from-purple-500 to-pink-500'
      case 'venue': return 'from-green-500 to-emerald-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  if (selectedProfile) {
    return (
      <div className="relative">
        <Button
          onClick={() => setSelectedProfile(null)}
          className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-sm text-white border border-white/20 hover:bg-black/70"
        >
          ← Back to Demo Profiles
        </Button>
        <PublicProfileView
          profile={selectedProfile}
          isOwnProfile={false}
          onFollow={(userId) => console.log("Follow:", userId)}
          onMessage={(userId) => console.log("Message:", userId)}
          onShare={(profile) => console.log("Share:", profile)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Demo Profiles
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore different types of profiles on Tourify. Click on any profile to see the full public view experience.
          </p>
        </div>

        {/* Profile Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm rounded-2xl p-1 max-w-md mx-auto mb-8">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="venue" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-xl flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Venues
            </TabsTrigger>
            <TabsTrigger 
              value="artist" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl flex items-center gap-2"
            >
              <Music className="h-4 w-4" />
              Artists
            </TabsTrigger>
          </TabsList>

          {/* General Accounts */}
          <TabsContent value="general" className="mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Music Enthusiasts</h2>
              <p className="text-gray-400">General users who love music and attend events</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {general_accounts.map((account, index) => (
                <Card 
                  key={index}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleProfileSelect(account, 'general')}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {account.profile_data.name.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-white/20">
                          <Users className="h-3 w-3 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{account.profile_data.name}</h3>
                        <p className="text-gray-400 text-sm">@{account.username}</p>
                        {account.verified && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs mt-1">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {account.profile_data.bio}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{account.stats.followers} followers</span>
                      <span className="flex items-center gap-1">
                        <span>{account.profile_data.occupation}</span>
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {account.profile_data.genre_preferences.slice(0, 3).map((genre: string) => (
                        <Badge key={genre} variant="outline" className="border-blue-500/50 text-blue-300 text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Venue Accounts */}
          <TabsContent value="venue" className="mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Las Vegas Venues</h2>
              <p className="text-gray-400">Music venues and event spaces in Las Vegas</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venue_accounts.map((account, index) => (
                <Card 
                  key={index}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleProfileSelect(account, 'venue')}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {account.profile_data.venue_name.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-white/20">
                          <Building className="h-3 w-3 text-green-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{account.profile_data.venue_name}</h3>
                        <p className="text-gray-400 text-sm">@{account.username}</p>
                        {account.verified && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs mt-1">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {account.profile_data.bio}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{account.stats.followers} followers</span>
                      <span>Capacity: {account.profile_data.capacity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{account.stats.events} events</span>
                      <span>{account.profile_data.venue_type}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {account.profile_data.genres.slice(0, 3).map((genre: string) => (
                        <Badge key={genre} variant="outline" className="border-green-500/50 text-green-300 text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Artist Accounts */}
          <TabsContent value="artist" className="mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Featured Artists</h2>
              <p className="text-gray-400">Musicians and performers with music demos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artist_accounts.map((account, index) => (
                <Card 
                  key={index}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleProfileSelect(account, 'artist')}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {account.profile_data.artist_name.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-white/20">
                          <Music className="h-3 w-3 text-purple-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{account.profile_data.artist_name}</h3>
                        <p className="text-gray-400 text-sm">@{account.username}</p>
                        {account.verified && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs mt-1">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {account.profile_data.bio}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{account.stats.followers} followers</span>
                      <span>{account.stats.streams?.toLocaleString()} streams</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{account.profile_data.artist_type}</span>
                      <span>{account.profile_data.years_active}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {account.profile_data.sub_genres?.slice(0, 3).map((genre: string) => (
                        <Badge key={genre} variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Profile Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Social Interactions</h3>
                <p className="text-gray-400 text-sm">Follow, message, and share profiles with seamless social features</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Rich Media</h3>
                <p className="text-gray-400 text-sm">Music players, photo galleries, and event showcases</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Event Integration</h3>
                <p className="text-gray-400 text-sm">Discover and book events directly from profiles</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 