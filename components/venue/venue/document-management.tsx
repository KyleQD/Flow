"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  Eye,
  File,
  FileText,
  Filter,
  ImageIcon,
  Music,
  Plus,
  Search,
  Share2,
  Trash2,
  Upload,
  Video,
} from "lucide-react"

// Mock document data
const mockDocuments = [
  {
    id: "doc-1",
    name: "Stage Plot & Technical Rider",
    type: "pdf",
    size: "2.4 MB",
    uploadDate: "2023-05-15",
    category: "technical",
    shared: true,
    url: "#",
  },
  {
    id: "doc-2",
    name: "Floor Plan",
    type: "pdf",
    size: "1.8 MB",
    uploadDate: "2023-05-15",
    category: "technical",
    shared: true,
    url: "#",
  },
  {
    id: "doc-3",
    name: "Booking Policy",
    type: "pdf",
    size: "0.5 MB",
    uploadDate: "2023-05-15",
    category: "legal",
    shared: true,
    url: "#",
  },
  {
    id: "doc-4",
    name: "Hospitality Information",
    type: "pdf",
    size: "0.7 MB",
    uploadDate: "2023-05-15",
    category: "hospitality",
    shared: true,
    url: "#",
  },
  {
    id: "doc-5",
    name: "Venue Photos - Main Stage",
    type: "jpg",
    size: "3.2 MB",
    uploadDate: "2023-04-20",
    category: "marketing",
    shared: true,
    url: "#",
  },
  {
    id: "doc-6",
    name: "Venue Photos - Bar Area",
    type: "jpg",
    size: "2.8 MB",
    uploadDate: "2023-04-20",
    category: "marketing",
    shared: true,
    url: "#",
  },
  {
    id: "doc-7",
    name: "Venue Tour Video",
    type: "mp4",
    size: "24.5 MB",
    uploadDate: "2023-03-10",
    category: "marketing",
    shared: false,
    url: "#",
  },
  {
    id: "doc-8",
    name: "Sound System Specifications",
    type: "pdf",
    size: "1.2 MB",
    uploadDate: "2023-02-28",
    category: "technical",
    shared: true,
    url: "#",
  },
  {
    id: "doc-9",
    name: "Lighting Plot",
    type: "pdf",
    size: "1.5 MB",
    uploadDate: "2023-02-28",
    category: "technical",
    shared: true,
    url: "#",
  },
  {
    id: "doc-10",
    name: "Venue Contract Template",
    type: "docx",
    size: "0.8 MB",
    uploadDate: "2023-01-15",
    category: "legal",
    shared: false,
    url: "#",
  },
]

export function DocumentManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  // Filter documents based on active tab and search query
  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesTab = activeTab === "all" || doc.category === activeTab
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Toggle document selection
  const toggleDocumentSelection = (id: string) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter((docId) => docId !== id))
    } else {
      setSelectedDocuments([...selectedDocuments, id])
    }
  }

  // Select all visible documents
  const selectAllVisible = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id))
    }
  }

  // Get icon based on document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-400" />
      case "jpg":
      case "png":
        return <ImageIcon className="h-6 w-6 text-blue-400" />
      case "mp4":
        return <Video className="h-6 w-6 text-purple-400" />
      case "mp3":
        return <Music className="h-6 w-6 text-green-400" />
      case "docx":
        return <File className="h-6 w-6 text-blue-400" />
      default:
        return <File className="h-6 w-6 text-gray-400" />
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg">Document Management</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
          <div className="flex gap-2">
            {selectedDocuments.length > 0 && (
              <>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 mb-4">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="hospitality">Hospitality</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="rounded-md border border-gray-800">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mr-3"
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={selectAllVisible}
                  />
                  <span className="text-sm font-medium">Name</span>
                </div>
                <div className="flex gap-16">
                  <span className="text-sm font-medium hidden md:block">Type</span>
                  <span className="text-sm font-medium hidden md:block">Size</span>
                  <span className="text-sm font-medium hidden md:block">Date</span>
                  <span className="text-sm font-medium">Actions</span>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                {filteredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-2">No documents found</p>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
                    >
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          className="h-4 w-4 mr-3"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => toggleDocumentSelection(doc.id)}
                        />
                        <div className="mr-3">{getDocumentIcon(doc.type)}</div>
                        <div>
                          <p className="font-medium text-white">{doc.name}</p>
                          <div className="flex items-center mt-1">
                            {doc.shared && (
                              <Badge variant="outline" className="text-xs bg-blue-900/20 text-blue-400 border-blue-800">
                                Shared
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-16">
                        <span className="text-sm text-gray-400 uppercase hidden md:block">{doc.type}</span>
                        <span className="text-sm text-gray-400 hidden md:block">{doc.size}</span>
                        <span className="text-sm text-gray-400 hidden md:block">{doc.uploadDate}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
