import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CountdownPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Event Countdown</h1>
      <Card>
        <CardHeader>
          <CardTitle>Countdown & Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-300">Countdown and event timeline details will be shown here.</div>
        </CardContent>
      </Card>
    </div>
  )
} 