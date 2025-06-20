"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Calendar,
  Clock,
  FileText,
  HelpCircle,
  Home,
  ImageIcon,
  LogOut,
  MessageSquare,
  Music,
  Settings,
  Ticket,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"

interface VenueOwnerSidebarProps {
  venue: any
  isOpen: boolean
  onClose: () => void
  onTabChange: (tab: string) => void
  activeTab: string
}

export function VenueOwnerSidebar({ venue, isOpen, onClose, onTabChange, activeTab }: VenueOwnerSidebarProps) {
  const [notifications, setNotifications] = useState(3)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { id: "bookings", label: "Bookings", icon: <Clock className="h-5 w-5" /> },
    { id: "events", label: "Events", icon: <Calendar className="h-5 w-5" /> },
    { id: "team", label: "Team", icon: <Users className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const resourceItems = [
    { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
    { id: "gallery", label: "Gallery", icon: <ImageIcon className="h-5 w-5" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 w-64 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Close button (mobile only) */}
        <button className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="p-4 flex justify-center border-b border-gray-800">
          <Link href="/">
            <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-8" />
          </Link>
        </div>

        {/* Venue info */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={venue.avatar || "/placeholder.svg"} alt={venue.name} />
              <AvatarFallback>{venue.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-white truncate">{venue.name}</h3>
              <Badge variant="outline" className="mt-1 text-xs bg-purple-900/20 text-purple-400 border-purple-800">
                {venue.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === item.id ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                }`}
                onClick={() => {
                  onTabChange(item.id)
                  if (window.innerWidth < 768) {
                    onClose()
                  }
                }}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 mb-2 px-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</h4>
          </div>
          <div className="space-y-1">
            {resourceItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white"
                onClick={() => {
                  onTabChange(item.id)
                  if (window.innerWidth < 768) {
                    onClose()
                  }
                }}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 mb-2 px-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tourify</h4>
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <Music className="h-5 w-5 mr-2" />
              <span>Music</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <Ticket className="h-5 w-5 mr-2" />
              <span>Tickets</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <HelpCircle className="h-5 w-5 mr-2" />
              <span>Help</span>
            </Button>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center justify-center mb-4">
            <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-6" />
          </div>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}
