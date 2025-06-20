"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 p-4">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 to-slate-900/80"></div>
          </div>
          
          <Card className="w-full max-w-md bg-slate-900/70 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 flex flex-col items-center text-center">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-white">Something went wrong</CardTitle>
              <CardDescription className="text-slate-400">
                We apologize for the inconvenience. Please try again.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center text-center">
              <div className="text-sm text-slate-400 mt-2">
                {error.message || "An unexpected error occurred"}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <div className="space-x-2">
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => reset()}
                >
                  Try again
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                  onClick={() => window.location.href = "/"}
                >
                  Go to homepage
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
} 