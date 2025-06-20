"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

interface ProfileInfoModalProps {
  isOpen: boolean
  onClose: () => void
  profileType: string
}

export default function ProfileInfoModal({ isOpen, onClose, profileType }: ProfileInfoModalProps) {
  const getProfileContent = () => {
    switch (profileType) {
      case "artist":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Artist Profile — $20/month</DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                For artists ready to take control of their career.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-gray-200 space-y-4">
              <p>
                Whether you're a solo act, band, or DJ—Tourify gives you the full toolkit to manage shows, sell merch
                and tickets, and grow your audience.
              </p>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Features include:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Artist dashboard to manage bookings, setlists, and tour info</li>
                  <li>Merch creation + sales with built-in fulfillment</li>
                  <li>Ticketing capabilities through Tourify or partner integrations</li>
                  <li>Listener data insights (heatmaps, engagement metrics, etc.)</li>
                  <li>EPK generator for instant press kits</li>
                  <li>Collaborate with venues and tour crews in one place</li>
                </ul>
              </div>
              <p className="font-medium text-[#a5b4fc]">Manage your brand. Monetize your audience. Book your future.</p>
            </div>
          </>
        )
      case "venue":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Venue Profile — $20/month</DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                For spaces that host unforgettable shows.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-gray-200 space-y-4">
              <p>
                From bars to arenas, Tourify gives venues powerful tools to streamline bookings, promote events, and
                connect with talent.
              </p>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Features include:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Venue dashboard with specs, booking requirements, and media</li>
                  <li>Direct messaging and event planning with artists and crews</li>
                  <li>Ticketing setup with full sales tracking</li>
                  <li>Merchandising options (in-house + artist consignment)</li>
                  <li>File sharing, scheduling tools, and agreement templates</li>
                  <li>Calendar sync and availability management</li>
                </ul>
              </div>
              <p className="font-medium text-[#a5b4fc]">Simplify booking. Fill your calendar. Grow your rep.</p>
            </div>
          </>
        )
      case "industry":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Industry Profile — Free to Join</DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                For the people who make shows happen.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-gray-200 space-y-4">
              <p>
                Photographers, dancers, A/V techs, stagehands, lighting designers — the live events world runs on your
                skills. Tourify helps you build your career, get hired, and stay connected.
              </p>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Features include:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Build a professional portfolio with media, certifications, and bio</li>
                  <li>Apply to jobs posted by venues, artists, and managers</li>
                  <li>Earn badges for experience and specialties</li>
                  <li>Collect endorsements from past collaborators</li>
                  <li>Stay in touch with teams from past events</li>
                </ul>
              </div>
              <p className="font-medium text-[#a5b4fc]">Show your work. Build your rep. Get hired.</p>
            </div>
          </>
        )
      case "general":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">General Profile — Always Free</DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                For fans, explorers, and community builders.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-gray-200 space-y-4">
              <p>
                Music lovers can sign up for free to discover artists, connect with other fans, and share the moments
                that make live music unforgettable.
              </p>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Features include:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Personalized discovery of artists and events</li>
                  <li>Join or create fan groups and communities</li>
                  <li>Share setlists, playlists, photos, and reactions</li>
                  <li>Follow your favorite venues, artists, and scenes</li>
                  <li>Build your live music identity</li>
                </ul>
              </div>
              <p className="font-medium text-[#a5b4fc]">No cost. No noise. Just real connection.</p>
            </div>
          </>
        )
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Tourify Profiles</DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                Your digital home in the live music world.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-gray-200 space-y-4">
              <p>
                Tourify is more than an event platform — it's a living network of artists, venues, fans, and
                behind-the-scenes professionals working together to make unforgettable shows happen. With customizable
                profiles for everyone in the scene, Tourify helps you organize, connect, promote, and grow — all in one
                place.
              </p>
              <p className="font-medium text-center text-[#a5b4fc] mt-6">
                Ready to find your place in the live music ecosystem?
              </p>
            </div>
          </>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#171923] border border-gray-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {getProfileContent()}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] hover:from-[#5b21b6] hover:to-[#4338ca] border-0"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
