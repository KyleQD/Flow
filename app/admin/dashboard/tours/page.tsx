"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  CalendarRange, 
  MapPin, 
  Users, 
  ArrowUpRight, 
  Clock,
  Settings,
  Edit3,
  Eye,
  Play,
  Pause,
  MoreVertical,
  Rocket,
  Sparkles
} from "lucide-react"
import { TourWizard } from "./tour-wizard/tour-wizard"
import { TourCustomizer } from "./tour-customizer/tour-customizer"

const mockTours = [
  {
    id: "1",
    name: "West Coast Summer Tour",
    status: "active",
    startDate: "2023-07-15",
    endDate: "2023-07-30",
    description: "Epic summer tour across the west coast featuring major festivals",
    budget: 500000,
    events: [
      { id: "e1", type: "show", city: "Los Angeles, CA", venue: "Staples Center", date: "2023-07-15", capacity: 20000 },
      { id: "e2", type: "travel", from: "Los Angeles, CA", to: "San Francisco, CA", date: "2023-07-16" },
      { id: "e3", type: "show", city: "San Francisco, CA", venue: "Chase Center", date: "2023-07-18", capacity: 18000 },
      { id: "e4", type: "rest", city: "San Francisco, CA", date: "2023-07-19" },
      { id: "e5", type: "travel", from: "San Francisco, CA", to: "Seattle, WA", date: "2023-07-21" },
      { id: "e6", type: "show", city: "Seattle, WA", venue: "Climate Pledge Arena", date: "2023-07-23", capacity: 17000 },
    ],
    locations: [
      { id: "l1", name: "Los Angeles", city: "Los Angeles, CA", venue: "Staples Center", capacity: 20000, type: "arena" },
      { id: "l2", name: "San Francisco", city: "San Francisco, CA", venue: "Chase Center", capacity: 18000, type: "arena" },
      { id: "l3", name: "Seattle", city: "Seattle, WA", venue: "Climate Pledge Arena", capacity: 17000, type: "arena" },
    ],
    crew: [
      { id: "c1", name: "John Smith", role: "Tour Manager", department: "Management" },
      { id: "c2", name: "Sarah Jones", role: "Production Manager", department: "Production" },
    ],
    venues: ["Staples Center", "Chase Center", "Climate Pledge Arena"],
    numEvents: 3,
    numCities: 3,
    numAttendees: 55000,
    createdAt: "2023-06-01T10:00:00Z",
  },
]

const TABS = [
  { key: "active", label: "Active Tours" },
  { key: "upcoming", label: "Upcoming Tours" },
  { key: "completed", label: "Completed Tours" },
  { key: "planning", label: "Planning" },
]

function filterTours(tours: any[], tab: string) {
  if (tab === "active") return tours.filter(t => t.status === "active")
  if (tab === "upcoming") return tours.filter(t => t.status === "upcoming")
  if (tab === "completed") return tours.filter(t => t.status === "completed")
  if (tab === "planning") return tours.filter(t => t.status === "planning")
  return tours
}

