"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const securityFormSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.boolean().default(true),
  loginNotifications: z.boolean().default(true),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>
type SecurityFormValues = z.infer<typeof securityFormSchema>

const defaultPasswordValues: Partial<PasswordFormValues> = {}
const defaultSecurityValues: Partial<SecurityFormValues> = {
  twoFactorAuth: false,
  sessionTimeout: true,
  loginNotifications: true,
}

export function SecuritySettings() {
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isSecurityLoading, setIsSecurityLoading] = useState(false)

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: defaultPasswordValues,
  })

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: defaultSecurityValues,
  })

  function onPasswordSubmit(data: PasswordFormValues) {
    setIsPasswordLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsPasswordLoading(false)
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
      passwordForm.reset()
      console.log(data)
    }, 1000)
  }

  function onSecuritySubmit(data: SecurityFormValues) {
    setIsSecurityLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsSecurityLoading(false)
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated successfully.",
      })
      console.log(data)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>Password must be at least 8 characters long.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isPasswordLoading}>
                  {isPasswordLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your account security and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-8">
              <div className="space-y-4">
                <FormField
                  control={securityForm.control}
                  name="twoFactorAuth"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                        <FormDescription>Add an extra layer of security to your account.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={securityForm.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Session Timeout</FormLabel>
                        <FormDescription>Automatically log out after 30 minutes of inactivity.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={securityForm.control}
                  name="loginNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Login Notifications</FormLabel>
                        <FormDescription>Receive notifications for new logins to your account.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSecurityLoading}>
                  {isSecurityLoading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Sessions</CardTitle>
          <CardDescription>Manage your active login sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium">Current Session</h4>
                  <p className="text-sm text-muted-foreground">Los Angeles, CA, USA • Chrome on macOS</p>
                  <p className="text-xs text-muted-foreground mt-1">Started April 17, 2025 at 1:42 PM</p>
                </div>
                <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-600">Active</div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium">Mobile App</h4>
                  <p className="text-sm text-muted-foreground">Los Angeles, CA, USA • Tourify App on iOS</p>
                  <p className="text-xs text-muted-foreground mt-1">Started April 16, 2025 at 9:15 AM</p>
                </div>
                <Button variant="outline" size="sm">
                  Revoke
                </Button>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium">Unknown Location</h4>
                  <p className="text-sm text-muted-foreground">New York, NY, USA • Firefox on Windows</p>
                  <p className="text-xs text-muted-foreground mt-1">Started April 15, 2025 at 3:27 PM</p>
                </div>
                <Button variant="outline" size="sm">
                  Revoke
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full">
              Revoke All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
