"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Calendar, Globe, MapPin, MessageSquare, Music, Search, User } from "lucide-react"

interface UnifiedSearchProps {
  trigger?: React.ReactNode
}

export function UnifiedSearch({ trigger }: UnifiedSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search results
  const mockResults = {
    users: [
      {
        id: "user-1",
        name: "Jane Smith",
        username: "janesmith",
        avatar: "/placeholder.svg?height=40&width=40&text=JS",
        type: "user",
        title: "Vocalist & Songwriter",
      },
      {
        id: "user-2",
        name: "Mike Johnson",
        username: "mikej",
        avatar: "/placeholder.svg?height=40&width=40&text=MJ",
        type: "user",
        title: "Guitarist",
      },
    ],
    events: [
      {
        id: "event-1",
        title: "Summer Jam Festival",
        date: "2025-06-15",
        location: "New York, NY",
        type: "event",
      },
      {
        id: "event-2",
        title: "Acoustic Sessions",
        date: "2025-06-05",
        location: "Nashville, TN",
        type: "event",
      },
    ],
    posts: [
      {
        id: "post-1",
        title: "New Album Announcement",
        content: "Excited to announce my new album coming next month!",
        author: "Alex Johnson",
        type: "post",
      },
      {
        id: "post-2",
        title: "Tour Dates Announced",
        content: "Check out the dates for my upcoming summer tour!",
        author: "Alex Johnson",
        type: "post",
      },
    ],
    jobs: [
      {
        id: "job-1",
        title: "Drummer Needed for Summer Tour",
        location: "Multiple Cities",
        type: "job",
      },
      {
        id: "job-2",
        title: "Sound Engineer for Nashville Show",
        location: "Nashville, TN",
        type: "job",
      },
    ],
    music: [
      {
        id: "track-1",
        title: "Summer Vibes",
        artist: "Alex Johnson",
        album: "Seasonal Sounds",
        type: "track",
      },
      {
        id: "track-2",
        title: "Midnight Drive",
        artist: "Alex Johnson",
        album: "Night Sessions",
        type: "track",
      },
    ],
  }

  // Simulate search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)

    // Simulate  {
      setSearchResults([])
      return
    }
\
    setIsLoading(true)

  // Simulate API call with timeout
  const timeoutId = setTimeout(() => {
    const query = searchQuery.toLowerCase()
    const results = [
      ...mockResults.users.filter(
        (user) => user.name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query),
      ),
      ...mockResults.events.filter(
        (event) => event.title.toLowerCase().includes(query) || event.location.toLowerCase().includes(query),
      ),
      ...mockResults.posts.filter(
        (post) => post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query),
      ),
      ...mockResults.jobs.filter(
        (job) => job.title.toLowerCase().includes(query) || job.location.toLowerCase().includes(query),
      ),
      ...mockResults.music.filter(
        (track) => track.title.toLowerCase().includes(query) || track.album.toLowerCase().includes(query),
      ),
    ]

    setSearchResults(results)
    setIsLoading(false)
  }, 500)

  return () => clearTimeout(timeoutId)
}
, [searchQuery])

  // Handle keyboard shortcut to open search
  useEffect(() =>
{
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setOpen(true)
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}
, [])

  // Focus input when dialog opens
  useEffect(() =>
{
  if (open && inputRef.current) {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }
}
, [open])

const handleSelect = (result: any) => {
  setOpen(false)

  // Navigate based on result type
  switch (result.type) {
    case "user":
      router.push(`/profile/${result.username}`)
      break
    case "event":
      router.push(`/events/${result.id}`)
      break
    case "post":
      router.push(`/posts/${result.id}`)
      break
    case "job":
      router.push(`/jobs/${result.id}`)
      break
    case "track":
      // In a real app, this might open a music player
      router.push(`/music/${result.id}`)
      break
    default:
      break
  }
}

const getIconForType = (type: string) => {
  switch (type) {
    case "user":
      return <User className="h-4 w-4" />
    case "event":
      return <Calendar className="h-4 w-4" />
    case "post":
      return <MessageSquare className="h-4 w-4" />
    case "job":
      return <Globe className="h-4 w-4" />
    case "track":
      return <Music className="h-4 w-4" />
    default:
      return <Search className="h-4 w-4" />
  }
}

return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
            <Search className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-gray-900 border-gray-800 text-white p-0">
        <Command className="bg-transparent">
          <CommandInput 
            ref={inputRef}
            placeholder="Search for people, events, posts, jobs, music..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-none focus:ring-0 outline-none"
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="py-6 text-center">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-purple-500 rounded-full" aria-hidden="true"></div>
                  <p className="mt-2 text-gray-400">Searching...</p>
                </div>
              ) : (
                <p className="py-6 text-center text-gray-400">No results found.</p>
              )}
            </CommandEmpty>
            
            {searchResults.length > 0 && (
              <>
                {searchResults.some(r => r.type === "user") && (
                  <CommandGroup heading="People">
                    {searchResults
                      .filter(r => r.type === "user")
                      .map((result) => (
                        <CommandItem 
                          key={result.id} 
                          onSelect={() => handleSelect(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={result.avatar} alt={result.name} />
                              <AvatarFallback>
                                {result.name.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{result.name}</p>
                              <p className="text-sm text-gray-400">@{result.username}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                
                {searchResults.some(r => r.type === "event") && (
                  <CommandGroup heading="Events">
                    {searchResults
                      .filter(r => r.type === "event")
                      .map((result) => (
                        <CommandItem 
                          key={result.id} 
                          onSelect={() => handleSelect(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-900/30 text-purple-400 p-2 rounded-lg">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{result.title}</p>
                              <div className="flex items-center text-sm text-gray-400">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{result.location}</span>
                                <span className="mx-1">•</span>
                                <span>{new Date(result.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                
                {searchResults.some(r => r.type === "post") && (
                  <CommandGroup heading="Posts">
                    {searchResults
                      .filter(r => r.type === "post")
                      .map((result) => (
                        <CommandItem 
                          key={result.id} 
                          onSelect={() => handleSelect(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-900/30 text-blue-400 p-2 rounded-lg">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{result.title}</p>
                              <p className="text-sm text-gray-400 truncate">{result.content}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                
                {searchResults.some(r => r.type === "job") && (
                  <CommandGroup heading="Jobs">
                    {searchResults
                      .filter(r => r.type === "job")
                      .map((result) => (
                        <CommandItem 
                          key={result.id} 
                          onSelect={() => handleSelect(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-green-900/30 text-green-400 p-2 rounded-lg">
                              <Globe className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{result.title}</p>
                              <div className="flex items-center text-sm text-gray-400">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{result.location}</span>
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                
                {searchResults.some(r => r.type === "track") && (
                  <CommandGroup heading="Music">
                    {searchResults
                      .filter(r => r.type === "track")
                      .map((result) => (
                        <CommandItem 
                          key={result.id} 
                          onSelect={() => handleSelect(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-red-900/30 text-red-400 p-2 rounded-lg">
                              <Music className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{result.title}</p>
                              <p className="text-sm text-gray-400">{result.album}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
