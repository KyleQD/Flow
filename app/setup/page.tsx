"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
  }

  const runMigrations = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setLogs([])

    try {
      addLog("Starting database setup...")

      // Read the migration SQL file
      const response = await fetch('/migrations/run-migrations.sql')
      if (!response.ok) {
        throw new Error('Failed to load migration file')
      }
      const sql = await response.text()

      addLog("Running migrations...")
      const { error: migrationError } = await supabase.rpc('exec_sql', { sql })

      if (migrationError) {
        throw migrationError
      }

      // Verify tables were created
      addLog("Verifying tables...")
      
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      const { error: onboardingError } = await supabase
        .from('onboarding')
        .select('id')
        .limit(1)

      if (profilesError || onboardingError) {
        throw new Error('Failed to verify table creation')
      }

      setSuccess("Database setup completed successfully!")
      addLog("Setup complete!")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Setup failed: ${message}`)
      addLog(`Error: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-slate-900 p-4">
      <div className="max-w-lg mx-auto">
        <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-white">Database Setup</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Set up the required database tables for Tourify
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-900/20 border-green-900/50 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="text-sm text-slate-300">
                This will set up the following tables:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>profiles - Stores user profile information</li>
                  <li>onboarding - Tracks user onboarding progress</li>
                </ul>
              </div>

              {logs.length > 0 && (
                <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-md">
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    {logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={runMigrations}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up Database...
                </>
              ) : (
                "Set Up Database"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 