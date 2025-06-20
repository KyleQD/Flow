import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BudgetPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Budget Overview</h1>
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-300">Budget overview and management tools will be shown here.</div>
        </CardContent>
      </Card>
    </div>
  )
} 