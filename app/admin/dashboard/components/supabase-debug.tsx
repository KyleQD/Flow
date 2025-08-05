"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "./lib/supabase-browser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function SupabaseDebug() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [envVars, setEnvVars] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
  })
  const [sessionStatus, setSessionStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const [detailedError, setDetailedError] = useState<string | null>(null)

  const checkSupabase = async () => {
    setStatus("loading")
    setMessage("Checking Supabase connection...")
    setDetailedError(null)

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Supabase environment variables are not set")
      }

      // Get a fresh Supabase client instance
      const supabase = getSupabase()

      // Check if auth is working
      const { data: authData, error: authError } = await supabase.auth.getSession()

      if (authError) {
        throw authError
      }

      setSessionStatus(authData.session ? "authenticated" : "unauthenticated")
      setStatus("success")
      setMessage("Supabase connection successful")
    } catch (error: any) {
      console.error("Supabase connection error:", error)
      setStatus("error")
      setMessage(`Error: ${error.message || "Unknown error"}`)
      setSessionStatus("unauthenticated")

      // Capture detailed error information
      if (error instanceof Error) {
        setDetailedError(`${error.name}: ${error.message}\n${error.stack || "No stack trace available"}`)
      } else {
        setDetailedError(JSON.stringify(error, null, 2))
      }
    }
  }

  useEffect(() => {
    checkSupabase()
  }, [])

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-4">
      <CardHeader>
        <CardTitle className="text-slate-100">Supabase Connection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-300">Environment Variables:</h3>
            <p className="text-xs text-slate-400">NEXT_PUBLIC_SUPABASE_URL: {envVars.url}</p>
            <p className="text-xs text-slate-400">NEXT_PUBLIC_SUPABASE_ANON_KEY: {envVars.key}</p>
          </div>

          <Alert
            className={
              status === "loading"
                ? "bg-blue-900/20 border-blue-900/50 text-blue-400"
                : status === "success"
                  ? "bg-green-900/20 border-green-900/50 text-green-400"
                  : "bg-red-900/20 border-red-900/50 text-red-400"
            }
          >
            <AlertDescription>{status === "loading" ? "Checking Supabase connection..." : message}</AlertDescription>
          </Alert>

          <Alert
            className={
              sessionStatus === "loading"
                ? "bg-blue-900/20 border-blue-900/50 text-blue-400"
                : sessionStatus === "authenticated"
                  ? "bg-green-900/20 border-green-900/50 text-green-400"
                  : "bg-amber-900/20 border-amber-900/50 text-amber-400"
            }
          >
            <AlertDescription>
              {sessionStatus === "loading"
                ? "Checking authentication status..."
                : sessionStatus === "authenticated"
                  ? "User is authenticated"
                  : "User is not authenticated"}
            </AlertDescription>
          </Alert>

          {detailedError && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-red-400 mb-2">Detailed Error:</h3>
              <pre className="bg-red-900/10 border border-red-900/30 p-2 rounded text-xs text-red-300 overflow-auto max-h-40">
                {detailedError}
              </pre>
            </div>
          )}

          <Button onClick={checkSupabase} variant="outline" size="sm" className="mt-2">
            Recheck Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
