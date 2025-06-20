import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Rocket, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Upload,
  Plus,
  Eye,
  X,
  GripVertical,
  Edit3,
  Save,
  ArrowRight,
  ArrowLeft,
  Zap
} from "lucide-react"
import { z } from "zod"
import { tourBasicInfoSchema, TourBasicInfo } from "./tour-wizard.schema"
import { LocationsStep } from "./steps/locations-step"
import { EventsStep } from "./steps/events-step"
import { TeamStep } from "./steps/team-step"

const STEPS = [
  { key: "quick-start", label: "Quick Start", icon: Rocket },
  { key: "locations", label: "Locations & Venues", icon: MapPin },
  { key: "events", label: "Events", icon: Calendar },
  { key: "team", label: "Team & Crew", icon: Users },
  { key: "launch", label: "Launch", icon: CheckCircle2 },
]

interface TourWizardProps {
  onTourCreated?: (tour: any) => void
  onClose?: () => void
}

export function TourWizard({ onTourCreated, onClose }: TourWizardProps) {
  const [step, setStep] = React.useState(0)
  const [entryMode, setEntryMode] = React.useState<"manual" | "import" | "ai-assist">("manual")
  const [isCreating, setIsCreating] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  
  const form = useForm<TourBasicInfo>({
    resolver: zodResolver(tourBasicInfoSchema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", budget: 0 },
    mode: "onChange",
  })
  
  const [locations, setLocations] = React.useState<any[]>([])
  const [events, setEvents] = React.useState<any[]>([])
  const [crew, setCrew] = React.useState<any[]>([])

  const progressPercentage = ((step + 1) / STEPS.length) * 100

  function handleNext(data?: any) {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    }
  }

  function handlePrev() {
    if (step > 0) {
      setStep(s => s - 1)
    }
  }

  // Enhanced handlers with better UX
  function handleAddLocation() {
    const newLocation = {
      id: Date.now(),
      name: "New Location",
      city: "",
      venue: "",
      capacity: 0,
      type: "venue"
    }
    setLocations(locs => [...locs, newLocation])
  }

  function handleImportLocations(files: FileList) {
    // Enhanced import with loading state
    const newLocation = {
      id: Date.now(),
      name: "Imported Location",
      city: "Sample City",
      venue: "Sample Venue",
      capacity: 5000,
      type: "venue"
    }
    setLocations(locs => [...locs, newLocation])
  }

  function handleAddEvent() {
    const newEvent = {
      id: Date.now(),
      name: "New Event",
      type: "show",
      date: "",
      venue: "",
      capacity: 0
    }
    setEvents(evts => [...evts, newEvent])
  }

  function handleAddCrew() {
    const newCrew = {
      id: Date.now(),
      name: "New Crew Member",
      role: "",
      department: "",
      contact: ""
    }
    setCrew(c => [...c, newCrew])
  }

  async function handleCreateTour() {
    setIsCreating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newTour = {
      id: Date.now().toString(),
      name: form.getValues("name"),
      description: form.getValues("description"),
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
      budget: form.getValues("budget"),
      status: "planning",
      locations,
      events,
      crew,
      numEvents: events.length,
      numCities: locations.length,
      numAttendees: events.reduce((sum, event) => sum + (event.capacity || 0), 0),
      createdAt: new Date().toISOString(),
    }
    
    onTourCreated?.(newTour)
    setIsCreating(false)
    onClose?.()
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 0.95 }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.05),transparent_50%)] pointer-events-none" />
      
      <Card className="relative overflow-hidden rounded-3xl shadow-2xl bg-slate-950/98 backdrop-blur-xl border border-purple-500/20 w-full max-w-4xl mx-auto h-[85vh] flex flex-col">
        {/* Enhanced Header */}
        <div className="relative px-8 py-6 border-b border-purple-500/20 bg-gradient-to-r from-slate-950/90 to-purple-950/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Rocket className="h-8 w-8 text-purple-400" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Create New Tour
                </h2>
                <p className="text-slate-400 text-sm">Design your next unforgettable experience</p>
              </div>
            </div>
            
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Step {step + 1} of {STEPS.length}</span>
              <span className="text-purple-400 font-medium">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-slate-800 rounded-full overflow-hidden"
            />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mt-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isActive = i === step
                const isCompleted = i < step
                
                return (
                  <div key={s.key} className="flex flex-col items-center flex-1">
                    <div className={`
                      relative rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                      ${isActive 
                        ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/25 scale-110" 
                        : isCompleted 
                        ? "bg-purple-500/80 text-white border-purple-400" 
                        : "bg-slate-800 text-slate-400 border-slate-700"
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />
                      )}
                    </div>
                    <div className={`
                      mt-2 text-xs font-medium transition-colors duration-200 text-center max-w-20
                      ${isActive ? "text-purple-300" : "text-slate-500"}
                    `}>
                      {s.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {step === 0 && <QuickStartStep form={form} entryMode={entryMode} setEntryMode={setEntryMode} />}
              {step === 1 && (
                <LocationsStep
                  locations={locations}
                  onAdd={handleAddLocation}
                  onImport={handleImportLocations}
                  onExport={() => {}}
                  onBulkEdit={() => {}}
                />
              )}
              {step === 2 && (
                <EventsStep
                  events={events}
                  onAdd={handleAddEvent}
                  onImport={() => {}}
                  onExport={() => {}}
                  onBulkEdit={() => {}}
                />
              )}
              {step === 3 && (
                <TeamStep
                  crew={crew}
                  onAdd={handleAddCrew}
                  onImport={() => {}}
                  onExport={() => {}}
                  onBulkEdit={() => {}}
                />
              )}
              {step === 4 && (
                <LaunchStep 
                  form={form} 
                  locations={locations} 
                  events={events} 
                  crew={crew}
                  onPreview={() => setShowPreview(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="relative px-8 py-6 border-t border-purple-500/20 bg-gradient-to-r from-slate-950/90 to-purple-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrev}
                  className="border-slate-600 hover:border-purple-400 text-slate-300 hover:text-white transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {step === STEPS.length - 1 ? (
                <Button 
                  onClick={handleCreateTour}
                  disabled={isCreating}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-2 rounded-full font-bold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Creating Tour...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Launch Tour
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={form.handleSubmit(handleNext)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-2 rounded-full font-bold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tour Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-950 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Eye className="h-6 w-6 text-purple-400" />
              Tour Preview
            </DialogTitle>
          </DialogHeader>
          <TourPreview form={form} locations={locations} events={events} crew={crew} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Enhanced Quick Start Step Component
function QuickStartStep({ form, entryMode, setEntryMode }: {
  form: any
  entryMode: "manual" | "import" | "ai-assist"
  setEntryMode: (mode: "manual" | "import" | "ai-assist") => void
}) {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Entry Mode Selection */}
      <Card className="bg-slate-900/50 border border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Choose Your Creation Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={entryMode} 
            onValueChange={v => setEntryMode(v as typeof entryMode)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                value: "manual",
                label: "Manual Entry",
                description: "Build your tour step by step with guided assistance",
                icon: Edit3,
              },
              {
                value: "import",
                label: "Import Data",
                description: "Upload spreadsheets or existing tour data",
                icon: Upload,
              },
              {
                value: "ai-assist",
                label: "AI Assistant",
                description: "Let AI help create your tour based on your requirements",
                icon: Zap,
              },
            ].map((option) => {
              const Icon = option.icon
              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <label 
                    htmlFor={option.value}
                    className={`
                      block p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105
                      ${entryMode === option.value 
                        ? "border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/10" 
                        : "border-slate-700 bg-slate-900/30 hover:border-purple-500/50"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Icon className={`h-8 w-8 ${entryMode === option.value ? "text-purple-400" : "text-slate-400"}`} />
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.description}</div>
                    </div>
                  </label>
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Tour Details Form */}
      <Card className="bg-slate-900/50 border border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Tour Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Tour Name *</label>
              <Input 
                {...form.register("name")} 
                placeholder="e.g. Summer Festival Tour 2024"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
              />
              {form.formState.errors.name && (
                <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Budget (USD)</label>
              <Input 
                type="number"
                {...form.register("budget", { valueAsNumber: true })} 
                placeholder="500000"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Description</label>
            <Textarea 
              {...form.register("description")} 
              placeholder="Brief description of your tour..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/20 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Start Date *</label>
              <Input 
                type="date"
                {...form.register("startDate")} 
                className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-400 focus:ring-purple-400/20"
              />
              {form.formState.errors.startDate && (
                <p className="text-red-400 text-sm">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">End Date *</label>
              <Input 
                type="date"
                {...form.register("endDate")} 
                className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-400 focus:ring-purple-400/20"
              />
              {form.formState.errors.endDate && (
                <p className="text-red-400 text-sm">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Launch Step Component
function LaunchStep({ form, locations, events, crew, onPreview }: {
  form: any
  locations: any[]
  events: any[]
  crew: any[]
  onPreview: () => void
}) {
  const tourData = form.getValues()
  
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 mb-4">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">Ready to Launch!</h3>
        <p className="text-slate-400">Review your tour details before launching</p>
      </div>

      {/* Tour Summary */}
      <Card className="bg-slate-900/50 border border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Tour Summary
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{locations.length}</div>
              <div className="text-sm text-slate-400">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{events.length}</div>
              <div className="text-sm text-slate-400">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{crew.length}</div>
              <div className="text-sm text-slate-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                ${tourData.budget?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-slate-400">Budget</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Details */}
      <Card className="bg-slate-900/50 border border-purple-500/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white">{tourData.name || "Untitled Tour"}</h4>
              <p className="text-slate-400 text-sm">{tourData.description || "No description provided"}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{tourData.startDate} - {tourData.endDate}</span>
              <Badge variant="secondary" className="bg-purple-950/50 text-purple-300">
                Planning
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Tour Preview Component
function TourPreview({ form, locations, events, crew }: {
  form: any
  locations: any[]
  events: any[]
  crew: any[]
}) {
  const tourData = form.getValues()
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-slate-400">Name</div>
              <div className="text-white font-medium">{tourData.name || "Untitled"}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Description</div>
              <div className="text-white">{tourData.description || "No description"}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-400">Start Date</div>
                <div className="text-white">{tourData.startDate || "Not set"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">End Date</div>
                <div className="text-white">{tourData.endDate || "Not set"}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Budget</div>
              <div className="text-white">${tourData.budget?.toLocaleString() || "0"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Locations</span>
              <span className="text-white font-medium">{locations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Events</span>
              <span className="text-white font-medium">{events.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Team Members</span>
              <span className="text-white font-medium">{crew.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Capacity</span>
              <span className="text-white font-medium">
                {events.reduce((sum, event) => sum + (event.capacity || 0), 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {locations.length > 0 && (
        <Card className="bg-slate-900/50 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Locations ({locations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {locations.map((location, index) => (
                <div key={location.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{location.name}</div>
                    <div className="text-sm text-slate-400">{location.city} • {location.venue}</div>
                  </div>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {location.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 