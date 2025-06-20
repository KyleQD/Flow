"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type SearchableItem = {
  id: string
  name: string
  description?: string
  category: string
  url?: string
  icon?: string
  keywords?: string[]
  action?: () => void
}

export type CommandMenuOptions = {
  shortcut?: {
    modifiers: ("ctrl" | "alt" | "shift" | "meta")[]
    key: string
  }
  placeholder?: string
  items?: SearchableItem[]
}

const defaultItems: SearchableItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Go to main dashboard",
    category: "navigation",
    url: "/dashboard",
    icon: "layout-dashboard",
    keywords: ["home", "main", "overview"],
  },
  {
    id: "venues",
    name: "Venues",
    description: "Manage your venues",
    category: "navigation",
    url: "/venues",
    icon: "building",
    keywords: ["locations", "places", "manage"],
  },
  {
    id: "events",
    name: "Events",
    description: "View upcoming events",
    category: "navigation",
    url: "/events",
    icon: "calendar",
    keywords: ["shows", "gigs", "concerts", "schedule"],
  },
  {
    id: "messages",
    name: "Messages",
    description: "Check your messages",
    category: "communication",
    url: "/messages",
    icon: "message-square",
    keywords: ["chat", "inbox", "communication"],
  },
  {
    id: "profile",
    name: "Profile",
    description: "View your profile",
    category: "account",
    url: "/profile",
    icon: "user",
    keywords: ["account", "settings", "personal"],
  },
  {
    id: "settings",
    name: "Settings",
    description: "Adjust your settings",
    category: "account",
    url: "/settings",
    icon: "settings",
    keywords: ["preferences", "options", "configure"],
  },
  {
    id: "help",
    name: "Help & Support",
    description: "Get help with Tourify",
    category: "support",
    url: "/help",
    icon: "help-circle",
    keywords: ["support", "assistance", "guide", "faq"],
  },
  {
    id: "network",
    name: "Network",
    description: "View your professional network",
    category: "social",
    url: "/network",
    icon: "users",
    keywords: ["connections", "contacts", "professionals"],
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "View performance metrics",
    category: "data",
    url: "/analytics",
    icon: "bar-chart",
    keywords: ["stats", "metrics", "performance", "data"],
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "View your schedule",
    category: "planning",
    url: "/calendar",
    icon: "calendar",
    keywords: ["schedule", "dates", "events", "planning"],
  },
]

export function useCommandMenu(options: CommandMenuOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<SearchableItem[]>(options.items || defaultItems)
  const router = useRouter()

  const shortcut = options.shortcut || {
    modifiers: ["meta"],
    key: "k",
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchQuery("")
      setFilteredItems(options.items || defaultItems)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      setFilteredItems(options.items || defaultItems)
      return
    }

    const lowerQuery = query.toLowerCase()
    const filtered = (options.items || defaultItems).filter((item) => {
      const matchesName = item.name.toLowerCase().includes(lowerQuery)
      const matchesDescription = item.description?.toLowerCase().includes(lowerQuery)
      const matchesKeywords = item.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))

      return matchesName || matchesDescription || matchesKeywords
    })

    setFilteredItems(filtered)
  }

  const handleSelect = (item: SearchableItem) => {
    setIsOpen(false)

    if (item.action) {
      item.action()
    } else if (item.url) {
      router.push(item.url)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if all required modifier keys are pressed
      const modifiersPressed = shortcut.modifiers.every((modifier) => {
        if (modifier === "ctrl" && !e.ctrlKey) return false
        if (modifier === "alt" && !e.altKey) return false
        if (modifier === "shift" && !e.shiftKey) return false
        if (modifier === "meta" && !e.metaKey) return false
        return true
      })

      // Check if the key matches
      const keyPressed = e.key.toLowerCase() === shortcut.key.toLowerCase()

      if (modifiersPressed && keyPressed) {
        e.preventDefault()
        toggleMenu()
      }

      // Close on escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, shortcut])

  return {
    isOpen,
    toggleMenu,
    searchQuery,
    handleSearch,
    filteredItems,
    handleSelect,
    placeholder: options.placeholder || "Search for anything...",
  }
}
