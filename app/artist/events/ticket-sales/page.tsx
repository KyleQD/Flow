import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TicketSalesPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Ticket Sales</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ticket Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-300">Ticket sales analytics and management tools will be shown here.</div>
        </CardContent>
      </Card>
    </div>
  )
} 