"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VenueHeader } from "@/components/venue/venue-header"
import { DocumentsHeader } from "@/components/documents/documents-header"
import { DocumentsSidebar } from "@/components/documents/documents-sidebar"
import { DocumentsContent } from "@/components/documents/documents-content"
import { DocumentDetails } from "@/components/documents/document-details"
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog"
import { CreateFolderDialog } from "@/components/documents/create-folder-dialog"
import { ShareDocumentDialog } from "@/components/documents/share-document-dialog"

export type ViewMode = "grid" | "list"
export type SortOption = "name" | "date" | "size" | "type"
export type SortDirection = "asc" | "desc"

export interface Document {
  id: string
  name: string
  type: string
  size: number
  lastModified: string
  createdBy: string
  folder: string
  starred: boolean
  shared: boolean
  tags: string[]
  url: string
  thumbnailUrl?: string
}

export interface Folder {
  id: string
  name: string
  parent: string | null
  path: string[]
}

export function DocumentsManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // This would be fetched from an API in a real application
  const folders: Folder[] = [
    { id: "contracts", name: "Contracts", parent: null, path: ["contracts"] },
    { id: "riders", name: "Technical Riders", parent: null, path: ["riders"] },
    { id: "marketing", name: "Marketing Materials", parent: null, path: ["marketing"] },
    { id: "floor-plans", name: "Floor Plans", parent: null, path: ["floor-plans"] },
    { id: "licenses", name: "Licenses & Permits", parent: null, path: ["licenses"] },
    { id: "insurance", name: "Insurance", parent: null, path: ["insurance"] },
    { id: "artist-contracts", name: "Artist Contracts", parent: "contracts", path: ["contracts", "artist-contracts"] },
    { id: "vendor-contracts", name: "Vendor Contracts", parent: "contracts", path: ["contracts", "vendor-contracts"] },
    {
      id: "employee-contracts",
      name: "Employee Contracts",
      parent: "contracts",
      path: ["contracts", "employee-contracts"],
    },
  ]

  const documents: Document[] = [
    {
      id: "doc1",
      name: "Venue Rental Agreement.pdf",
      type: "pdf",
      size: 2500000,
      lastModified: "2025-06-10T14:30:00Z",
      createdBy: "Alex Johnson",
      folder: "contracts",
      starred: true,
      shared: true,
      tags: ["contract", "important", "legal"],
      url: "/documents/venue-rental-agreement.pdf",
    },
    {
      id: "doc2",
      name: "Stage Plot Template.pdf",
      type: "pdf",
      size: 1800000,
      lastModified: "2025-06-05T09:15:00Z",
      createdBy: "Michael Chen",
      folder: "riders",
      starred: true,
      shared: false,
      tags: ["technical", "template"],
      url: "/documents/stage-plot-template.pdf",
    },
    {
      id: "doc3",
      name: "Technical Requirements.docx",
      type: "docx",
      size: 550000,
      lastModified: "2025-05-28T16:45:00Z",
      createdBy: "Michael Chen",
      folder: "riders",
      starred: false,
      shared: true,
      tags: ["technical", "requirements"],
      url: "/documents/technical-requirements.docx",
    },
    {
      id: "doc4",
      name: "Venue Brochure.pdf",
      type: "pdf",
      size: 3100000,
      lastModified: "2025-06-08T11:20:00Z",
      createdBy: "Jessica Rodriguez",
      folder: "marketing",
      starred: false,
      shared: true,
      tags: ["marketing", "brochure"],
      url: "/documents/venue-brochure.pdf",
      thumbnailUrl: "/venue-brochure-thumb.jpg",
    },
    {
      id: "doc5",
      name: "Main Floor Plan.dwg",
      type: "dwg",
      size: 4200000,
      lastModified: "2025-04-15T10:30:00Z",
      createdBy: "Thomas Brown",
      folder: "floor-plans",
      starred: true,
      shared: false,
      tags: ["floor plan", "architectural"],
      url: "/documents/main-floor-plan.dwg",
    },
    {
      id: "doc6",
      name: "Liquor License.pdf",
      type: "pdf",
      size: 1200000,
      lastModified: "2025-01-20T09:00:00Z",
      createdBy: "Alex Johnson",
      folder: "licenses",
      starred: true,
      shared: false,
      tags: ["license", "legal", "important"],
      url: "/documents/liquor-license.pdf",
    },
    {
      id: "doc7",
      name: "Liability Insurance.pdf",
      type: "pdf",
      size: 1500000,
      lastModified: "2025-02-10T14:20:00Z",
      createdBy: "Lisa Wong",
      folder: "insurance",
      starred: true,
      shared: false,
      tags: ["insurance", "legal", "important"],
      url: "/documents/liability-insurance.pdf",
    },
    {
      id: "doc8",
      name: "Summer Jam Festival Contract.pdf",
      type: "pdf",
      size: 1800000,
      lastModified: "2025-05-15T15:45:00Z",
      createdBy: "Sarah Williams",
      folder: "artist-contracts",
      starred: true,
      shared: true,
      tags: ["contract", "artist", "festival"],
      url: "/documents/summer-jam-contract.pdf",
    },
    {
      id: "doc9",
      name: "Catering Service Agreement.pdf",
      type: "pdf",
      size: 950000,
      lastModified: "2025-04-28T11:30:00Z",
      createdBy: "Alex Johnson",
      folder: "vendor-contracts",
      starred: false,
      shared: false,
      tags: ["contract", "vendor", "catering"],
      url: "/documents/catering-agreement.pdf",
    },
    {
      id: "doc10",
      name: "Sound Engineer Contract.pdf",
      type: "pdf",
      size: 780000,
      lastModified: "2025-03-12T10:15:00Z",
      createdBy: "Alex Johnson",
      folder: "employee-contracts",
      starred: false,
      shared: false,
      tags: ["contract", "employee", "technical"],
      url: "/documents/sound-engineer-contract.pdf",
    },
    {
      id: "doc11",
      name: "Venue Photos.zip",
      type: "zip",
      size: 25000000,
      lastModified: "2025-06-01T16:30:00Z",
      createdBy: "Jessica Rodriguez",
      folder: "marketing",
      starred: false,
      shared: true,
      tags: ["photos", "marketing", "high-res"],
      url: "/documents/venue-photos.zip",
    },
    {
      id: "doc12",
      name: "Event Promotion Guidelines.pdf",
      type: "pdf",
      size: 1200000,
      lastModified: "2025-05-20T09:45:00Z",
      createdBy: "Jessica Rodriguez",
      folder: "marketing",
      starred: false,
      shared: true,
      tags: ["marketing", "guidelines"],
      url: "/documents/promotion-guidelines.pdf",
    },
    {
      id: "doc13",
      name: "Backstage Area Plan.pdf",
      type: "pdf",
      size: 2100000,
      lastModified: "2025-04-10T14:20:00Z",
      createdBy: "Thomas Brown",
      folder: "floor-plans",
      starred: false,
      shared: false,
      tags: ["floor plan", "backstage"],
      url: "/documents/backstage-plan.pdf",
    },
    {
      id: "doc14",
      name: "Fire Safety Certificate.pdf",
      type: "pdf",
      size: 890000,
      lastModified: "2025-01-15T11:10:00Z",
      createdBy: "Alex Johnson",
      folder: "licenses",
      starred: true,
      shared: false,
      tags: ["certificate", "safety", "legal"],
      url: "/documents/fire-safety-certificate.pdf",
    },
    {
      id: "doc15",
      name: "Equipment Inventory.xlsx",
      type: "xlsx",
      size: 750000,
      lastModified: "2025-05-25T10:30:00Z",
      createdBy: "Michael Chen",
      folder: "riders",
      starred: false,
      shared: false,
      tags: ["inventory", "equipment", "technical"],
      url: "/documents/equipment-inventory.xlsx",
    },
  ]

  // Filter documents based on selected folder and search query
  const filteredDocuments = documents.filter((doc) => {
    const matchesFolder = selectedFolder ? doc.folder === selectedFolder : true
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFolder && matchesSearch
  })

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "date":
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
        break
      case "size":
        comparison = a.size - b.size
        break
      case "type":
        comparison = a.type.localeCompare(b.type)
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const selectedDocumentData = selectedDocument ? documents.find((doc) => doc.id === selectedDocument) : null

  const currentFolder = selectedFolder ? folders.find((folder) => folder.id === selectedFolder) : null

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(option)
      setSortDirection("asc")
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <VenueHeader />

        <main className="flex-1 flex flex-col overflow-hidden">
          <DocumentsHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsUploadDialogOpen={setIsUploadDialogOpen}
            setIsCreateFolderDialogOpen={setIsCreateFolderDialogOpen}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
          />

          <div className="flex-1 flex overflow-hidden">
            {showSidebar && (
              <DocumentsSidebar
                folders={folders}
                selectedFolder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
              />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
              <DocumentsContent
                documents={sortedDocuments}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedDocument={selectedDocument}
                setSelectedDocument={setSelectedDocument}
                currentFolder={currentFolder || null}
                sortBy={sortBy}
                sortDirection={sortDirection}
                toggleSort={toggleSort}
              />
            </div>

            {selectedDocumentData && (
              <DocumentDetails
                document={selectedDocumentData}
                onClose={() => setSelectedDocument(null)}
                setIsShareDialogOpen={setIsShareDialogOpen}
              />
            )}
          </div>
        </main>
      </div>

      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        folders={folders}
        currentFolder={currentFolder || null}
      />

      <CreateFolderDialog
        open={isCreateFolderDialogOpen}
        onOpenChange={setIsCreateFolderDialogOpen}
        folders={folders.filter((folder) => folder.parent === null)}
      />

      {selectedDocumentData && (
        <ShareDocumentDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          document={selectedDocumentData}
        />
      )}
    </div>
  )
}
