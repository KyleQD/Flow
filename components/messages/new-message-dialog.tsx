"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createGroupConversation } from "./mock-data"

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGroupCreated?: (conversationId: string) => void
}

export default function NewMessageDialog({ open, onOpenChange, onGroupCreated }: NewMessageDialogProps) {
  const [activeTab, setActiveTab] = useState("team")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [groupName, setGroupName] = useState("")

  // Mock data
  const teamMembers = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Sound Engineer",
      avatar: "/audio-mixing-console.png",
    },
    {
      id: "2",
      name: "Sarah Williams",
      role: "Event Manager",
      avatar: "/dynamic-event-planning.png",
    },
    {
      id: "3",
      name: "Michael Chen",
      role: "Bar Manager",
      avatar: "/confident-bar-manager.png",
    },
    {
      id: "4",
      name: "Jessica Taylor",
      role: "Marketing Director",
      avatar: "/strategic-marketing-meeting.png",
    },
  ]

  const eventContacts = [
    {
      id: "5",
      name: "David Wilson",
      event: "Summer Beats Festival",
      avatar: "/placeholder.svg?height=40&width=40&query=event%20organizer",
    },
    {
      id: "6",
      name: "Emma Rodriguez",
      event: "Corporate Tech Conference",
      avatar: "/placeholder.svg?height=40&width=40&query=corporate%20organizer",
    },
    {
      id: "7",
      name: "James Lee",
      event: "Jazz Night Series",
      avatar: "/placeholder.svg?height=40&width=40&query=jazz%20musician",
    },
  ]

  const toggleRecipient = (id: string) => {
    setSelectedRecipients((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  function handleSend() {
    if (selectedRecipients.length > 1 && groupName.trim()) {
      // Group chat creation
      const participants = [...teamMembers, ...eventContacts].filter((p) => selectedRecipients.includes(p.id))
      const conv = createGroupConversation({
        name: groupName,
        participantIds: selectedRecipients,
        participants,
        initialMessage: message,
      })
      setSelectedRecipients([])
      setSubject("")
      setMessage("")
      setGroupName("")
      onOpenChange(false)
      if (onGroupCreated) onGroupCreated(conv.id)
      return
    }
    // In a real app, this would send the message
    console.log({
      recipients: selectedRecipients,
      subject,
      message,
    })

    // Reset form and close dialog
    setSelectedRecipients([])
    setSubject("")
    setMessage("")
    setGroupName("")
    onOpenChange(false)
  }

  const filteredTeamMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredEventContacts = eventContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.event.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {selectedRecipients.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>To:</Label>
            <div className="flex items-center gap-2 border rounded-md p-2">
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-1 mr-2">
                  {selectedRecipients.map((id) => {
                    const recipient = teamMembers.find((m) => m.id === id) || eventContacts.find((c) => c.id === id)

                    if (!recipient) return null

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-1 text-xs"
                      >
                        <span>{recipient.name}</span>
                        <button type="button" className="hover:text-primary/80" onClick={() => toggleRecipient(id)}>
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              <Input
                type="text"
                placeholder="Search recipients..."
                className="border-0 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Event Contacts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="mt-2">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {filteredTeamMembers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No team members found</div>
                  ) : (
                    filteredTeamMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                          selectedRecipients.includes(member.id) ? "bg-primary/10" : "hover:bg-accent"
                        }`}
                        onClick={() => toggleRecipient(member.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedRecipients.includes(member.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {selectedRecipients.includes(member.id) && <Check className="h-3 w-3" />}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events" className="mt-2">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {filteredEventContacts.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No event contacts found</div>
                  ) : (
                    filteredEventContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                          selectedRecipients.includes(contact.id) ? "bg-primary/10" : "hover:bg-accent"
                        }`}
                        onClick={() => toggleRecipient(contact.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedRecipients.includes(contact.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {selectedRecipients.includes(contact.id) && <Check className="h-3 w-3" />}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-xs text-muted-foreground">{contact.event}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedRecipients.length === 0 || !message.trim() || (selectedRecipients.length > 1 && !groupName.trim())}
          >
            {selectedRecipients.length > 1 ? "Create Group" : "Send Message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
