"use client"

import { useState } from "react"
import { getSupabase } from "./lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<{
    status: "idle" | "loading" | "success" | "error"
    message: string
    details?: string
  }>({
    status: "idle",
    message: "",
  })

  const runTest = async () => {
    setTestResult({
      status: "loading",
      message: "Testing Supabase connection...",
    })

    try {
      // Test 1: Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Supabase environment variables are not set")
      }

      // Test 2: Try to initialize Supabase client
      const supabase = getSupabase()

      if (!supabase) {
        throw new Error("Failed to initialize Supabase client")
      }

      // Test 3: Try a simple auth operation
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      // Test 4: Try to get service status
      const { error: healthError } = await supabase.from("health_check").select("*").limit(1).single()

      // It's okay if this fails with a 404 or permission error, we just want to test the connection
      const connectionSuccessful =
        !healthError ||
        healthError.code === "PGRST116" || // Table not found
        healthError.code === "42P01" || // Table not found
        healthError.code === "PGRST301" // Permission denied

      if (!connectionSuccessful) {
        throw healthError
      }

      setTestResult({
        status: "success",
        message: "Supabase connection successful",
        details: `Auth session: ${data.session ? "Active" : "None"}`,
      })
    } catch (error: any) {
      console.error("Supabase test error:", error)

      let errorDetails = ""
      if (error instanceof Error) {
        errorDetails = `${error.name}: ${error.message}\n${error.stack || "No stack trace available"}`
      } else {
        errorDetails = JSON.stringify(error, null, 2)
      }

      setTestResult({
        status: "error",
        message: `Error: ${error.message || "Unknown error"}`,
        details: errorDetails,
      })
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-4">
      <CardHeader>
        <CardTitle className="text-slate-100">Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runTest} disabled={testResult.status === "loading"}>
            {testResult.status === "loading" ? "Testing..." : "Run Supabase Test"}
          </Button>

          {testResult.status !== "idle" && (
            <Alert
              className={
                testResult.status === "loading"
                  ? "bg-blue-900/20 border-blue-900/50 text-blue-400"
                  : testResult.status === "success"
                    ? "bg-green-900/20 border-green-900/50 text-green-400"
                    : "bg-red-900/20 border-red-900/50 text-red-400"
              }
            >
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          {testResult.details && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-slate-300 mb-1">Details:</h3>
              <pre className="bg-slate-800/50 border border-slate-700/50 p-2 rounded text-xs text-slate-300 overflow-auto max-h-40">
                {testResult.details}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
