"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Department {
  id: string
  name: string
  description: string
  memberCount: number
  color: string
}

interface TeamFiltersProps {
  departments: Department[]
  filterDepartment: string
  setFilterDepartment: (department: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function TeamFilters({
  departments,
  filterDepartment,
  setFilterDepartment,
  searchQuery,
  setSearchQuery,
}: TeamFiltersProps) {
  return (
    <Card className="bg-[#1a1d29] border-0 text-white mb-4">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/60">Filter by Department</h3>
          <Button variant="ghost" size="sm" className="h-8 text-white/60 hover:text-white">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="bg-[#0f1117] border-0 text-white focus:ring-purple-500">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1d29] border-[#2a2f3e] text-white">
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.name}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
