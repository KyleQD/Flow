"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, Calendar, Zap } from "lucide-react"

interface CampaignForm {
  title: string
  objective: string
  startsAt: string
  endsAt: string
  budget: string
}

export function PromotionShell() {
  const [form, setForm] = useState<CampaignForm>({ title: "", objective: "awareness", startsAt: "", endsAt: "", budget: "" })

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-pink-400" />
          Create Promotion Campaign
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Summer EDM Night Promo" />
          </div>
          <div className="space-y-2">
            <Label>Objective</Label>
            <Select value={form.objective} onValueChange={v => setForm({ ...form, objective: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Awareness</SelectItem>
                <SelectItem value="conversions">Ticket Conversions</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Starts</Label>
            <div className="flex gap-2">
              <Input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} />
              <Button variant="outline"><Calendar className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ends</Label>
            <div className="flex gap-2">
              <Input type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} />
              <Button variant="outline"><Calendar className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Budget (USD)</Label>
            <Input type="number" inputMode="decimal" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Message</Label>
            <Textarea placeholder="Tell fans about the lineup, headliner, and ticket link…" rows={4} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Zap className="h-4 w-4 mr-2" /> Launch Campaign
          </Button>
          <Button variant="outline">Save Draft</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PromotionShell


