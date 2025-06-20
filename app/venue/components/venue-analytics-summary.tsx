import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ChevronRight } from "lucide-react"

interface VenueAnalyticsSummaryProps {
  venue: any
}

export function VenueAnalyticsSummary({ venue }: VenueAnalyticsSummaryProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Analytics Overview</CardTitle>
          <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">Analytics visualization would appear here</p>
            <p className="text-sm text-gray-500 mt-2">Showing data for the last 30 days</p>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-4 text-purple-400 border-purple-800/50 hover:bg-purple-900/20">
          View Detailed Analytics <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}