export default function ToursPage() {
  const [tab, setTab] = React.useState("active")
  const [tours, setTours] = React.useState(mockTours)
  const [isWizardOpen, setIsWizardOpen] = React.useState(false)
  const [selectedTour, setSelectedTour] = React.useState<any>(null)
  const [isCustomizerOpen, setIsCustomizerOpen] = React.useState(false)

  function handleCreateTour() {
    setIsWizardOpen(true)
  }

  function handleTourCreated(newTour: any) {
    setTours(prev => [...prev, newTour])
    // Optionally switch to the planning tab to show the new tour
    if (newTour.status === "planning") {
      setTab("planning")
    }
  }

  function handleTourSelect(tour: any) {
    setSelectedTour(tour)
    setIsCustomizerOpen(true)
  }

  return (
    <div className="container mx-auto py-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20">
      {/* Enhanced Header */}
      <div className="relative mb-12">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 bg-slate-900/30 backdrop-blur-sm border border-purple-500/20 rounded-3xl">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <ArrowUpRight className="h-8 w-8 text-purple-400" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Tour Management
              </h1>
            </div>
            <p className="text-slate-400 text-lg">Plan, manage, and track multi-city tours and events</p>
            <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
              <span>{tours.length} Total Tours</span>
              <span>•</span>
              <span>{tours.filter(t => t.status === 'active').length} Active</span>
              <span>•</span>
              <span>{tours.reduce((sum, tour) => sum + tour.numAttendees, 0).toLocaleString()} Total Attendees</span>
            </div>
          </div>
          
          <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Create New Tour
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-full p-0 border-0 bg-transparent">
              <TourWizard 
                onTourCreated={handleTourCreated}
                onClose={() => setIsWizardOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full mb-8">
        <TabsList className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-1 flex gap-2 w-fit">
          {TABS.map(t => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-3 rounded-xl text-base font-medium text-slate-300 transition-all duration-200"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {TABS.map(t => (
          <TabsContent key={t.key} value={t.key} className="w-full mt-8">
            <TourCardGrid 
              tours={filterTours(tours, t.key)} 
              onAddNewTour={handleCreateTour}
              onTourSelect={handleTourSelect}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Enhanced Active Tour Timeline */}
      <div className="mt-16">
        <ActiveTourTimeline tour={tours.find(t => t.status === "active")} />
      </div>

      {/* Tour Customizer Modal */}
      <Dialog open={isCustomizerOpen} onOpenChange={setIsCustomizerOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 border-0 bg-transparent">
          {selectedTour && (
            <TourCustomizer 
              tour={selectedTour}
              onClose={() => setIsCustomizerOpen(false)}
              onTourUpdate={(updatedTour: any) => {
                setTours(prev => prev.map(t => t.id === updatedTour.id ? updatedTour : t))
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TourCardGrid({ tours, onAddNewTour, onTourSelect }: { 
  tours: any[], 
  onAddNewTour: () => void,
  onTourSelect: (tour: any) => void 
}) {
  if (!tours.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-purple-500/30 rounded-2xl bg-slate-900/20 backdrop-blur-sm"
      >
        <div className="text-slate-400 mb-4 text-center">
          <Rocket className="h-12 w-12 mx-auto mb-3 text-purple-400/50" />
          <p className="text-lg font-medium">No tours found</p>
          <p className="text-sm">Create your first tour to get started</p>
        </div>
        <Button 
          variant="outline" 
          className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-200"
          onClick={onAddNewTour}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Tour
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence>
        {tours.map((tour, index) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <TourCard tour={tour} onSelect={() => onTourSelect(tour)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function TourCard({ tour, onSelect }: { tour: any, onSelect: () => void }) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Card 
      className="group relative overflow-hidden bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2 group-hover:text-purple-200 transition-colors">
            <ArrowUpRight className="h-5 w-5 text-purple-400" />
            {tour.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`
              text-xs px-3 py-1 rounded-full font-medium capitalize transition-all
              ${tour.status === 'active' ? 'bg-green-900/80 text-green-300' :
                tour.status === 'planning' ? 'bg-purple-900/80 text-purple-300' :
                tour.status === 'upcoming' ? 'bg-blue-900/80 text-blue-300' :
                'bg-gray-900/80 text-gray-300'}
            `}>
              {tour.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                // Handle edit action
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {tour.description && (
          <p className="text-sm text-slate-400 mt-2 line-clamp-2">{tour.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <CalendarRange className="h-4 w-4" />
          {tour.startDate} - {tour.endDate}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="h-4 w-4" />
            {tour.numCities} cities
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="h-4 w-4" />
            {tour.numAttendees?.toLocaleString()} attendees
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock className="h-4 w-4" />
          {tour.numEvents} events
        </div>

        {/* Budget info */}
        {tour.budget && (
          <div className="pt-3 border-t border-slate-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Budget</span>
              <span className="text-purple-400 font-medium">${tour.budget.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <motion.div 
          className="flex gap-2 pt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            <Settings className="h-3 w-3 mr-1" />
            Customize
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-slate-600 text-slate-400 hover:bg-slate-600 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              // Handle view action
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}

function ActiveTourTimeline({ tour }: { tour: any }) {
  if (!tour) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="text-2xl font-bold text-white flex items-center gap-3">
          <CalendarRange className="h-6 w-6 text-purple-400" />
          Active Tour Timeline
        </div>
        <Badge className="bg-green-900/50 text-green-300 px-4 py-2">
          <Play className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>
      
      <div className="relative pl-8">
        <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/60 to-slate-700/30 rounded-full" />
        
        {tour.events.map((event: any, idx: number) => (
          <motion.div 
            key={event.id} 
            className="flex items-start mb-8 relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <div className="absolute left-0 top-1.5">
              <span className={`
                block w-3 h-3 rounded-full border-2 border-slate-950
                ${event.type === "show" ? "bg-purple-400" : 
                  event.type === "travel" ? "bg-blue-400" : 
                  event.type === "rest" ? "bg-yellow-400" : "bg-slate-400"}
              `} />
            </div>
            
            <div className="ml-6 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-white capitalize">
                  {event.type === "show" ? `Show in ${event.city}` :
                   event.type === "travel" ? `Travel: ${event.from} → ${event.to}` :
                   event.type === "rest" ? `Rest Day in ${event.city}` : event.type}
                </h4>
                <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                  {event.date}
                </Badge>
              </div>
              
              {event.venue && (
                <p className="text-slate-400 text-sm mb-1">{event.venue}</p>
              )}
              
              {event.capacity && (
                <p className="text-purple-400 text-sm font-medium">
                  Capacity: {event.capacity.toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
} 