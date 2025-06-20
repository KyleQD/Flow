"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Mail, Phone, Globe, MapPin, Building, User, 
  CheckCircle, Copy, ExternalLink, Download, QrCode,
  Briefcase, CreditCard, Share2
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ContactInfo {
  email: string
  phone: string
  website: string
  bookingEmail: string
  managementEmail: string
  address?: string
  businessName?: string
  timezone?: string
  availability?: string
  preferredContact?: 'email' | 'phone'
  verified: {
    email: boolean
    phone: boolean
    website: boolean
  }
}

interface ContactSectionProps {
  contact: ContactInfo
  onContactChange: (contact: ContactInfo) => void
}

function ContactCard({ contact }: { contact: ContactInfo }) {
  const { toast } = useToast()

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    toast({
      title: "Email copied!",
      description: "Email address copied to clipboard.",
    })
  }

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contact.phone)
    toast({
      title: "Phone copied!",
      description: "Phone number copied to clipboard.",
    })
  }

  const handleOpenWebsite = () => {
    if (contact.website) {
      window.open(contact.website.startsWith('http') ? contact.website : `https://${contact.website}`, '_blank')
    }
  }

  return (
    <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-500" />
          Digital Business Card
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your professional contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Contact */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Primary Contact</h4>
          
          {contact.email && (
            <div className="flex items-center justify-between p-3 bg-[#23263a] rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-white">{contact.email}</span>
                {contact.verified.email && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyEmail(contact.email)}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center justify-between p-3 bg-[#23263a] rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-white">{contact.phone}</span>
                {contact.verified.phone && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyPhone}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {contact.website && (
            <div className="flex items-center justify-between p-3 bg-[#23263a] rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-white">{contact.website}</span>
                {contact.verified.website && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleOpenWebsite}
                className="text-gray-400 hover:text-white"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Business Contact */}
        {(contact.bookingEmail || contact.managementEmail) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Business Contact</h4>
            
            {contact.bookingEmail && (
              <div className="flex items-center justify-between p-3 bg-[#23263a] rounded-lg">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-white">{contact.bookingEmail}</div>
                    <div className="text-xs text-gray-400">Booking</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyEmail(contact.bookingEmail)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {contact.managementEmail && (
              <div className="flex items-center justify-between p-3 bg-[#23263a] rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-white">{contact.managementEmail}</div>
                    <div className="text-xs text-gray-400">Management</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyEmail(contact.managementEmail)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        {(contact.address || contact.timezone || contact.availability) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Additional Information</h4>
            
            {contact.address && (
              <div className="flex items-center gap-3 p-3 bg-[#23263a] rounded-lg">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-white">{contact.address}</span>
              </div>
            )}
            
            {contact.timezone && (
              <div className="text-sm text-gray-400">
                <span className="font-medium">Timezone:</span> {contact.timezone}
              </div>
            )}
            
            {contact.availability && (
              <div className="text-sm text-gray-400">
                <span className="font-medium">Availability:</span> {contact.availability}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-700 text-white"
          >
            <QrCode className="h-3 w-3 mr-2" />
            QR Code
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-700 text-white"
          >
            <Download className="h-3 w-3 mr-2" />
            vCard
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-gray-700 text-white"
          >
            <Share2 className="h-3 w-3 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContactSection({ contact, onContactChange }: ContactSectionProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  const handleVerifyContact = async (field: keyof ContactInfo['verified']) => {
    // TODO: Implement actual verification
    const updatedContact = {
      ...contact,
      verified: {
        ...contact.verified,
        [field]: true
      }
    }
    onContactChange(updatedContact)
    toast({
      title: "Verification sent",
      description: `Verification email sent to verify your ${field}.`,
    })
  }

  const handleImportFromProfile = () => {
    // TODO: Implement import from artist profile
    toast({
      title: "Import from Profile",
      description: "Contact import will be available soon.",
    })
  }

  const handleWebsiteValidation = (url: string) => {
    // Basic URL validation and formatting
    if (!url) return url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Information</h2>
          <p className="text-gray-400">Manage your professional contact details</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleImportFromProfile}
            variant="outline"
            className="border-gray-700 text-white"
          >
            Import from Profile
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {isEditing ? 'Save Changes' : 'Edit Contact'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
            <CardHeader>
              <CardTitle className="text-white">Primary Contact</CardTitle>
              <CardDescription className="text-gray-400">
                Your main contact information for professional inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    value={contact.email}
                    onChange={(e) => onContactChange({ ...contact, email: e.target.value })}
                    placeholder="artist@example.com"
                    className="bg-[#23263a] border-0 text-white"
                    disabled={!isEditing}
                  />
                  {!contact.verified.email && isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyContact('email')}
                      className="border-gray-700 text-white whitespace-nowrap"
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-white">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={contact.phone}
                    onChange={(e) => onContactChange({ ...contact, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="bg-[#23263a] border-0 text-white"
                    disabled={!isEditing}
                  />
                  {!contact.verified.phone && isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyContact('phone')}
                      className="border-gray-700 text-white whitespace-nowrap"
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-white">Website</Label>
                <div className="flex gap-2">
                  <Input
                    value={contact.website}
                    onChange={(e) => onContactChange({ 
                      ...contact, 
                      website: isEditing ? e.target.value : handleWebsiteValidation(e.target.value)
                    })}
                    placeholder="www.yoursite.com"
                    className="bg-[#23263a] border-0 text-white"
                    disabled={!isEditing}
                  />
                  {!contact.verified.website && isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyContact('website')}
                      className="border-gray-700 text-white whitespace-nowrap"
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
            <CardHeader>
              <CardTitle className="text-white">Business Contact</CardTitle>
              <CardDescription className="text-gray-400">
                Specialized contact information for booking and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Booking Email</Label>
                <Input
                  value={contact.bookingEmail}
                  onChange={(e) => onContactChange({ ...contact, bookingEmail: e.target.value })}
                  placeholder="booking@example.com"
                  className="bg-[#23263a] border-0 text-white"
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label className="text-white">Management Email</Label>
                <Input
                  value={contact.managementEmail}
                  onChange={(e) => onContactChange({ ...contact, managementEmail: e.target.value })}
                  placeholder="management@example.com"
                  className="bg-[#23263a] border-0 text-white"
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label className="text-white">Business Name (Optional)</Label>
                <Input
                  value={contact.businessName || ''}
                  onChange={(e) => onContactChange({ ...contact, businessName: e.target.value })}
                  placeholder="Artist Management Co."
                  className="bg-[#23263a] border-0 text-white"
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#191c24] to-[#23263a]">
            <CardHeader>
              <CardTitle className="text-white">Additional Information</CardTitle>
              <CardDescription className="text-gray-400">
                Extra details to help with scheduling and communication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Address (Optional)</Label>
                <Input
                  value={contact.address || ''}
                  onChange={(e) => onContactChange({ ...contact, address: e.target.value })}
                  placeholder="City, State/Country"
                  className="bg-[#23263a] border-0 text-white"
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label className="text-white">Timezone</Label>
                <Input
                  value={contact.timezone || ''}
                  onChange={(e) => onContactChange({ ...contact, timezone: e.target.value })}
                  placeholder="EST (UTC-5)"
                  className="bg-[#23263a] border-0 text-white"
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label className="text-white">Availability</Label>
                <Textarea
                  value={contact.availability || ''}
                  onChange={(e) => onContactChange({ ...contact, availability: e.target.value })}
                  placeholder="Available weekdays 9AM-5PM EST, prefer email contact"
                  className="bg-[#23263a] border-0 text-white resize-none"
                  rows={3}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Card Preview */}
        <div>
          <ContactCard contact={contact} />
        </div>
      </div>
    </div>
  )
} 