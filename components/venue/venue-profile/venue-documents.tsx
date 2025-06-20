import { Download, FileText, Filter, Plus, Search, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function VenueDocuments({ venueId }: { venueId: string }) {
  // This would be fetched from an API in a real application
  const documents = [
    {
      id: "1",
      title: "Stage Plot & Technical Rider",
      type: "PDF",
      size: "2.4 MB",
      updatedAt: "Apr 10, 2025",
      category: "Technical",
    },
    {
      id: "2",
      title: "Floor Plan",
      type: "PDF",
      size: "1.8 MB",
      updatedAt: "Apr 5, 2025",
      category: "Technical",
    },
    {
      id: "3",
      title: "Booking Policy",
      type: "PDF",
      size: "0.5 MB",
      updatedAt: "Mar 28, 2025",
      category: "Policies",
    },
    {
      id: "4",
      title: "Venue Contract Template",
      type: "DOCX",
      size: "1.2 MB",
      updatedAt: "Mar 15, 2025",
      category: "Legal",
    },
    {
      id: "5",
      title: "Equipment Inventory",
      type: "XLSX",
      size: "0.8 MB",
      updatedAt: "Apr 12, 2025",
      category: "Technical",
    },
    {
      id: "6",
      title: "Catering Menu",
      type: "PDF",
      size: "3.1 MB",
      updatedAt: "Apr 8, 2025",
      category: "Services",
    },
  ]

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Folder
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search documents..."
              className="pl-9 bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
            />
          </div>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Technical
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Policies
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-4 rounded-md bg-[#0f1117] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="text-sm text-white/60">
                      {doc.type} • {doc.size} • Updated {doc.updatedAt}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-500/10 text-purple-400 border-0">{doc.category}</Badge>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            {documents
              .filter((doc) => doc.category === "Technical")
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 rounded-md bg-[#0f1117] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <div className="text-sm text-white/60">
                        {doc.type} • {doc.size} • Updated {doc.updatedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500/10 text-purple-400 border-0">{doc.category}</Badge>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            {documents
              .filter((doc) => doc.category === "Policies")
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 rounded-md bg-[#0f1117] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <div className="text-sm text-white/60">
                        {doc.type} • {doc.size} • Updated {doc.updatedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500/10 text-purple-400 border-0">{doc.category}</Badge>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            {documents
              .filter((doc) => doc.category === "Legal")
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 rounded-md bg-[#0f1117] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <div className="text-sm text-white/60">
                        {doc.type} • {doc.size} • Updated {doc.updatedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500/10 text-purple-400 border-0">{doc.category}</Badge>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
