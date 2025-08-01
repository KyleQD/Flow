'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, User, Calendar, Clock } from 'lucide-react'

interface ShiftRequestsProps {
  venueId: string
}

export function ShiftRequests({ venueId }: ShiftRequestsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Shift Requests</h3>
          <p className="text-sm text-muted-foreground">
            Manage shift swaps, drops, and pickup requests
          </p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          View All Requests
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sample requests - will be replaced with real data */}
        {[
          { type: 'Swap', staff: 'Alex Chen', shift: 'Evening Security', date: 'Dec 15', status: 'Pending' },
          { type: 'Drop', staff: 'Maya Rodriguez', shift: 'Sound Engineer', date: 'Dec 16', status: 'Approved' },
          { type: 'Pickup', staff: 'Jordan Kim', shift: 'Bar Service', date: 'Dec 17', status: 'Pending' },
          { type: 'Swap', staff: 'Sarah Wilson', shift: 'FOH Manager', date: 'Dec 18', status: 'Denied' }
        ].map((request, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{request.type} Request</CardTitle>
                <Badge 
                  variant={
                    request.status === 'Approved' ? 'default' : 
                    request.status === 'Denied' ? 'destructive' : 'secondary'
                  }
                >
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{request.staff}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{request.shift} - {request.date}</span>
              </div>
              <div className="flex justify-end space-x-2">
                {request.status === 'Pending' && (
                  <>
                    <Button variant="outline" size="sm">Deny</Button>
                    <Button size="sm">Approve</Button>
                  </>
                )}
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 