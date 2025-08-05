"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { 
  User, 
  Globe, 
  Link, 
  MapPin, 
  Phone, 
  Instagram, 
  Twitter, 
  Copy, 
  Check, 
  Sparkles,
  Shield,
  Zap,
  Camera
} from "lucide-react"

const profileFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  custom_url: z.string().min(3, "Custom URL must be at least 3 characters").max(30, "Custom URL must be less than 30 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  website: z.string().url("Website must be a valid URL").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  instagram: z.string().max(50, "Instagram handle must be less than 50 characters").optional(),
  twitter: z.string().max(50, "Twitter handle must be less than 50 characters").optional(),
  show_email: z.boolean().default(false),
  show_phone: z.boolean().default(false),
  show_location: z.boolean().default(true),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileData {
  id: string
  username: string
  custom_url: string
  full_name: string
  bio: string
  avatar_url: string
  metadata: {
    location?: string
    website?: string
    phone?: string
    instagram?: string
    twitter?: string
    show_email?: boolean
    show_phone?: boolean
    show_location?: boolean
  }
}

export function EnhancedProfileSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isUrlCopied, setIsUrlCopied] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      username: "",
      custom_url: "",
      bio: "",
      location: "",
      website: "",
      phone: "",
      instagram: "",
      twitter: "",
      show_email: false,
      show_phone: false,
      show_location: true,
    }
  })

  const { watch } = form
  const customUrl = watch("custom_url")
  const shareUrl = `https://tourify.com/${customUrl}`

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile/current')
      if (response.ok) {
        const { profile } = await response.json()
        setProfile(profile)
        
        form.reset({
          full_name: profile.profile_data?.name || profile.full_name || "",
          username: profile.username || "",
          custom_url: profile.custom_url || "",
          bio: profile.bio || "",
          location: profile.metadata?.location || "",
          website: profile.metadata?.website || "",
          phone: profile.metadata?.phone || "",
          instagram: profile.metadata?.instagram || "",
          twitter: profile.metadata?.twitter || "",
          show_email: profile.metadata?.show_email || false,
          show_phone: profile.metadata?.show_phone || false,
          show_location: profile.metadata?.show_location || true,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsUrlCopied(true)
      setTimeout(() => setIsUrlCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Profile URL copied to clipboard",
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Profile updated successfully",
        })
        loadProfile()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 backdrop-blur-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-purple-500/20">
                <AvatarImage src={profile?.avatar_url || ""} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">{profile?.full_name || "Your Profile"}</h3>
              <p className="text-gray-300 mb-2">@{profile?.username || "username"}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Globe className="h-3 w-3 mr-1" />
                  {profile?.custom_url || "custom-url"}
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Settings Form */}
      <Card className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Profile Settings
          </CardTitle>
          <CardDescription className="text-white/60">
            Update your profile information and control what others can see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white font-semibold text-lg">
                  <User className="h-5 w-5" />
                  Basic Information
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                            placeholder="Enter your full name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 pl-8 rounded-xl"
                              placeholder="your-username"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">@</span>
                          </div>
                        </FormControl>
                        <FormDescription className="text-white/60 text-xs">
                          Your unique identifier on the platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                                              <FormLabel className="text-white font-semibold">Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none rounded-xl"
                            placeholder="Tell us about yourself..."
                          />
                        </FormControl>
                        <FormDescription className="text-white/60 text-xs">
                          {form.watch("bio")?.length || 0}/500 characters
                        </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-white/20" />

              {/* Custom URL Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white font-semibold text-lg">
                  <Link className="h-5 w-5" />
                  Custom Profile URL
                </div>
                
                <FormField
                  control={form.control}
                  name="custom_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Custom URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 pl-32"
                            placeholder="your-custom-url"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            tourify.com/
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-400 text-xs">
                        Create a memorable URL for your profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL Preview */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Your profile will be available at:</p>
                      <p className="text-white font-mono text-sm break-all">{shareUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(shareUrl)}
                      className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    >
                      {isUrlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Contact & Social Links */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Globe className="h-4 w-4" />
                  Contact & Social Links
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 pl-10"
                              placeholder="City, Country"
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 pl-10"
                              placeholder="+1 (555) 123-4567"
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Website</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 pl-10"
                              placeholder="https://yourwebsite.com"
                            />
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Instagram</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 pl-10"
                              placeholder="@yourusername"
                            />
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Twitter/X</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 pl-10"
                            placeholder="@yourusername"
                          />
                          <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="bg-white/10" />

              {/* Privacy Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Shield className="h-4 w-4" />
                  Privacy Settings
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="show_email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/5 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-white">Show Email Address</FormLabel>
                          <FormDescription className="text-gray-400">
                            Allow others to see your email address on your profile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-purple-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="show_phone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/5 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-white">Show Phone Number</FormLabel>
                          <FormDescription className="text-gray-400">
                            Allow others to see your phone number on your profile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-purple-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="show_location"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/5 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-white">Show Location</FormLabel>
                          <FormDescription className="text-gray-400">
                            Allow others to see your location on your profile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-purple-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 