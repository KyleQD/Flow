"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw } from "lucide-react"

interface QRCodeScannerProps {
  onScan: (result: string) => void
  className?: string
}

export default function QRCodeScanner({ onScan, className }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Start the camera
  const startCamera = async () => {
    try {
      setCameraError(null)
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
        setHasCamera(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasCamera(false)
      setCameraError("Could not access camera. Please ensure you've granted camera permissions.")
    }
  }

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsScanning(false)
    }
  }

  // Toggle camera
  const toggleCamera = () => {
    if (isScanning) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  // Scan for QR codes
  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Only process if video is playing
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // In a real implementation, we would use a QR code scanning library here
      // For this demo, we'll simulate finding a QR code after a few seconds

      // Simulate QR code detection (in a real app, use a library like jsQR)
      setTimeout(() => {
        // Simulate finding a random ticket ID
        const ticketTypes = ["VIP", "GEN"]
        const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)]
        const ticketNumber = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")
        const ticketId = `${ticketType}-${ticketNumber}`

        onScan(ticketId)
        stopCamera()
      }, 3000)
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanQRCode)
    }
  }

  // Start scanning when component mounts
  useEffect(() => {
    if (!isScanning && hasCamera) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [])

  // Start scanning loop when camera is ready
  useEffect(() => {
    if (isScanning) {
      scanQRCode()
    }
  }, [isScanning])

  return (
    <div className={`relative ${className || ""}`}>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

        {!isScanning && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Button onClick={startCamera}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4">
            <p className="text-red-400 text-center mb-4">{cameraError}</p>
            <Button onClick={startCamera}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 border-2 border-white/70 rounded-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 border border-white/30 rounded-lg animate-pulse"></div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={toggleCamera}>
          {isScanning ? "Stop Scanner" : "Start Scanner"}
        </Button>
      </div>
    </div>
  )
}
