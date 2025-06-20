"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EventsFiltersProps {
  filterStatus: string
  setFilterStatus: (status: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function EventsFilters({ filterStatus, setFilterStatus, searchQuery, setSearchQuery }: EventsFiltersProps) {
  return (
    <Card className="bg-[#1a1d29] border-0 text-white mb-4">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/60">Filter by Status</h3>
          <Button variant="ghost" size="sm" className="h-8 text-white/60 hover:text-white">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
          <TabsList className="w-full bg-[#0f1117] p-1">
            <TabsTrigger
              value="all"
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Draft
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  )
}
