"use client"

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { 
  BarChart3, 
  Download, 
  LineChart, 
  Ticket, 
  TrendingUp, 
  Share2,
  Users,
  DollarSign,
  Calendar,
  Target,
  Settings,
  Plus,
  Eye,
  EyeOff,
  Edit
} from "lucide-react"
import { TicketSharingTools } from "@/components/ticketing/ticket-sharing-tools"
import { CampaignManager } from "@/components/ticketing/campaign-manager"
import { TICKET_CATEGORIES, PAYMENT_STATUSES } from "@/types/ticketing"

interface EnhancedTicketingMetrics {
  total_revenue: number
  total_tickets_sold: number
  total_tickets_available: number
  total_tickets_sold_overall: number
  average_ticket_price: number
  active_campaigns: number
  campaign_usage_percentage: number
  social_clicks: number
  social_conversions: number
  social_conversion_rate: number
}

interface TicketType {
  id: string
  name: string
  price: number
  quantity_available: number
  quantity_sold: number
  category: string
  featured: boolean
  is_active: boolean
  created_at: string
}

interface TicketSale {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  event_title: string
  ticket_type_name: string
  quantity: number
  total_amount: number
  payment_status: string
  purchase_date: string
  promo_code?: string
  share_platform?: string
}

interface Event {
  id: string
  title: string
  date: string
  location: string
}

export default function EnhancedTicketingPage() {
  const [metrics, setMetrics] = useState<EnhancedTicketingMetrics | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [sales, setSales] = useState<TicketSale[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  useEffect(() => {
    fetchTicketingData()
  }, [selectedEvent])

  const fetchTicketingData = async () => {
    try {
      setLoading(true)
      
      // Fetch enhanced overview
      const overviewResponse = await fetch('/api/admin/ticketing/enhanced?type=overview')
      const overviewData = await overviewResponse.json()
      
      if (overviewResponse.ok) {
        setMetrics(overviewData.overview)
      }

      // Fetch ticket types
      const ticketTypesResponse = await fetch('/api/admin/ticketing/enhanced?type=ticket_types')
      const ticketTypesData = await ticketTypesResponse.json()
      
      if (ticketTypesResponse.ok) {
        setTicketTypes(ticketTypesData.ticket_types || [])
      }

      // Fetch sales
      const salesResponse = await fetch('/api/admin/ticketing/enhanced?type=sales')
      const salesData = await salesResponse.json()
      
      if (salesResponse.ok) {
        setSales(salesData.sales || [])
      }

      // Fetch events for dropdown
      const eventsResponse = await fetch('/api/admin/events')
      const eventsData = await eventsResponse.json()
      
      if (eventsResponse.ok) {
        setEvents(eventsData.events || [])
      }

    } catch (error) {
      console.error('Error fetching ticketing data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load ticketing data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleShare = (platform: string, data: any) => {
    console.log('Shared on:', platform, data)
    // Refresh analytics after sharing
    setTimeout(fetchTicketingData, 1000)
  }

  const handleCampaignCreated = (campaign: any) => {
    console.log('Campaign created:', campaign)
    // Refresh data after campaign creation
    setTimeout(fetchTicketingData, 1000)
  }

  const handlePromoCodeCreated = (promoCode: any) => {
    console.log('Promo code created:', promoCode)
    // Refresh data after promo code creation
    setTimeout(fetchTicketingData, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header />
      
      <PageHeader
        title="Enhanced Ticketing Dashboard"
        icon={BarChart3}
        description="Comprehensive ticketing management with social sharing, campaigns, and analytics"
      />

      {/* Event Selection */}
      <div className="flex items-center gap-4">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title} - {formatDate(event.date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Sharing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(metrics?.total_revenue || 0)}
              trend={`${metrics?.social_conversion_rate?.toFixed(1) || 0}% conversion rate`}
              trendUp={true}
              icon={DollarSign}
            />
            <MetricCard
              title="Tickets Sold"
              value={formatNumber(metrics?.total_tickets_sold || 0)}
              trend={`${metrics?.total_tickets_available || 0} available`}
              trendUp={null}
              icon={Ticket}
            />
            <MetricCard
              title="Active Campaigns"
              value={metrics?.active_campaigns?.toString() || '0'}
              trend={`${metrics?.campaign_usage_percentage?.toFixed(1) || 0}% usage`}
              trendUp={true}
              icon={Target}
            />
            <MetricCard
              title="Social Engagement"
              value={formatNumber(metrics?.social_clicks || 0)}
              trend={`${metrics?.social_conversions || 0} conversions`}
              trendUp={true}
              icon={Share2}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="flex items-center gap-2" onClick={() => setActiveTab('tickets')}>
                  <Plus className="h-4 w-4" />
                  Create Ticket Type
                </Button>
                <Button className="flex items-center gap-2" onClick={() => setActiveTab('campaigns')}>
                  <Target className="h-4 w-4" />
                  Launch Campaign
                </Button>
                <Button className="flex items-center gap-2" onClick={() => setActiveTab('sharing')}>
                  <Share2 className="h-4 w-4" />
                  Share Event
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{sale.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{sale.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm">{sale.ticket_type_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {sale.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(sale.total_amount)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={sale.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {PAYMENT_STATUSES[sale.payment_status as keyof typeof PAYMENT_STATUSES]?.label || sale.payment_status}
                        </Badge>
                        {sale.promo_code && (
                          <Badge variant="outline">Promo: {sale.promo_code}</Badge>
                        )}
                        {sale.share_platform && (
                          <Badge variant="outline">Via {sale.share_platform}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ticket Types</h3>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Ticket Type
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketTypes.map((ticketType) => {
              const category = TICKET_CATEGORIES[ticketType.category as keyof typeof TICKET_CATEGORIES]
              const percentageSold = ticketType.quantity_available > 0 
                ? (ticketType.quantity_sold / ticketType.quantity_available) * 100 
                : 0
              
              return (
                <Card key={ticketType.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ticketType.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">{category?.icon}</span>
                          <Badge variant="outline">{category?.label}</Badge>
                          {ticketType.featured && (
                            <Badge variant="default">Featured</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Toggle ticket type status
                        }}
                      >
                        {ticketType.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{formatCurrency(ticketType.price)}</span>
                      <span className="text-sm text-muted-foreground">
                        {ticketType.quantity_sold} / {ticketType.quantity_available} sold
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sales Progress</span>
                        <span>{percentageSold.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentageSold} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignManager 
            campaigns={[]}
            promoCodes={[]}
            onRefresh={fetchTicketingData}
          />
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          {selectedEvent !== 'all' && events.find(e => e.id === selectedEvent) ? (
            <TicketSharingTools
              eventId={selectedEvent}
              event={events.find(e => e.id === selectedEvent)!}
              ticketTypes={ticketTypes}
              onShare={handleShare}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an event to view sharing tools</p>
              <p className="text-sm">Choose a specific event from the dropdown above</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics coming soon</p>
                <p className="text-sm">Detailed charts, trends, and insights will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  trend: string
  trendUp: boolean | null
  icon: any
}

function MetricCard({ title, value, trend, trendUp, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trendUp !== null && (
            <TrendingUp className={`h-3 w-3 ${trendUp ? 'text-green-500' : 'text-red-500'}`} />
          )}
          {trend}
        </p>
      </CardContent>
    </Card>
  )
} 