"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Trash, Plus } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  url: string
}

interface DocumentManagerProps {
  venueId: string
  isOwner: boolean
  documents: any[]
}

export function DocumentManager({ venueId, isOwner, documents }: DocumentManagerProps) {
  const { toast } = useToast()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: "",
    file: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({
        ...newDocument,
        file: e.target.files[0],
      })
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDocument({
      ...newDocument,
      name: e.target.value,
    })
  }

  const handleUpload = () => {
    if (!newDocument.name || !newDocument.file) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and select a file to upload.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would upload the file to a server
    const newDoc: Document = {
      id: `doc-${documents.length + 1}`,
      name: newDocument.name,
      type: newDocument.file.name.split(".").pop() || "unknown",
      size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      url: "#",
    }

    // setDocuments([...documents, newDoc])
    setNewDocument({ name: "", file: null })
    setShowUploadForm(false)

    toast({
      title: "Document Uploaded",
      description: `${newDocument.name} has been uploaded successfully.`,
    })
  }

  const handleDownload = (document: Document) => {
    // In a real app, this would download the file
    toast({
      title: "Downloading Document",
      description: `Downloading ${document.name}...`,
    })
  }

  const handleDelete = (documentId: string) => {
    // setDocuments(documents.filter((doc) => doc.id !== documentId))

    toast({
      title: "Document Deleted",
      description: "The document has been deleted successfully.",
    })
  }

  const handleView = (document: Document) => {
    // In a real app, this would open the document in a viewer
    toast({
      title: "Viewing Document",
      description: `Opening ${document.name}...`,
    })
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" /> Documents
          </CardTitle>
          <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No documents available</p>
              {isOwner && (
                <Button
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Upload Document
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-purple-400 mr-3" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-400">
                          {doc.type.toUpperCase()} • {doc.size} • Uploaded {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isOwner && (
                <Button
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Upload Document
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
