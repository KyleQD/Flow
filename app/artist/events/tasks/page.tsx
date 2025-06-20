import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TasksPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">All Event Tasks</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tasks & Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-300">All event tasks and assignments will be shown here.</div>
        </CardContent>
      </Card>
    </div>
  )
} 