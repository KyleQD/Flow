"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Users, Calendar, Music2, Plus, Search, Upload, Ticket, TrendingUp, Video, Image as ImageIcon, FileText, Tag } from "lucide-react"
import { StreamlinedFeed } from "@/components/feed/streamlined-feed"

function QuickAccess() {
  return (
    <Card className="mb-4 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-base text-white">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/artist/events"><Button variant="ghost" className="w-full justify-start text-sm">📅 Events</Button></Link>
        <Link href="/artist/content"><Button variant="ghost" className="w-full justify-start text-sm">🎵 Content</Button></Link>
        <Link href="/artist/epk"><Button variant="ghost" className="w-full justify-start text-sm">📄 EPK</Button></Link>
        <Link href="/artist/network"><Button variant="ghost" className="w-full justify-start text-sm">🤝 Network</Button></Link>
      </CardContent>
    </Card>
  )
}

function FeatureSpotlight() {
  return (
    <Card className="mb-4 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-base text-white">Feature Spotlight</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium text-white">EPK Creator</div>
          <div className="text-xs text-gray-400">Create professional electronic press kits for your music career.</div>
          <Link href="/artist/epk"><Button variant="link" className="px-0 text-purple-500">Try it now →</Button></Link>
        </div>
        <div>
          <div className="font-medium text-white">Tour Calendar</div>
          <div className="text-xs text-gray-400">Plan and manage your tour dates with our interactive calendar.</div>
          <Link href="/artist/events"><Button variant="link" className="px-0 text-purple-500">Explore →</Button></Link>
        </div>
        <Button asChild className="w-full mt-2 rounded-xl shadow-sm bg-purple-600 text-white hover:bg-purple-700 transition" variant="secondary">
          <Link href="/artist/features">View All Features</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function TrendingTopics() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-base text-white">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {["#TourLife", "#SoundEngineer", "#FestivalSeason", "#Production"].map((topic, i) => (
          <div key={topic} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{topic}</span>
            <span className="text-xs text-gray-500">{(1000 - i * 200)} posts</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function FeaturedModules() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 w-full max-w-2xl">
      <Link href="/artist/content" className="group">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/10 rounded-xl shadow-lg cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-3">
            <Music2 className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-lg text-white">Music</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 text-sm">Upload, manage, and distribute your tracks.</CardContent>
        </Card>
      </Link>
      
      <Link href="/artist/network" className="group">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/10 rounded-xl shadow-lg cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-lg text-white">Network</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 text-sm">Connect with artists, fans, and industry professionals.</CardContent>
        </Card>
      </Link>
      
      <Link href="/artist/events" className="group">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/10 rounded-xl shadow-lg cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-3">
            <Calendar className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-lg text-white">Events</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 text-sm">Plan, promote, and manage your shows and tours.</CardContent>
        </Card>
      </Link>
      
      <Link href="/artist/epk" className="group">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/10 rounded-xl shadow-lg cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-3">
            <Tag className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-lg text-white">EPK</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 text-sm">Build your electronic press kit for media and venues.</CardContent>
        </Card>
      </Link>
    </div>
  )
}

export default function ArtistFeedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Artist Feed
              </h1>
              <p className="text-sm text-slate-400">Connect with your community and share updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        <div className="flex-1 p-6">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700 mb-6">
              <TabsTrigger 
                value="posts" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                Live Feed
              </TabsTrigger>
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-0">
              <StreamlinedFeed />
            </TabsContent>
            
            <TabsContent value="overview" className="mt-0">
              <div className="flex flex-col items-center gap-6 max-w-6xl mx-auto">
                <FeaturedModules />
                <div className="w-full max-w-2xl">
                  <Card className="mb-4 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white">Quick Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        placeholder="What's happening in your tour life?"
                        className="mb-2 rounded-lg bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                      />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-purple-500/20 transition"><ImageIcon className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-purple-500/20 transition"><Video className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-purple-500/20 transition"><FileText className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-purple-500/20 transition"><Tag className="h-4 w-4" /></Button>
                        <Button className="ml-auto rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">Post</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="w-80 p-6 border-l border-slate-700/50">
          <QuickAccess />
          <FeatureSpotlight />
          <TrendingTopics />
        </div>
      </div>
    </div>
  )
} 