"use client"

import { useState, useCallback, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"

type SearchResult = {
  id: string
  type: "event" | "booking" | "user" | "document" | "team" | "venue"
  title: string
  subtitle?: string
  icon?: string
  url?: string
  date?: string
  image?: string
}

export function useSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => !prev)
    if (!isOpen) {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setResults([])
  }, [])

  // Mock search function - in a real app, this would call an API
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    const performSearch = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock results based on query
        const mockResults: SearchResult[] = [
          {
            id: "event-1",
            type: "event",
            title: "Summer Jam Festival",
            subtitle: "June 15, 2025",
            icon: "calendar",
            url: "/events/event-1",
            date: "2025-06-15",
          },
          {
            id: "booking-1",
            type: "booking",
            title: "Electronic Music Showcase",
            subtitle: "Pending request from Pulse Productions",
            icon: "clock",
            url: "/bookings/req-1",
            date: "2025-07-10",
          },
          {
            id: "team-1",
            type: "team",
            title: "Alex Johnson",
            subtitle: "Venue Manager",
            icon: "users",
            url: "/team/team-1",
            image: "/abstract-aj.png",
          },
          {
            id: "doc-1",
            type: "document",
            title: "Stage Plot & Technical Rider",
            subtitle: "PDF • 2.4 MB",
            icon: "file-text",
            url: "/documents/doc-1",
          },
        ].filter(
          (item) =>
            item.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(debouncedQuery.toLowerCase())),
        )

        setResults(mockResults)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  return {
    isOpen,
    query,
    setQuery,
    results,
    isLoading,
    toggleSearch,
    closeSearch,
  }
}
