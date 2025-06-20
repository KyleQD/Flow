import { PageHeader } from "@/components/page-header"
import { MessageCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCenter } from "../components/communications/message-center"
import { Announcements } from "../components/communications/announcements"
import { ContactLists } from "../components/communications/contact-lists"
import { Templates } from "../components/communications/templates"

export default function CommunicationsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageHeader
        title="Communications"
        description="Manage all your event communications in one place"
        icon={MessageCircle}
      />

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="mt-6">
          <MessageCenter />
        </TabsContent>
        <TabsContent value="announcements" className="mt-6">
          <Announcements />
        </TabsContent>
        <TabsContent value="contacts" className="mt-6">
          <ContactLists />
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <Templates />
        </TabsContent>
      </Tabs>
    </div>
  )
}
