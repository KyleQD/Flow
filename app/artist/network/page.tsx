"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, Search, Plus, Music, MapPin, MessageCircle, 
  UserPlus, Star, TrendingUp, Globe, Instagram, 
  Twitter, Youtube, Music2
} from "lucide-react"

interface User {
  id: string
  name: string
  role: string
  location: string
  avatar: string
  isVerified: boolean
  followers: number
  genre?: string
  instruments?: string[]
  socialLinks?: {
    instagram?: string
    twitter?: string
    youtube?: string
  }
}

const SAMPLE_USERS: User[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Electronic Producer",
    location: "Los Angeles, CA",
    avatar: "",
    isVerified: true,
    followers: 45000,
    genre: "Electronic",
    instruments: ["Synthesizer", "Ableton Live"],
    socialLinks: {
      instagram: "@sarahbeats",
      youtube: "SarahChenMusic"
    }
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    role: "Sound Engineer",
    location: "Nashville, TN",
    avatar: "",
    isVerified: false,
    followers: 2300,
    instruments: ["Pro Tools", "Logic Pro"],
    socialLinks: {
      instagram: "@marcussound"
    }
  },
  {
    id: "3",
    name: "Emma Thompson",
    role: "Indie Artist",
    location: "Austin, TX",
    avatar: "",
    isVerified: true,
    followers: 18500,
    genre: "Indie Folk",
    instruments: ["Guitar", "Piano", "Vocals"],
    socialLinks: {
      instagram: "@emmathompsonmusic",
      twitter: "@emmathompson",
      youtube: "EmmaThompsonOfficial"
    }
  }
]

function UserCard({ user, onConnect }: { user: User; onConnect: (id: string) => void }) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 rounded-xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-purple-600 text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-lg">{user.name}</h3>
              <Button
                size="sm"
                onClick={() => onConnect(user.id)}
                className="bg-purple-600 text-white hover:bg-purple-700 rounded-xl"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>
            
            <p className="text-purple-400 font-medium mb-1">{user.role}</p>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
              <span>•</span>
              <span>{user.followers.toLocaleString()} followers</span>
            </div>
            
            {user.genre && (
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 mb-3">
                {user.genre}
              </Badge>
            )}
            
            {user.instruments && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {user.instruments.map((instrument, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                      {instrument}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {user.socialLinks && (
              <div className="flex gap-2">
                {user.socialLinks.instagram && (
                  <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-white">
                    <Instagram className="h-4 w-4" />
                  </Button>
                )}
                {user.socialLinks.twitter && (
                  <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-white">
                    <Twitter className="h-4 w-4" />
                  </Button>
                )}
                {user.socialLinks.youtube && (
                  <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-white">
                    <Youtube className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NetworkStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">127</div>
          <div className="text-sm text-gray-400">Connections</div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">43</div>
          <div className="text-sm text-gray-400">Active Chats</div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-sm text-gray-400">Collaborations</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ArtistNetworkPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discover")

  const handleConnect = (userId: string) => {
    // TODO: Implement connection logic
    console.log(`Connecting to user ${userId}`)
  }

  const filteredUsers = SAMPLE_USERS.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Network
              </h1>
              <p className="text-sm text-slate-400">Connect with artists, fans, and industry professionals</p>
            </div>
          </div>
        </div>
        </div>
      
      <div className="max-w-6xl mx-auto p-8">

        {/* Network Stats */}
        <NetworkStats />

        {/* Search */}
        <Card className="mb-8 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for artists, producers, engineers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700/50 rounded-xl p-1">
            <TabsTrigger value="discover" className="rounded-lg">Discover</TabsTrigger>
            <TabsTrigger value="connections" className="rounded-lg">My Connections</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg">Requests</TabsTrigger>
            <TabsTrigger value="collaborations" className="rounded-lg">Collaborations</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Discover People</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-700 text-white rounded-xl">
                  <Music2 className="h-4 w-4 mr-2" />
                  Artists
                </Button>
                <Button variant="outline" className="border-gray-700 text-white rounded-xl">
                  <Users className="h-4 w-4 mr-2" />
                  Professionals
                </Button>
                <Button variant="outline" className="border-gray-700 text-white rounded-xl">
                  <Globe className="h-4 w-4 mr-2" />
                  Near Me
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} onConnect={handleConnect} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <div className="text-center py-20 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>Your connections will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="text-center py-20 text-gray-400">
              <UserPlus className="h-12 w-12 mx-auto mb-4" />
              <p>Connection requests will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="collaborations">
            <div className="text-center py-20 text-gray-400">
              <Music className="h-12 w-12 mx-auto mb-4" />
              <p>Collaboration opportunities will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 