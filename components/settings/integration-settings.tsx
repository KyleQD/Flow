"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { ExternalLink, Plus } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  connected: boolean
  status?: "active" | "pending" | "error"
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "spotify",
      name: "Spotify",
      description: "Connect your Spotify account to manage music playlists.",
      icon: "/spotify-inspired-abstract.png",
      connected: true,
      status: "active",
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Share event photos and updates to Instagram.",
      icon: "/instagram-logo-on-phone.png",
      connected: true,
      status: "active",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Sync your contacts with Mailchimp for email marketing.",
      icon: "/mailchimp-logo-abstract.png",
      connected: false,
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Process payments and manage subscriptions.",
      icon: "/abstract-lines.png",
      connected: true,
      status: "active",
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync events with your Google Calendar.",
      icon: "/colorful-calendar-icon.png",
      connected: true,
      status: "error",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications and updates in your Slack workspace.",
      icon: "/placeholder.svg?height=40&width=40&query=slack logo",
      connected: false,
    },
  ])

  function toggleIntegration(id: string) {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              connected: !integration.connected,
              status: !integration.connected ? "active" : undefined,
            }
          : integration,
      ),
    )

    const integration = integrations.find((i) => i.id === id)

    if (integration) {
      toast({
        title: integration.connected ? `Disconnected from ${integration.name}` : `Connected to ${integration.name}`,
        description: integration.connected
          ? `You have disconnected from ${integration.name}.`
          : `You have successfully connected to ${integration.name}.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Integrations</CardTitle>
          <CardDescription>Manage your connected third-party services and applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-md">
                    <img
                      src={integration.icon || "/placeholder.svg"}
                      alt={integration.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{integration.name}</h4>
                      {integration.connected && (
                        <Badge
                          variant={integration.status === "error" ? "destructive" : "outline"}
                          className={
                            integration.status === "active"
                              ? "bg-green-500/20 text-green-600 hover:bg-green-500/20"
                              : ""
                          }
                        >
                          {integration.status === "active"
                            ? "Connected"
                            : integration.status === "error"
                              ? "Error"
                              : "Pending"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {integration.connected && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  )}
                  <Switch checked={integration.connected} onCheckedChange={() => toggleIntegration(integration.id)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-4">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Manage API keys and access for developers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Production API Key</h4>
                  <p className="text-sm text-muted-foreground">Last used: April 15, 2025</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Reveal
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Development API Key</h4>
                  <p className="text-sm text-muted-foreground">Last used: April 17, 2025</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Reveal
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              View API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Configure webhooks to receive real-time updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Booking Notifications</h4>
                  <p className="text-sm text-muted-foreground">https://example.com/webhooks/bookings</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Test
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Payment Events</h4>
                  <p className="text-sm text-muted-foreground">https://example.com/webhooks/payments</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Test
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
