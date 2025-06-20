"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Edit, Filter, Plus, Search, Trash2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for templates
const templates = [
  {
    id: 1,
    name: "Event Confirmation",
    description: "Confirmation email for event registration",
    type: "Email",
    category: "Registration",
    lastModified: "2 days ago",
    preview: "/placeholder.svg?height=200&width=400&query=email template",
  },
  {
    id: 2,
    name: "Ticket Purchase Receipt",
    description: "Receipt for ticket purchases",
    type: "Email",
    category: "Ticketing",
    lastModified: "1 week ago",
    preview: "/placeholder.svg?height=200&width=400&query=receipt template",
  },
  {
    id: 3,
    name: "Event Reminder",
    description: "Reminder sent 24 hours before event",
    type: "SMS",
    category: "Notification",
    lastModified: "3 days ago",
  },
  {
    id: 4,
    name: "Post-Event Thank You",
    description: "Thank you message after event completion",
    type: "Email",
    category: "Follow-up",
    lastModified: "2 weeks ago",
    preview: "/placeholder.svg?height=200&width=400&query=thank you template",
  },
  {
    id: 5,
    name: "Event Cancellation",
    description: "Notice for cancelled events",
    type: "Email",
    category: "Notification",
    lastModified: "1 month ago",
    preview: "/placeholder.svg?height=200&width=400&query=cancellation template",
  },
  {
    id: 6,
    name: "Venue Change Alert",
    description: "Alert for venue changes",
    type: "SMS",
    category: "Notification",
    lastModified: "2 weeks ago",
  },
]

export function Templates() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = templates
    .filter((template) => {
      if (selectedTab === "all") return true
      if (selectedTab === "email") return template.type === "Email"
      if (selectedTab === "sms") return template.type === "SMS"
      return true
    })
    .filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No templates found</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              {template.preview && (
                <div className="relative h-40 overflow-hidden bg-muted">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    {template.type}
                  </Badge>
                </div>
              )}
              <CardHeader className={template.preview ? "pb-2" : ""}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  {!template.preview && <Badge variant="secondary">{template.type}</Badge>}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Category: {template.category}</span>
                  <span>Modified: {template.lastModified}</span>
                </div>
              </CardHeader>
              <CardFooter className={template.preview ? "pt-2" : ""}>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}

        {/* Add new template card */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">Create a new template</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
