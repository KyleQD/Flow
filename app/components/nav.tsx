"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bell, MessageSquare, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeaturesDialog } from "@/components/features-dialog"
import { useUser } from "@/hooks/use-user"

export function Nav() {
  const pathname = usePathname()
  const { user } = useUser()
  const [showFeatures, setShowFeatures] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#13151c]">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <Image
              src="/tourify-logo.png"
              alt="Tourify"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => setShowFeatures(true)}
          >
            <Grid className="h-5 w-5 mr-2" />
            All Features
          </Button>
        </div>

        <div className="flex-1" />

        <nav className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-purple-600 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profile_picture_url} alt={user?.display_name} />
            <AvatarFallback>{user?.display_name?.[0]}</AvatarFallback>
          </Avatar>
        </nav>
      </div>

      <FeaturesDialog 
        open={showFeatures} 
        onOpenChange={setShowFeatures} 
      />
    </header>
  )
} 