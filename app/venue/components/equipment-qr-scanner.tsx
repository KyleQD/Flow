"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Camera, X, Check, AlertCircle, QrCode } from "lucide-react"

interface EquipmentQrScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanComplete: (equipmentId: string, action: "check-in" | "check-out", notes?: string) => void
}

export function EquipmentQrScanner({ open, onOpenChange, onScanComplete }: EquipmentQrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [action, setAction] = useState<"check-in" | "check-out">("check-out")
  const [notes, setNotes] = useState("")
  const [condition, setCondition] = useState<"excellent" | "good" | "fair" | "poor">("good")
  const [damageReported, setDamageReported] = useState(false)
  const { toast } = useToast()

  // Mock function to simulate QR code scanning
  const startScanning = () => {
    setScanning(true)
    setCameraError(null)

    // Check if camera is available (in a real app, this would use the actual camera API)
    if (!navigator.mediaDevices) {
      setCameraError("Camera access is not available in your browser")
      setScanning(false)
      return
    }

    // Simulate scanning process
    setTimeout(() => {
      // In a real implementation, this would be the actual scanned QR code
      const mockEquipmentId = `EQ-${Math.floor(1000 + Math.random() * 9000)}`
      setScannedCode(mockEquipmentId)
      setScanning(false)

      toast({
        title: "QR Code Detected",
        description: `Equipment ID: ${mockEquipmentId}`,
      })
    }, 2500)
  }

  const handleManualEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const manualId = formData.get("manualId") as string

    if (manualId) {
      setScannedCode(manualId)
      toast({
        title: "Equipment ID Entered",
        description: `Equipment ID: ${manualId}`,
      })
    }
  }

  const handleComplete = () => {
    if (scannedCode) {
      onScanComplete(scannedCode, action, notes)
      toast({
        title: action === "check-out" ? "Equipment Checked Out" : "Equipment Checked In",
        description: `Equipment ID: ${scannedCode}`,
      })
      resetScannerState()
      onOpenChange(false)
    }
  }

  const resetScannerState = () => {
    setScannedCode(null)
    setScanning(false)
    setCameraError(null)
    setNotes("")
    setCondition("good")
    setDamageReported(false)
  }

  // Clean up when dialog closes
  useEffect(() => {
    if (!open) {
      resetScannerState()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Equipment {action === "check-out" ? "Check-Out" : "Check-In"}</DialogTitle>
          <DialogDescription>
            {scannedCode
              ? `Complete ${action} for equipment ${scannedCode}`
              : `Scan the QR code on the equipment to ${action === "check-out" ? "check it out" : "check it in"}`}
          </DialogDescription>
        </DialogHeader>

        {!scannedCode ? (
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[300px] bg-gray-100 rounded-md mb-4 overflow-hidden">
                {scanning ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-primary animate-pulse rounded-md"></div>
                    <div className="absolute w-full h-0.5 bg-red-500 top-1/2 animate-scan"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    {cameraError ? (
                      <>
                        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                        <p className="text-sm text-red-500">{cameraError}</p>
                      </>
                    ) : (
                      <>
                        <QrCode className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Position the QR code within the frame to scan</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full">
                <Button onClick={startScanning} disabled={scanning} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  {scanning ? "Scanning..." : "Start Scanning"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setAction(action === "check-out" ? "check-in" : "check-out")}
                  className="flex-1"
                >
                  {action === "check-out" ? "Switch to Check-In" : "Switch to Check-Out"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manual">
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manualId">Equipment ID</Label>
                  <Input id="manualId" name="manualId" placeholder="Enter equipment ID (e.g., EQ-1234)" />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Submit
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAction(action === "check-out" ? "check-in" : "check-out")}
                    className="flex-1"
                  >
                    {action === "check-out" ? "Switch to Check-In" : "Switch to Check-Out"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {action === "check-in" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="condition">Equipment Condition</Label>
                  <select
                    id="condition"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="damage"
                    checked={damageReported}
                    onCheckedChange={(checked) => setDamageReported(checked === true)}
                  />
                  <Label
                    htmlFor="damage"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Report damage or issues
                  </Label>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Add any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleComplete} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Complete {action === "check-out" ? "Check-Out" : "Check-In"}
              </Button>

              <Button variant="outline" onClick={() => setScannedCode(null)} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
