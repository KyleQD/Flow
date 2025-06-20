"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VenueHeader } from "@/components/venue/venue-header"
import { TeamList } from "@/components/team/team-list"
import { TeamMemberDetails } from "@/components/team/team-member-details"
import { TeamFilters } from "@/components/team/team-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddTeamMemberDialog } from "@/components/team/add-team-member-dialog"
import { TeamDepartments } from "@/components/team/team-departments"

export function TeamManagement() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "departments">("list")

  // This would be fetched from an API in a real application
  const teamMembers = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Venue Manager",
      department: "Management",
      email: "alex@echolounge.com",
      phone: "(404) 555-1001",
      avatar: "/confident-venue-manager.png",
      bio: "Alex has over 10 years of experience in venue management and has been with The Echo Lounge since its opening. Responsible for overall venue operations and strategic planning.",
      startDate: "January 2020",
      status: "active",
      permissions: ["admin", "booking", "finance", "staff"],
      recentEvents: ["Summer Jam Festival", "Midnight Echo", "Electronic Dance Night"],
      notes: "Key holder. Emergency contact for venue issues.",
    },
    {
      id: "2",
      name: "Sarah Williams",
      role: "Booking Manager",
      department: "Management",
      email: "sarah@echolounge.com",
      phone: "(404) 555-1002",
      avatar: "/confident-booking-manager.png",
      bio: "Sarah handles all booking inquiries and coordinates with artists and promoters. She has extensive connections in the local music scene and brings in diverse talent.",
      startDate: "March 2020",
      status: "active",
      permissions: ["booking", "events", "artists"],
      recentEvents: ["Jazz Night", "Rock Revival", "Acoustic Sessions"],
      notes: "Works remotely on Mondays. Prefers email for initial contact.",
    },
    {
      id: "3",
      name: "Michael Chen",
      role: "Technical Director",
      department: "Production",
      email: "michael@echolounge.com",
      phone: "(404) 555-1003",
      avatar: "/focused-tech-lead.png",
      bio: "Michael oversees all technical aspects of the venue including sound, lighting, and stage setup. He has a background in audio engineering and live production.",
      startDate: "February 2020",
      status: "active",
      permissions: ["production", "equipment", "maintenance"],
      recentEvents: ["Summer Jam Festival", "Electronic Dance Night", "Rock Revival"],
      notes: "Certified in advanced sound engineering. Available for emergency technical issues 24/7.",
    },
    {
      id: "4",
      name: "Jessica Rodriguez",
      role: "Marketing Manager",
      department: "Marketing",
      email: "jessica@echolounge.com",
      phone: "(404) 555-1004",
      avatar: "/confident-marketing-leader.png",
      bio: "Jessica handles all marketing and promotional activities for the venue. She has a background in digital marketing and social media management.",
      startDate: "April 2020",
      status: "active",
      permissions: ["marketing", "social", "website"],
      recentEvents: ["Summer Jam Festival", "Jazz Night", "Midnight Echo"],
      notes: "Manages all social media accounts. Contact for promotional materials and press releases.",
    },
    {
      id: "5",
      name: "David Kim",
      role: "Sound Engineer",
      department: "Production",
      email: "david@echolounge.com",
      phone: "(404) 555-1005",
      avatar: "/focused-sound-engineer.png",
      bio: "David is responsible for sound engineering during events. He ensures optimal audio quality and works closely with performing artists on their technical needs.",
      startDate: "May 2020",
      status: "active",
      permissions: ["production", "equipment"],
      recentEvents: ["Jazz Night", "Acoustic Sessions", "Rock Revival"],
      notes: "Specialized in acoustic performances. Has own equipment for specialized setups.",
    },
    {
      id: "6",
      name: "Emily Taylor",
      role: "Event Coordinator",
      department: "Events",
      email: "emily@echolounge.com",
      phone: "(404) 555-1006",
      avatar: "/confident-event-planner.png",
      bio: "Emily coordinates all aspects of event execution, from setup to breakdown. She ensures events run smoothly and handles any issues that arise during events.",
      startDate: "June 2020",
      status: "active",
      permissions: ["events", "staff", "vendors"],
      recentEvents: ["Summer Jam Festival", "Corporate Event", "Album Release Party"],
      notes: "Excellent at problem-solving during events. Preferred contact during event execution.",
    },
    {
      id: "7",
      name: "Robert Johnson",
      role: "Bar Manager",
      department: "Food & Beverage",
      email: "robert@echolounge.com",
      phone: "(404) 555-1007",
      avatar: "/confident-bar-manager.png",
      bio: "Robert manages the bar operations, including inventory, staffing, and creating specialty drink menus for events. He has extensive experience in hospitality management.",
      startDate: "March 2020",
      status: "active",
      permissions: ["bar", "inventory", "staff"],
      recentEvents: ["Electronic Dance Night", "Rock Revival", "Jazz Night"],
      notes: "Certified mixologist. Handles all alcohol ordering and bar staff scheduling.",
    },
    {
      id: "8",
      name: "Lisa Wong",
      role: "Finance Manager",
      department: "Administration",
      email: "lisa@echolounge.com",
      phone: "(404) 555-1008",
      avatar: "/thoughtful-finance-professional.png",
      bio: "Lisa handles all financial aspects of the venue, including accounting, payroll, and financial reporting. She ensures the venue's financial health and compliance.",
      startDate: "January 2020",
      status: "active",
      permissions: ["finance", "admin", "reports"],
      recentEvents: [],
      notes: "CPA certified. Handles payroll processing every two weeks.",
    },
    {
      id: "9",
      name: "James Wilson",
      role: "Security Manager",
      department: "Security",
      email: "james@echolounge.com",
      phone: "(404) 555-1009",
      avatar: "/placeholder.svg?height=80&width=80&query=portrait%20of%20security%20manager",
      bio: "James oversees all security operations for the venue, ensuring the safety of patrons, staff, and artists. He coordinates the security team and develops security protocols.",
      startDate: "February 2020",
      status: "active",
      permissions: ["security", "staff", "emergency"],
      recentEvents: ["Summer Jam Festival", "Rock Revival", "Electronic Dance Night"],
      notes: "Former law enforcement. Certified in crowd management and emergency response.",
    },
    {
      id: "10",
      name: "Maria Garcia",
      role: "Lighting Technician",
      department: "Production",
      email: "maria@echolounge.com",
      phone: "(404) 555-1010",
      avatar: "/placeholder.svg?height=80&width=80&query=portrait%20of%20lighting%20technician",
      bio: "Maria designs and operates lighting for events. She creates custom lighting designs for different types of performances and ensures all lighting equipment is properly maintained.",
      startDate: "April 2020",
      status: "active",
      permissions: ["production", "equipment"],
      recentEvents: ["Electronic Dance Night", "Midnight Echo", "Summer Jam Festival"],
      notes: "Specialized in concert lighting design. Has additional certifications in DMX programming.",
    },
    {
      id: "11",
      name: "Thomas Brown",
      role: "Maintenance Manager",
      department: "Facilities",
      email: "thomas@echolounge.com",
      phone: "(404) 555-1011",
      avatar: "/placeholder.svg?height=80&width=80&query=portrait%20of%20maintenance%20manager",
      bio: "Thomas is responsible for the maintenance and upkeep of the venue facilities. He ensures all systems are functioning properly and handles repairs and renovations.",
      startDate: "January 2020",
      status: "active",
      permissions: ["facilities", "maintenance", "equipment"],
      recentEvents: [],
      notes: "Licensed contractor. On call for emergency facility issues.",
    },
    {
      id: "12",
      name: "Olivia Martinez",
      role: "Guest Relations Manager",
      department: "Customer Service",
      email: "olivia@echolounge.com",
      phone: "(404) 555-1012",
      avatar: "/placeholder.svg?height=80&width=80&query=portrait%20of%20guest%20relations%20manager",
      bio: "Olivia ensures all guests have an excellent experience at the venue. She handles VIP arrangements, customer feedback, and resolves any guest issues that arise.",
      startDate: "May 2020",
      status: "active",
      permissions: ["customer", "vip", "feedback"],
      recentEvents: ["Summer Jam Festival", "Jazz Night", "Corporate Event"],
      notes: "Fluent in Spanish and English. Specialized in VIP guest experiences.",
    },
  ]

  const departments = [
    {
      id: "management",
      name: "Management",
      description: "Oversees venue operations and strategic planning",
      memberCount: teamMembers.filter((member) => member.department === "Management").length,
      color: "purple",
    },
    {
      id: "production",
      name: "Production",
      description: "Handles technical aspects including sound, lighting, and stage",
      memberCount: teamMembers.filter((member) => member.department === "Production").length,
      color: "blue",
    },
    {
      id: "events",
      name: "Events",
      description: "Coordinates event execution from setup to breakdown",
      memberCount: teamMembers.filter((member) => member.department === "Events").length,
      color: "green",
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Manages promotional activities and social media",
      memberCount: teamMembers.filter((member) => member.department === "Marketing").length,
      color: "yellow",
    },
    {
      id: "food-beverage",
      name: "Food & Beverage",
      description: "Runs bar operations and food service",
      memberCount: teamMembers.filter((member) => member.department === "Food & Beverage").length,
      color: "orange",
    },
    {
      id: "administration",
      name: "Administration",
      description: "Handles financial and administrative functions",
      memberCount: teamMembers.filter((member) => member.department === "Administration").length,
      color: "red",
    },
    {
      id: "security",
      name: "Security",
      description: "Ensures safety of patrons, staff, and artists",
      memberCount: teamMembers.filter((member) => member.department === "Security").length,
      color: "gray",
    },
    {
      id: "facilities",
      name: "Facilities",
      description: "Maintains venue facilities and equipment",
      memberCount: teamMembers.filter((member) => member.department === "Facilities").length,
      color: "teal",
    },
    {
      id: "customer-service",
      name: "Customer Service",
      description: "Ensures excellent guest experiences",
      memberCount: teamMembers.filter((member) => member.department === "Customer Service").length,
      color: "pink",
    },
  ]

  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesDepartment =
      filterDepartment === "all" || member.department.toLowerCase() === filterDepartment.toLowerCase()
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDepartment && matchesSearch
  })

  const selectedMember = selectedMemberId ? teamMembers.find((member) => member.id === selectedMemberId) : null

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <VenueHeader />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Team Management</h1>
              <p className="text-white/60">Manage your venue staff and team members</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className={`border-[#2a2f3e] ${viewMode === "departments" ? "bg-[#2a2f3e]" : ""} text-white hover:bg-[#2a2f3e]`}
                onClick={() => setViewMode("departments")}
              >
                Departments
              </Button>
              <Button
                variant="outline"
                className={`border-[#2a2f3e] ${viewMode === "list" ? "bg-[#2a2f3e]" : ""} text-white hover:bg-[#2a2f3e]`}
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </div>
          </div>

          {viewMode === "departments" ? (
            <TeamDepartments
              departments={departments}
              teamMembers={teamMembers}
              onSelectMember={setSelectedMemberId}
              selectedMemberId={selectedMemberId}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TeamFilters
                  departments={departments}
                  filterDepartment={filterDepartment}
                  setFilterDepartment={setFilterDepartment}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
                <TeamList
                  teamMembers={filteredTeamMembers}
                  selectedMemberId={selectedMemberId}
                  onSelectMember={setSelectedMemberId}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedMember ? (
                  <TeamMemberDetails member={selectedMember} />
                ) : (
                  <div className="bg-[#1a1d29] rounded-lg border-0 text-white p-8 h-full flex flex-col items-center justify-center">
                    <div className="text-white/20 text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-medium text-white mb-2">No Team Member Selected</h3>
                    <p className="text-white/60 text-center max-w-md">
                      Select a team member from the list to view details, or add a new team member to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <AddTeamMemberDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} departments={departments} />
    </div>
  )
}
