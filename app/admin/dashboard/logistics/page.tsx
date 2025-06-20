"use client"

import { Box, Calendar, Clock, FileText, MapPin, Truck, Users, Utensils } from "lucide-react"
import { Header } from "@/components/header"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function LogisticsPage() {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <PageHeader
        title="Logistics Management"
        icon={Truck}
        description="Coordinate transportation, equipment, and venue logistics for all events"
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-800/50 p-1 mb-6">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="transportation"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Transportation
          </TabsTrigger>
          <TabsTrigger
            value="equipment"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Equipment
          </TabsTrigger>
          <TabsTrigger
            value="catering"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Catering
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <LogisticsStatusCard
              title="Transportation"
              icon={Truck}
              status="In Progress"
              percentage={65}
              items={8}
              completed={5}
            />
            <LogisticsStatusCard
              title="Equipment"
              icon={Box}
              status="In Progress"
              percentage={45}
              items={24}
              completed={11}
            />
            <LogisticsStatusCard
              title="Catering"
              icon={Utensils}
              status="Not Started"
              percentage={10}
              items={5}
              completed={0}
            />
          </div>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                Logistics Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-8 pb-1">
                <div className="absolute top-0 bottom-0 left-3.5 w-px bg-slate-700"></div>

                <TimelineItem
                  date="Aug 13, 08:00 AM"
                  title="Equipment Delivery"
                  description="Main stage equipment delivery from SoundMasters Pro"
                  status="scheduled"
                  daysAway={20}
                />

                <TimelineItem
                  date="Aug 13, 10:00 AM"
                  title="VIP Area Setup"
                  description="VIP lounge and backstage area setup by EventSpace Designs"
                  status="scheduled"
                  daysAway={20}
                />

                <TimelineItem
                  date="Aug 14, 09:00 AM"
                  title="Artist Transportation"
                  description="Airport pickup for headline performers"
                  status="scheduled"
                  daysAway={21}
                />

                <TimelineItem
                  date="Aug 14, 02:00 PM"
                  title="Sound Check"
                  description="Technical rehearsal and sound check for all performers"
                  status="scheduled"
                  daysAway={21}
                />

                <TimelineItem
                  date="Aug 15, 06:00 AM"
                  title="Food & Beverage Delivery"
                  description="Catering setup and food delivery from Gourmet Caterers"
                  status="scheduled"
                  daysAway={22}
                />

                <TimelineItem
                  date="Aug 17, 10:00 PM"
                  title="Equipment Breakdown"
                  description="Dismantling and removal of all stage equipment"
                  status="scheduled"
                  daysAway={24}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <Users className="mr-2 h-5 w-5 text-purple-500" />
                Logistics Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TeamMemberCard
                  name="Jessica Lee"
                  role="Transportation Manager"
                  email="jessica@tourify.com"
                  phone="(555) 123-4567"
                />

                <TeamMemberCard
                  name="David Wilson"
                  role="Equipment Coordinator"
                  email="david@tourify.com"
                  phone="(555) 234-5678"
                />

                <TeamMemberCard
                  name="Amanda Garcia"
                  role="Catering Manager"
                  email="amanda@tourify.com"
                  phone="(555) 345-6789"
                />

                <TeamMemberCard
                  name="Robert Taylor"
                  role="Security Coordinator"
                  email="robert@tourify.com"
                  phone="(555) 456-7890"
                />

                <TeamMemberCard
                  name="Michael Chen"
                  role="Venue Liaison"
                  email="michael@tourify.com"
                  phone="(555) 567-8901"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transportation" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <Truck className="mr-2 h-5 w-5 text-purple-500" />
                Transportation Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                      <TransportationRow
                        dateTime="Aug 14, 09:00 AM"
                        description="Headline Artist Pickup"
                        provider="Elite Transport"
                        from="International Airport"
                        to="Luxury Hotel"
                        status="scheduled"
                      />
                      <TransportationRow
                        dateTime="Aug 14, 11:30 AM"
                        description="Support Act Pickup"
                        provider="Elite Transport"
                        from="International Airport"
                        to="Riverside Hotel"
                        status="scheduled"
                      />
                      <TransportationRow
                        dateTime="Aug 15, 02:00 PM"
                        description="Artist to Venue"
                        provider="Elite Transport"
                        from="Luxury Hotel"
                        to="Riverside Amphitheater"
                        status="scheduled"
                      />
                      <TransportationRow
                        dateTime="Aug 15, 11:30 PM"
                        description="Artist to Hotel"
                        provider="Elite Transport"
                        from="Riverside Amphitheater"
                        to="Luxury Hotel"
                        status="scheduled"
                      />
                      <TransportationRow
                        dateTime="Aug 17, 10:00 AM"
                        description="Artist to Airport"
                        provider="Elite Transport"
                        from="Luxury Hotel"
                        to="International Airport"
                        status="scheduled"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Transportation Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProviderCard
                  name="Elite Transport Services"
                  type="VIP Transportation"
                  contact="John Driver"
                  phone="(555) 123-4567"
                  email="john@elitetransport.com"
                />

                <ProviderCard
                  name="Roadrunner Logistics"
                  type="Equipment Transport"
                  contact="Sarah Trucker"
                  phone="(555) 234-5678"
                  email="sarah@roadrunner.com"
                />

                <ProviderCard
                  name="City Shuttle Services"
                  type="Staff Transportation"
                  contact="Mike Shuttle"
                  phone="(555) 345-6789"
                  email="mike@cityshuttle.com"
                />

                <ProviderCard
                  name="Luxury Limos"
                  type="VIP Limousines"
                  contact="Lisa Luxury"
                  phone="(555) 456-7890"
                  email="lisa@luxurylimos.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <Box className="mr-2 h-5 w-5 text-purple-500" />
                Equipment Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Delivery Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                      <EquipmentRow
                        item="Main PA System"
                        category="Sound"
                        quantity={1}
                        provider="SoundMasters Pro"
                        deliveryDate="Aug 13, 08:00 AM"
                        status="confirmed"
                      />
                      <EquipmentRow
                        item="Stage Lighting"
                        category="Lighting"
                        quantity={1}
                        provider="LightWorks Inc"
                        deliveryDate="Aug 13, 10:00 AM"
                        status="confirmed"
                      />
                      <EquipmentRow
                        item="Wireless Microphones"
                        category="Sound"
                        quantity={12}
                        provider="SoundMasters Pro"
                        deliveryDate="Aug 13, 08:00 AM"
                        status="confirmed"
                      />
                      <EquipmentRow
                        item="LED Screens"
                        category="Visual"
                        quantity={2}
                        provider="VisualTech Solutions"
                        deliveryDate="Aug 13, 01:00 PM"
                        status="pending"
                      />
                      <EquipmentRow
                        item="Drum Kit"
                        category="Instruments"
                        quantity={1}
                        provider="MusicGear Rentals"
                        deliveryDate="Aug 14, 09:00 AM"
                        status="pending"
                      />
                      <EquipmentRow
                        item="Guitar Amplifiers"
                        category="Instruments"
                        quantity={4}
                        provider="MusicGear Rentals"
                        deliveryDate="Aug 14, 09:00 AM"
                        status="pending"
                      />
                      <EquipmentRow
                        item="Barricades"
                        category="Security"
                        quantity={20}
                        provider="EventSafe Solutions"
                        deliveryDate="Aug 13, 03:00 PM"
                        status="confirmed"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catering" className="mt-0">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <Utensils className="mr-2 h-5 w-5 text-purple-500" />
                Catering Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <CateringCard
                  title="Artist & Crew Meals"
                  provider="Gourmet Caterers"
                  servingTime="Aug 15, 12:00 PM - 10:00 PM"
                  location="Backstage Area"
                  meals={75}
                  specialRequests={8}
                />

                <CateringCard
                  title="VIP Reception"
                  provider="Elite Event Catering"
                  servingTime="Aug 15, 06:00 PM - 08:00 PM"
                  location="VIP Lounge"
                  meals={150}
                  specialRequests={15}
                />

                <CateringCard
                  title="Staff Meals"
                  provider="Gourmet Caterers"
                  servingTime="Aug 15, 11:00 AM - 11:00 PM"
                  location="Staff Area"
                  meals={50}
                  specialRequests={3}
                />

                <CateringCard
                  title="After Party"
                  provider="Nightlife Catering Co."
                  servingTime="Aug 15, 11:00 PM - 02:00 AM"
                  location="Luxury Hotel Rooftop"
                  meals={100}
                  specialRequests={10}
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-200 mb-3">Special Dietary Requirements</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Vegetarian</span>
                    <span className="text-purple-400">24 meals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Vegan</span>
                    <span className="text-purple-400">12 meals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Gluten-Free</span>
                    <span className="text-purple-400">8 meals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Nut Allergies</span>
                    <span className="text-purple-400">6 meals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Dairy-Free</span>
                    <span className="text-purple-400">10 meals</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Catering Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProviderCard
                  name="Gourmet Caterers"
                  type="Full-Service Catering"
                  contact="Chef Maria Rodriguez"
                  phone="(555) 789-0123"
                  email="maria@gourmetcaterers.com"
                />

                <ProviderCard
                  name="Elite Event Catering"
                  type="VIP & Premium Catering"
                  contact="Chef James Wilson"
                  phone="(555) 890-1234"
                  email="james@eliteeventcatering.com"
                />

                <ProviderCard
                  name="Nightlife Catering Co."
                  type="After-Hours Catering"
                  contact="Chef Daniel Black"
                  phone="(555) 901-2345"
                  email="daniel@nightlifecatering.com"
                />

                <ProviderCard
                  name="Fresh Bites Food Trucks"
                  type="Mobile Food Service"
                  contact="Lisa Green"
                  phone="(555) 012-3456"
                  email="lisa@freshbites.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface LogisticsStatusCardProps {
  title: string
  icon: any
  status: string
  percentage: number
  items: number
  completed: number
}

