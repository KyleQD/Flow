"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { CreditCard, Download, Check } from "lucide-react"

export function BillingSettings() {
  const [isLoading, setIsLoading] = useState(false)

  function handleUpgrade() {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Subscription upgraded",
        description: "Your subscription has been upgraded to Pro.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing information.</CardDescription>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              Standard Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Payment Method</h4>
                    <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-medium">Billing Cycle</h4>
                <p className="text-sm text-muted-foreground">Monthly • Renews on May 15, 2025</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium">Usage</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Team members</span>
                  <span>8 of 10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Storage</span>
                  <span>5.2 GB of 10 GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Events per month</span>
                  <span>12 of 20</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Standard</h3>
                <Badge variant="outline" className="bg-purple-600 text-white">
                  Current
                </Badge>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Separator className="my-4" />
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Up to 10 team members</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>10 GB storage</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>20 events per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Email support</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-purple-600 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Pro</h3>
                <Badge className="bg-purple-600 text-white">Recommended</Badge>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Separator className="my-4" />
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>50 GB storage</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Unlimited events</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Custom branding</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>API access</span>
                </li>
              </ul>
              <Button className="mt-6 w-full" onClick={handleUpgrade} disabled={isLoading}>
                {isLoading ? "Upgrading..." : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Invoice #TRF-2025-0412</h4>
                  <p className="text-sm text-muted-foreground">April 12, 2025 • $49.00</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Invoice #TRF-2025-0312</h4>
                  <p className="text-sm text-muted-foreground">March 12, 2025 • $49.00</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Invoice #TRF-2025-0212</h4>
                  <p className="text-sm text-muted-foreground">February 12, 2025 • $49.00</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-4">
          <Button variant="outline">View All Invoices</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
