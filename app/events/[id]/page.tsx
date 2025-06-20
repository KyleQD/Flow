"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, DollarSign, Share2, ArrowLeft, Minus, Plus, Copy, Facebook, Twitter, Linkedin } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  venue: string
  capacity: number
  ticketPrice: number
  category: string
  coverImage: string
  isPublic: boolean
  status: "upcoming" | "past" | "draft"
  views: number
  ticketsSold: number
  revenue: number
}

// Mock data - replace with actual API call
const getEvent = (id: string): Event => ({
  id,
  title: "Summer Jam Festival 2025",
  description: "The biggest music festival of the year with an amazing lineup of artists. Join us for an unforgettable experience featuring top performers, amazing food, and great vibes. Don't miss out on the event of the summer!",
  date: "2025-07-15",
  time: "14:00",
  location: "Central Park, New York",
  venue: "Main Stage",
  capacity: 5000,
  ticketPrice: 49.99,
  category: "Festival",
  coverImage: "/placeholder.svg",
  isPublic: true,
  status: "upcoming",
  views: 124,
  ticketsSold: 0,
  revenue: 0
})

export default function EventPreviewPage() {
  const params = useParams()
  const event = getEvent(params.id as string)
  const [ticketQuantity, setTicketQuantity] = React.useState(1)
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false)
  const [isShareOpen, setIsShareOpen] = React.useState(false)
  const [checkoutData, setCheckoutData] = React.useState({
    name: "",
    email: "",
    phone: ""
  })

  const formattedDate = format(new Date(`${event.date}T${event.time}`), "MMM d, yyyy")
  const formattedTime = format(new Date(`${event.date}T${event.time}`), "h:mm a")

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleQuantityChange = (delta: number) => {
    const newQuantity = ticketQuantity + delta
    if (newQuantity >= 1 && newQuantity <= event.capacity - event.ticketsSold) {
      setTicketQuantity(newQuantity)
    }
  }

  const handleCheckoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Here you would typically handle the checkout process
    console.log("Processing checkout:", {
      ...checkoutData,
      ticketQuantity,
      totalAmount: ticketQuantity * event.ticketPrice
    })
  }

  const handleShare = async (platform: string) => {
    const shareText = `Check out ${event.title} on ${formattedDate}!`
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(shareUrl)

    let shareLink = ''
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl)
          toast.success("Link copied to clipboard!")
          return
        } catch (err) {
          toast.error("Failed to copy link")
          return
        }
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400')
    }
    setIsShareOpen(false)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
      </div>

      <div className="aspect-[2/1] rounded-lg overflow-hidden mb-8">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex items-center text-sm text-purple-400">
              <span className="px-2 py-1 bg-purple-600/20 rounded">
                {event.category}
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400">{event.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  <p className="text-sm">{formattedTime}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">{event.venue}</p>
                  <p className="text-sm">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-400">
                <Users className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">{event.capacity} attendees</p>
                  <p className="text-sm">Maximum capacity</p>
                </div>
              </div>
              <div className="flex items-center text-gray-400">
                <DollarSign className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">${event.ticketPrice.toFixed(2)}</p>
                  <p className="text-sm">Per ticket</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="bg-[#13151c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Get Tickets</CardTitle>
              <CardDescription className="text-gray-400">
                Secure your spot at this amazing event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Standard Ticket</span>
                <span className="text-white">${event.ticketPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Available</span>
                <span className="text-white">{event.capacity - event.ticketsSold} tickets</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                <span className="text-gray-400">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={ticketQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-white w-8 text-center">{ticketQuantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={ticketQuantity >= event.capacity - event.ticketsSold}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-bold">
                  ${(ticketQuantity * event.ticketPrice).toFixed(2)}
                </span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setIsCheckoutOpen(true)}
              >
                Buy Tickets
              </Button>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Event
          </Button>

          <Card className="bg-[#13151c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Views</span>
                <span className="text-white">{event.views}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tickets Sold</span>
                <span className="text-white">{event.ticketsSold}/{event.capacity}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Enter your details to purchase {ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''} for {event.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckoutSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={checkoutData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={checkoutData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={checkoutData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="text-white font-bold">
                    ${(ticketQuantity * event.ticketPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Complete Purchase
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
            <DialogDescription>
              Share this event with your friends and network
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleShare('linkedin')}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleShare('copy')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
          <div className="flex items-center space-x-2 border-t border-gray-800 pt-4">
            <Input
              value={shareUrl}
              readOnly
              className="bg-[#1a1c23] border-gray-800"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare('copy')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 