"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PerformanceAgencyManager } from '@/components/admin/agencies/performance-agency-manager'
import { StaffingAgencyManager } from '@/components/admin/agencies/staffing-agency-manager'

export default function AgenciesDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Agencies</h1>
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700/50">
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">Performance Agencies</TabsTrigger>
            <TabsTrigger value="staffing" className="data-[state=active]:bg-purple-600">Staffing Agencies</TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="space-y-6">
            <PerformanceAgencyManager />
          </TabsContent>
          <TabsContent value="staffing" className="space-y-6">
            <StaffingAgencyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


