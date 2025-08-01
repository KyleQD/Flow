'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Clock, Users, MapPin } from 'lucide-react'

interface ShiftTemplatesProps {
  venueId: string
}

export function ShiftTemplates({ venueId }: ShiftTemplatesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Shift Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage reusable shift templates
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sample templates - will be replaced with real data */}
        {[
          { name: 'Evening Security', dept: 'Security', time: '6:00 PM - 2:00 AM', staff: 2 },
          { name: 'Sound Engineer', dept: 'Technical', time: '4:00 PM - 11:00 PM', staff: 1 },
          { name: 'Bar Service', dept: 'Service', time: '7:00 PM - 1:00 AM', staff: 3 },
          { name: 'FOH Manager', dept: 'Management', time: '5:00 PM - 11:00 PM', staff: 1 },
          { name: 'Lighting Tech', dept: 'Technical', time: '3:00 PM - 10:00 PM', staff: 1 },
          { name: 'VIP Coordinator', dept: 'Service', time: '6:00 PM - 12:00 AM', staff: 1 }
        ].map((template, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge variant="outline">{template.dept}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{template.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{template.staff} staff needed</span>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button size="sm">Use Template</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 