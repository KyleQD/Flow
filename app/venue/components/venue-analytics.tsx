import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarChart3, Calendar, DollarSign, TrendingUp, Users } from "lucide-react"

interface VenueAnalyticsProps {
  venueId: string
}

export function VenueAnalytics({ venueId }: VenueAnalyticsProps) {
  // In a real app, this would fetch analytics data from an API

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" /> Venue Analytics
            </CardTitle>
            <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-6" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="bg-gray-800 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Events</p>
                        <p className="text-2xl font-bold mt-1">125</p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="mt-2 text-xs text-green-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold mt-1">$48,250</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="mt-2 text-xs text-green-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +8% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Attendees</p>
                        <p className="text-2xl font-bold mt-1">12,845</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="mt-2 text-xs text-green-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +15% from last month
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Monthly Events</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-8 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400">Chart visualization would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Event Performance</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-8 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400">Event analytics would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Revenue Breakdown</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-8 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400">Revenue analytics would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Audience Demographics</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-8 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400">Audience analytics would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
