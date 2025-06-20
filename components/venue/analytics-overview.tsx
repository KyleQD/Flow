import { BarChart3, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TourifyLogo } from "@/components/tourify-logo"

export function AnalyticsOverview() {
  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-xl font-bold">Analytics Overview</CardTitle>
        <TourifyLogo className="h-5 w-auto text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="flex h-64 flex-col items-center justify-center rounded-md bg-[#0f1117] p-6">
          <BarChart3 className="h-16 w-16 text-white/20" />
          <p className="mt-4 text-center text-white/60">Analytics visualization would appear here</p>
          <p className="text-sm text-white/40">Showing data for the last 30 days</p>
        </div>

        <Button
          variant="ghost"
          className="mt-4 w-full justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
        >
          View Detailed Analytics
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
