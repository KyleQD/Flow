"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, Bell, Moon, Sun, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCommandSearch } from "@/hooks/venue/use-command-search"
import { useTheme } from "@/hooks/use-theme"

interface VenueHeaderProps {
  venueName: string
  venueType?: string
}

export function VenueHeader({ venueName, venueType = "Music Venue" }: VenueHeaderProps) {
  const pathname = usePathname()
  const { toggle: toggleCommandMenu } = useCommandSearch()
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get current page title based on pathname
  const getPageTitle = () => {
    const path = pathname.split("/").pop() || "dashboard"
    return (
      {
        dashboard: "Venue Management Dashboard",
        events: "Events Management",
        bookings: "Booking Management",
        team: "Team Management",
        analytics: "Analytics Dashboard",
        settings: "Venue Settings",
        documents: "Document Management",
        gallery: "Media Gallery",
      }[path] || "Venue Management"
    )
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-gray-800 bg-gray-900 transition-shadow duration-200",
        isScrolled && "shadow-md",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <div className="hidden lg:block">
            <Image src="/images/tourify-logo-white.png" alt="Tourify" width={120} height={40} className="h-8 w-auto" />
          </div>

          <div className="ml-4 lg:ml-8">
            <h1 className="text-2xl font-bold text-white">{venueName}</h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-900 text-purple-100">{venueType}</Badge>
              <p className="text-sm text-gray-400">{getPageTitle()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 bg-gray-800 border-gray-700 pl-9 text-white placeholder:text-gray-400 focus:border-gray-600"
              onClick={toggleCommandMenu}
              readOnly
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded border border-gray-700 bg-gray-800 px-1.5 font-mono text-xs text-gray-400">
              ⌘K
            </kbd>
          </div>

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={toggleCommandMenu}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white hover:bg-gray-800">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 p-0 text-xs text-white">
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* View public profile */}
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 border-gray-700 text-white hover:bg-gray-800 hover:text-white"
            asChild
          >
            <Link href={`/venue/${encodeURIComponent(venueName)}`}>
              <Eye className="h-4 w-4" />
              <span>View Public Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