function LogisticsStatusCard({ title, icon: Icon, status, percentage, items, completed }: LogisticsStatusCardProps) {
  const getStatusColor = () => {
    if (percentage === 100) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (percentage > 50) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    if (percentage > 0) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <Badge className={`mt-1 ${getStatusColor()}`}>{status}</Badge>
          </div>
          <div className="bg-purple-500/20 p-2 rounded-md">
            <Icon className="h-5 w-5 text-purple-500" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-slate-500">
              {completed} of {items} items completed
            </div>
            <div className="text-xs text-purple-400">{percentage}%</div>
          </div>
          <Progress value={percentage} className="h-1.5 bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </Progress>
        </div>
      </CardContent>
    </Card>
  )
}

interface TimelineItemProps {
  date: string
  title: string
  description: string
  status: string
  daysAway?: number
}

function TimelineItem({ date, title, description, status, daysAway }: TimelineItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-green-500"
      case "in-progress":
        return "bg-blue-500 text-blue-500"
      case "scheduled":
        return "bg-purple-500 text-purple-500"
      case "delayed":
        return "bg-amber-500 text-amber-500"
      default:
        return "bg-slate-500 text-slate-500"
    }
  }

  return (
    <div className="mb-6 relative">
      <div
        className={`absolute -left-8 mt-1.5 h-4 w-4 rounded-full border-2 border-slate-900 ${getStatusColor()}`}
      ></div>
      <div className="flex flex-col sm:flex-row sm:items-start">
        <div className="mb-1 sm:mb-0 sm:mr-4 sm:w-32 text-xs text-slate-500">{date}</div>
        <div>
          <h4 className="text-sm font-medium text-slate-200">{title}</h4>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
          {daysAway && (
            <Badge className="mt-2 bg-purple-500/10 text-purple-400 border-purple-500/20">{daysAway} days away</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

interface TeamMemberCardProps {
  name: string
  role: string
  email: string
  phone: string
}

function TeamMemberCard({ name, role, email, phone }: TeamMemberCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-md p-4 border border-slate-700/50 flex items-start space-x-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={name} />
        <AvatarFallback className="bg-slate-700 text-purple-500">{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="text-sm font-medium text-slate-200">{name}</h4>
        <p className="text-xs text-purple-400">{role}</p>
        <p className="text-xs text-slate-400 mt-1">{email}</p>
        <p className="text-xs text-slate-400">{phone}</p>
      </div>
    </div>
  )
}

interface TransportationRowProps {
  dateTime: string
  description: string
  provider: string
  from: string
  to: string
  status: string
}

function TransportationRow({ dateTime, description, provider, from, to, status }: TransportationRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>
      case "scheduled":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Scheduled</Badge>
      case "delayed":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Delayed</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 text-slate-300">{dateTime}</td>
      <td className="px-4 py-3 text-slate-300">{description}</td>
      <td className="px-4 py-3 text-slate-300">{provider}</td>
      <td className="px-4 py-3 text-slate-300">{from}</td>
      <td className="px-4 py-3 text-slate-300">{to}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
    </tr>
  )
}

interface ProviderCardProps {
  name: string
  type: string
  contact: string
  phone: string
  email: string
}

function ProviderCard({ name, type, contact, phone, email }: ProviderCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-md p-4 border border-slate-700/50">
      <h4 className="text-sm font-medium text-slate-200">{name}</h4>
      <Badge className="mt-1 bg-slate-700/50 text-slate-300 border-slate-600/50">{type}</Badge>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-slate-400">
          Contact: <span className="text-slate-300">{contact}</span>
        </p>
        <p className="text-xs text-slate-400">
          Phone: <span className="text-slate-300">{phone}</span>
        </p>
        <p className="text-xs text-slate-400">
          Email: <span className="text-slate-300">{email}</span>
        </p>
      </div>
    </div>
  )
}

interface EquipmentRowProps {
  item: string
  category: string
  quantity: number
  provider: string
  deliveryDate: string
  status: string
}

function EquipmentRow({ item, category, quantity, provider, deliveryDate, status }: EquipmentRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 text-slate-300">{item}</td>
      <td className="px-4 py-3 text-slate-300">{category}</td>
      <td className="px-4 py-3 text-slate-300">{quantity}</td>
      <td className="px-4 py-3 text-slate-300">{provider}</td>
      <td className="px-4 py-3 text-slate-300">{deliveryDate}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
    </tr>
  )
}

