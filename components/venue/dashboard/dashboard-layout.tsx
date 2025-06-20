"use client"

import type React from "react"

import { useState } from "react"
import { PageHeader } from "@/components/navigation/page-header"
import { FeatureTabs } from "@/components/navigation/feature-tabs"
import { QuickAccess } from "@/components/navigation/quick-access"
import { BarChart3, Calendar, Clock, Users, Music, Building, Briefcase } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "events", label: "Events", icon: <Calendar className="h-4 w-4" />, badge: 3 },
    { id: "bookings", label: "Bookings", icon: <Clock className="h-4 w-4" />, badge: 5 },
    { id: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
    { id: "music", label: "Music", icon: <Music className="h-4 w-4" /> },
    { id: "venues", label: "Venues", icon: <Building className="h-4 w-4" /> },
    { id: "jobs", label: "Jobs", icon: <Briefcase className="h-4 w-4" />, badge: 2 },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Overview of your music career and activities" />

      <FeatureTabs tabs={tabs} defaultTab="overview" onChange={setActiveTab} className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">{children}</div>
        <div className="md:col-span-1">
          <QuickAccess />
        </div>
      </div>
    </div>
  )
}
