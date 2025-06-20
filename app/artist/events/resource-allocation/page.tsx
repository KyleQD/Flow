import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResourceAllocationPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Resource Allocation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Resource Analytics & Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-300">Resource allocation analytics and management tools will be shown here.</div>
        </CardContent>
      </Card>
    </div>
  )
} 