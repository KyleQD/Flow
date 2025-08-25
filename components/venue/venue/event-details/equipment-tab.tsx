import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/app/types/events.types"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

interface EquipmentTabProps {
  event: Event
}

// Mock data for equipment
const mockEquipment = [
  { id: 1, name: "Main PA System", category: "Sound", status: "Assigned", notes: "Needs setup at 2PM" },
  { id: 2, name: "Stage Lighting Kit", category: "Lighting", status: "Assigned", notes: "" },
  {
    id: 3,
    name: "Wireless Microphones (4)",
    category: "Sound",
    status: "Pending",
    notes: "Need to check battery levels",
  },
  { id: 4, name: "Fog Machine", category: "Effects", status: "Unavailable", notes: "Currently under maintenance" },
  { id: 5, name: "Projector & Screen", category: "Visual", status: "Assigned", notes: "" },
]

export default function EquipmentTab({ event }: EquipmentTabProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Assigned</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "unavailable":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unavailable</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Calculate equipment stats
  const totalItems = mockEquipment.length;
  const assignedItems = mockEquipment.filter(e => e.status === "Assigned").length;
  const pendingItems = mockEquipment.filter(e => e.status === "Pending").length;
  
  return (
    <div className="space-y-6">
      {/* Equipment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Assigned Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{assignedItems}</p>
            <p className="text-xs text-muted-foreground">
              of {totalItems} total items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
              Pending Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingItems}</p>
            <p className="text-xs text-muted-foreground">
              items awaiting confirmation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              Unavailable Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Check maintenance schedule</p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Equipment Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEquipment.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.category}</div>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
