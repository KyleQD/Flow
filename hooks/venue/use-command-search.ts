"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { create } from "zustand"

interface CommandSearchStore {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const useCommandSearch = create<CommandSearchStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

type SearchResult = {
  id: string
  type: "venue" | "artist" | "event" | "post" | "user" | "page" | "setting"
  title: string
  description?: string
  icon?: string
  url?: string
  action?: () => void
}

type SearchCategory = {
  name: string
  type: SearchResult["type"]
  results: SearchResult[]
}

type CommandSearchOptions = {
  placeholder?: string
  shortcut?: string[]
  initiallyOpen?: boolean
  onClose?: () => void
  onSearch?: (query: string) => void
  onSelect?: (result: SearchResult) => void
}

export function useCommandSearchOld(options: CommandSearchOptions = {}) {
  const {
    placeholder = "Search for anything...",
    shortcut = ["k"],
    initiallyOpen = false,
    onClose,
    onSearch,
    onSelect,
  } = options

  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [results, setResults] = useState<SearchCategory[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Mock search data - in a real app, this would come from an API
  const mockSearch = useCallback(async (searchQuery: string): Promise<SearchCategory[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()

    // Mock venues
    const venues = [
      {
        id: "venue-1",
        type: "venue" as const,
        title: "The Echo Lounge",
        description: "Live music venue in Los Angeles",
        url: "/venues/echo-lounge",
      },
      {
        id: "venue-2",
        type: "venue" as const,
        title: "Sunset Theater",
        description: "Performance space in Nashville",
        url: "/venues/sunset-theater",
      },
      {
        id: "venue-3",
        type: "venue" as const,
        title: "Blue Note Jazz Club",
        description: "Jazz venue in New York",
        url: "/venues/blue-note",
      },
    ].filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))

    // Mock events
    const events = [
      {
        id: "event-1",
        type: "event" as const,
        title: "Summer Jam Festival",
        description: "June 15, 2025",
        url: "/events/summer-jam",
      },
      {
        id: "event-2",
        type: "event" as const,
        title: "Midnight Echo Album Release",
        description: "June 22, 2025",
        url: "/events/midnight-echo",
      },
      {
        id: "event-3",
        type: "event" as const,
        title: "Jazz Night",
        description: "Weekly event, every Friday",
        url: "/events/jazz-night",
      },
    ].filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))

    // Mock artists
    const artists = [
      {
        id: "artist-1",
        type: "artist" as const,
        title: "Sarah Williams",
        description: "Vocalist, Midnight Echo",
        url: "/artists/sarah-williams",
      },
      {
        id: "artist-2",
        type: "artist" as const,
        title: "Jazz Quartet",
        description: "Jazz ensemble",
        url: "/artists/jazz-quartet",
      },
      {
        id: "artist-3",
        type: "artist" as const,
        title: "The Soundwaves",
        description: "Indie rock band",
        url: "/artists/soundwaves",
      },
    ].filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))

    // Mock users
    const users = [
      {
        id: "user-1",
        type: "user" as const,
        title: "Alex Johnson",
        description: "Venue Manager",
        url: "/users/alex-johnson",
      },
      { id: "user-2", type: "user" as const, title: "Jamie Smith", description: "Artist", url: "/users/jamie-smith" },
      {
        id: "user-3",
        type: "user" as const,
        title: "Taylor Wilson",
        description: "Event Promoter",
        url: "/users/taylor-wilson",
      },
    ].filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))

    // Mock pages
    const pages = [
      {
        id: "page-1",
        type: "page" as const,
        title: "Dashboard",
        description: "Your personal dashboard",
        url: "/dashboard",
      },
      { id: "page-2", type: "page" as const, title: "Calendar", description: "Event calendar", url: "/calendar" },
      {
        id: "page-3",
        type: "page" as const,
        title: "Analytics",
        description: "Performance metrics",
        url: "/analytics",
      },
    ].filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))

    // Mock settings
    const settings = [
      {
        id: "setting-1",
        type: "setting" as const,
        title: "Profile Settings",
        description: "Update your profile",
        url: "/settings/profile",
      },
      {
        id: "setting-2",
        type: "setting" as const,
        title: "Notification Settings",
        description: "Manage notifications",
        url: "/settings/notifications",
      },
      {
        id: "setting-3",
        type: "setting" as const,
        title: "Account Settings",
        description: "Manage your account",
        url: "/settings/account",
      },
    ].filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))

    // Construct categories with results
    const categories: SearchCategory[] = []

    if (venues.length > 0) {
      categories.push({ name: "Venues", type: "venue", results: venues })
    }

    if (events.length > 0) {
      categories.push({ name: "Events", type: "event", results: events })
    }

    if (artists.length > 0) {
      categories.push({ name: "Artists", type: "artist", results: artists })
    }

    if (users.length > 0) {
      categories.push({ name: "Users", type: "user", results: users })
    }

    if (pages.length > 0) {
      categories.push({ name: "Pages", type: "page", results: pages })
    }

    if (settings.length > 0) {
      categories.push({ name: "Settings", type: "setting", results: settings })
    }

    return categories
  }, [])

  // Handle search
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery)
      setActiveIndex(0)

      if (onSearch) {
        onSearch(searchQuery)
      }

      if (searchQuery.trim()) {
        setLoading(true)
        try {
          const searchResults = await mockSearch(searchQuery)
          setResults(searchResults)
        } catch (error) {
          console.error("Search error:", error)
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
      }
    },
    [mockSearch, onSearch],
  )

  // Get all results flattened into a single array
  const flattenedResults = results.flatMap((category) => category.results)

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (onSelect) {
        onSelect(result)
      }

      if (result.action) {
        result.action()
      } else if (result.url) {
        router.push(result.url)
      }

      setIsOpen(false)
      setQuery("")
      setResults([])
    },
    [onSelect, router],
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // If dialog is not open and user presses the shortcut key with Cmd/Ctrl, open it
      if (!isOpen && (e.metaKey || e.ctrlKey) && shortcut.includes(e.key.toLowerCase())) {
        e.preventDefault()
        setIsOpen(true)
        return
      }

      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev < flattenedResults.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flattenedResults.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (flattenedResults[activeIndex]) {
            handleSelect(flattenedResults[activeIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          if (onClose) onClose()
          break
      }
    },
    [isOpen, shortcut, flattenedResults, activeIndex, handleSelect, onClose],
  )

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Close dialog handler
  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setResults([])
    if (onClose) onClose()
  }, [onClose])

  // Toggle dialog handler
  const toggleDialog = useCallback(() => {
    setIsOpen((prev) => !prev)
    if (!isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  return {
    isOpen,
    query,
    results,
    loading,
    activeIndex,
    inputRef,
    setIsOpen,
    setQuery: handleSearch,
    handleSelect,
    closeDialog,
    toggleDialog,
    placeholder,
  }
}

export function useCommandSearchNew() {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)

    // Focus the input when opening
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isOpen])

  return {
    isOpen,
    setIsOpen,
    toggle,
    inputRef,
  }
}
