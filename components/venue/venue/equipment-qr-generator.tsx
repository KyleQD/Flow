"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, Printer, Share2 } from "lucide-react"

interface EquipmentQrGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipmentId: string
  equipmentName: string
}

export function EquipmentQrGenerator({ open, onOpenChange, equipmentId, equipmentName }: EquipmentQrGeneratorProps) {
  const [size, setSize] = useState(200)
  const { toast } = useToast()

  // In a real implementation, this would generate an actual QR code
  // For now, we'll use a placeholder
  const qrCodeUrl = `/placeholder.svg?height=${size}&width=${size}&query=QR Code for ${equipmentId}`

  const handleDownload = () => {
    // In a real implementation, this would download the actual QR code
    toast({
      title: "QR Code Downloaded",
      description: `QR code for ${equipmentName} has been downloaded.`,
    })
  }

  const handlePrint = () => {
    // In a real implementation, this would print the QR code
    toast({
      title: "Printing QR Code",
      description: `Sending QR code for ${equipmentName} to printer.`,
    })
  }

  const handleShare = () => {
    // In a real implementation, this would share the QR code
    toast({
      title: "Share QR Code",
      description: `Sharing options for ${equipmentName} QR code.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Equipment QR Code</DialogTitle>
          <DialogDescription>Generate a QR code for quick check-in/out of this equipment</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <img
              src={qrCodeUrl || "/placeholder.svg"}
              alt={`QR Code for ${equipmentId}`}
              width={size}
              height={size}
              className="mx-auto"
            />
          </div>

          <div className="text-center">
            <p className="font-medium">{equipmentName}</p>
            <p className="text-sm text-gray-500">{equipmentId}</p>
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="size">QR Code Size</Label>
            <Input
              id="size"
              type="range"
              min="100"
              max="400"
              step="10"
              value={size}
              onChange={(e) => setSize(Number.parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {size}px × {size}px
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