interface CateringCardProps {
  title: string
  provider: string
  servingTime: string
  location: string
  meals: number
  specialRequests: number
}

function CateringCard({ title, provider, servingTime, location, meals, specialRequests }: CateringCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-md p-4 border border-slate-700/50">
      <h4 className="text-sm font-medium text-slate-200">{title}</h4>
      <p className="text-xs text-purple-400">{provider}</p>

      <div className="mt-3 space-y-2">
        <div className="flex items-start">
          <Clock className="h-3.5 w-3.5 text-slate-500 mt-0.5 mr-2" />
          <p className="text-xs text-slate-300">{servingTime}</p>
        </div>
        <div className="flex items-start">
          <MapPin className="h-3.5 w-3.5 text-slate-500 mt-0.5 mr-2" />
          <p className="text-xs text-slate-300">{location}</p>
        </div>
        <div className="flex items-start">
          <Utensils className="h-3.5 w-3.5 text-slate-500 mt-0.5 mr-2" />
          <p className="text-xs text-slate-300">{meals} meals total</p>
        </div>
        <div className="flex items-start">
          <FileText className="h-3.5 w-3.5 text-slate-500 mt-0.5 mr-2" />
          <p className="text-xs text-slate-300">{specialRequests} special dietary requests</p>
        </div>
      </div>
    </div>
  )
}
