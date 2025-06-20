"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Plus, Megaphone, Tag, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn, formatCurrency } from "@/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Campaign {
  id: string
  name: string
  type: "social_media" | "email" | "paid_ads" | "other"
  start_date: string
  end_date: string
  budget: number
  status: "active" | "completed" | "cancelled"
  description: string
}

interface PromoCode {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  start_date: string
  end_date: string
  status: "active" | "expired" | "cancelled"
  usage_limit: number
  used_count: number
}

interface MarketingToolsProps {
  eventId: string
  campaigns?: Campaign[]
  promoCodes?: PromoCode[]
  onAddCampaign?: (campaign: Omit<Campaign, "id">) => Promise<void>
  onAddPromoCode?: (promoCode: Omit<PromoCode, "id">) => Promise<void>
}

export function MarketingTools({ 
  eventId, 
  campaigns = [], 
  promoCodes = [], 
  onAddCampaign = async () => {}, 
  onAddPromoCode = async () => {} 
}: MarketingToolsProps) {
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false)
  const [isAddPromoCodeModalOpen, setIsAddPromoCodeModalOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: "",
    type: "social_media",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
    budget: 0,
    status: "active",
    description: ""
  })
  const [newPromoCode, setNewPromoCode] = useState<Partial<PromoCode>>({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
    status: "active",
    usage_limit: 0,
    used_count: 0
  })

  const handleAddCampaign = async () => {
    if (!newCampaign.name || !newCampaign.type || !newCampaign.budget) {
      return
    }
    await onAddCampaign(newCampaign as Omit<Campaign, "id">)
    setIsAddCampaignModalOpen(false)
    setNewCampaign({
      name: "",
      type: "social_media",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(), "yyyy-MM-dd"),
      budget: 0,
      status: "active",
      description: ""
    })
  }

  const handleAddPromoCode = async () => {
    if (!newPromoCode.code || !newPromoCode.discount_value) {
      return
    }
    await onAddPromoCode(newPromoCode as Omit<PromoCode, "id">)
    setIsAddPromoCodeModalOpen(false)
    setNewPromoCode({
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(), "yyyy-MM-dd"),
      status: "active",
      usage_limit: 0,
      used_count: 0
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-300">Marketing Campaigns</CardTitle>
              <Button
                onClick={() => setIsAddCampaignModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Campaign
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No campaigns created yet
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-white">{campaign.name}</div>
                        <div className="text-sm text-slate-400">{campaign.description}</div>
                        <div className="text-xs text-slate-400">
                          {format(new Date(campaign.start_date), "PPP")} -{" "}
                          {format(new Date(campaign.end_date), "PPP")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {formatCurrency(campaign.budget)}
                        </div>
                        <div className="text-xs text-slate-400 capitalize">
                          {campaign.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promo-codes">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-300">Promo Codes</CardTitle>
              <Button
                onClick={() => setIsAddPromoCodeModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Promo Code
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promoCodes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No promo codes created yet
                  </div>
                ) : (
                  promoCodes.map((promoCode) => (
                    <div
                      key={promoCode.id}
                      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-white">{promoCode.code}</div>
                        <div className="text-sm text-slate-400">
                          {promoCode.discount_type === "percentage" 
                            ? `${promoCode.discount_value}% off` 
                            : `${formatCurrency(promoCode.discount_value)} off`}
                        </div>
                        <div className="text-xs text-slate-400">
                          {format(new Date(promoCode.start_date), "PPP")} -{" "}
                          {format(new Date(promoCode.end_date), "PPP")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {promoCode.used_count} / {promoCode.usage_limit}
                        </div>
                        <div className="text-xs text-slate-400 capitalize">
                          {promoCode.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Campaign Modal */}
      <Dialog open={isAddCampaignModalOpen} onOpenChange={setIsAddCampaignModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-300">Add New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input
                id="name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">Type</Label>
              <Select
                value={newCampaign.type}
                onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value as any })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="social_media" className="text-white">Social Media</SelectItem>
                  <SelectItem value="email" className="text-white">Email</SelectItem>
                  <SelectItem value="paid_ads" className="text-white">Paid Ads</SelectItem>
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-slate-300">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={newCampaign.budget}
                onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-slate-300">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white",
                      !newCampaign.start_date && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newCampaign.start_date ? format(new Date(newCampaign.start_date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={new Date(newCampaign.start_date)}
                    onSelect={(date) => setNewCampaign({ ...newCampaign, start_date: format(date || new Date(), "yyyy-MM-dd") })}
                    initialFocus
                    className="bg-slate-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-slate-300">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white",
                      !newCampaign.end_date && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newCampaign.end_date ? format(new Date(newCampaign.end_date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={new Date(newCampaign.end_date)}
                    onSelect={(date) => setNewCampaign({ ...newCampaign, end_date: format(date || new Date(), "yyyy-MM-dd") })}
                    initialFocus
                    className="bg-slate-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleAddCampaign} className="w-full bg-purple-600 hover:bg-purple-700">
              Add Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Promo Code Modal */}
      <Dialog open={isAddPromoCodeModalOpen} onOpenChange={setIsAddPromoCodeModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-300">Add New Promo Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-slate-300">Code</Label>
              <Input
                id="code"
                value={newPromoCode.code}
                onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_type" className="text-slate-300">Discount Type</Label>
              <Select
                value={newPromoCode.discount_type}
                onValueChange={(value) => setNewPromoCode({ ...newPromoCode, discount_type: value as any })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="percentage" className="text-white">Percentage</SelectItem>
                  <SelectItem value="fixed" className="text-white">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_value" className="text-slate-300">Discount Value</Label>
              <Input
                id="discount_value"
                type="number"
                value={newPromoCode.discount_value}
                onChange={(e) => setNewPromoCode({ ...newPromoCode, discount_value: parseFloat(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage_limit" className="text-slate-300">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                value={newPromoCode.usage_limit}
                onChange={(e) => setNewPromoCode({ ...newPromoCode, usage_limit: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-slate-300">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white",
                      !newPromoCode.start_date && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newPromoCode.start_date ? format(new Date(newPromoCode.start_date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={new Date(newPromoCode.start_date)}
                    onSelect={(date) => setNewPromoCode({ ...newPromoCode, start_date: format(date || new Date(), "yyyy-MM-dd") })}
                    initialFocus
                    className="bg-slate-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-slate-300">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white",
                      !newPromoCode.end_date && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newPromoCode.end_date ? format(new Date(newPromoCode.end_date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={new Date(newPromoCode.end_date)}
                    onSelect={(date) => setNewPromoCode({ ...newPromoCode, end_date: format(date || new Date(), "yyyy-MM-dd") })}
                    initialFocus
                    className="bg-slate-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleAddPromoCode} className="w-full bg-purple-600 hover:bg-purple-700">
              Add Promo Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 