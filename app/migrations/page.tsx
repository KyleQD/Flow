"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function MigrationsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<{ success: boolean; message: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  const [tableStatus, setTableStatus] = useState({
    onboarding: false,
    profiles: false
  })
  
  // Check for existing tables
  useEffect(() => {
    const checkTables = async () => {
      setResults(prev => [...prev, { 
        success: true, 
        message: "Checking existing tables..." 
      }])
      
      try {
        // Check onboarding table
        const { error: onboardingError } = await supabase
          .from('onboarding')
          .select('id')
          .limit(1)
          
        const onboardingExists = !onboardingError || !onboardingError.message.includes('does not exist')
        setTableStatus(prev => ({ ...prev, onboarding: onboardingExists }))
        
        setResults(prev => [...prev, { 
          success: true, 
          message: `Onboarding table check: ${onboardingExists ? 'exists' : 'missing'}` 
        }])
        
        // Check profiles table
        const { error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          
        const profilesExists = !profilesError || !profilesError.message.includes('does not exist')
        setTableStatus(prev => ({ ...prev, profiles: profilesExists }))
        
        setResults(prev => [...prev, { 
          success: true, 
          message: `Profiles table check: ${profilesExists ? 'exists' : 'missing'}` 
        }])
        
        setHasChecked(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setResults(prev => [...prev, { 
          success: false, 
          message: `Error checking tables: ${message}` 
        }])
      }
    }
    
    checkTables()
  }, [])
  
  // This function runs the database migrations using the REST API
  const runMigrations = async () => {
    setIsRunning(true)
    setError(null)
    
    try {
      const directTableOperations = true
      
      if (directTableOperations) {
        // For direct table operations through REST API
        // We'll create tables using multiple REST API calls instead of SQL
        
        // Step 1: Create profiles table if it doesn't exist
        if (!tableStatus.profiles) {
          setResults(prev => [...prev, { 
            success: true, 
            message: "Creating or updating profiles table..." 
          }])
          
          try {
            // We can't directly create tables via the Supabase JS client
            // Let's use a serverless function or the Supabase REST API instead
            const res = await fetch('/api/migrations/create-profiles', {
              method: 'POST',
            })
            
            if (!res.ok) {
              const errorData = await res.json()
              throw new Error(errorData.error || 'Failed to create profiles table')
            }
            
            setResults(prev => [...prev, { 
              success: true, 
              message: "Profiles table created successfully" 
            }])
            
            setTableStatus(prev => ({ ...prev, profiles: true }))
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setResults(prev => [...prev, { 
              success: false, 
              message: `Error creating profiles table: ${message}` 
            }])
          }
        } else {
          setResults(prev => [...prev, { 
            success: true, 
            message: "Profiles table already exists" 
          }])
        }
        
        // Step 2: Create onboarding table if it doesn't exist
        if (!tableStatus.onboarding) {
          setResults(prev => [...prev, { 
            success: true, 
            message: "Creating or updating onboarding table..." 
          }])
          
          try {
            const res = await fetch('/api/migrations/create-onboarding', {
              method: 'POST',
            })
            
            if (!res.ok) {
              const errorData = await res.json()
              throw new Error(errorData.error || 'Failed to create onboarding table')
            }
            
            setResults(prev => [...prev, { 
              success: true, 
              message: "Onboarding table created successfully" 
            }])
            
            setTableStatus(prev => ({ ...prev, onboarding: true }))
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setResults(prev => [...prev, { 
              success: false, 
              message: `Error creating onboarding table: ${message}` 
            }])
          }
        } else {
          setResults(prev => [...prev, { 
            success: true, 
            message: "Onboarding table already exists" 
          }])
        }
        
        // Step 3: Setup RLS policies
        setResults(prev => [...prev, { 
          success: true, 
          message: "Setting up security policies..." 
        }])
        
        try {
          const res = await fetch('/api/migrations/setup-policies', {
            method: 'POST',
          })
          
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Failed to set up security policies')
          }
          
          setResults(prev => [...prev, { 
            success: true, 
            message: "Security policies set up successfully" 
          }])
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          setResults(prev => [...prev, { 
            success: false, 
            message: `Error setting up security policies: ${message}` 
          }])
        }
      }
      
      // Final step: Verify tables exist and are accessible
      try {
        const { data: profilesCheck, error: profilesCheckError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          
        if (profilesCheckError && profilesCheckError.message.includes('does not exist')) {
          throw new Error(`Profiles table check failed: Table does not exist`)
        }
        
        const { data: onboardingCheck, error: onboardingCheckError } = await supabase
          .from('onboarding')
          .select('id')
          .limit(1)
          
        if (onboardingCheckError && onboardingCheckError.message.includes('does not exist')) {
          throw new Error(`Onboarding table check failed: Table does not exist`)
        }
        
        setResults(prev => [...prev, { 
          success: true, 
          message: "Verified tables exist and are accessible" 
        }])
        
        // Update table status
        setTableStatus({
          profiles: true,
          onboarding: true
        })
        
        // Let's add a helpful conclusion message
        setResults(prev => [...prev, { 
          success: true, 
          message: "Database setup complete. Your application is ready to use!" 
        }])
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setResults(prev => [...prev, { 
          success: false, 
          message: `Verification failed: ${message}` 
        }])
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Migration failed: ${message}`)
    } finally {
      setIsRunning(false)
    }
  }
  
  const allSuccess = results.length > 0 && results.every(r => r.success)
  const hasFailures = results.some(r => !r.success)
  const setupComplete = tableStatus.profiles && tableStatus.onboarding
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-xl text-slate-200">Database Setup</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Set up the required database tables for Tourify
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {setupComplete && (
              <Alert className="bg-green-900/20 border-green-900/50 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  All required database tables are set up and ready to use.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-sm text-slate-300 space-y-4">
              <p>
                This will check and create the following tables in your Supabase database:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-slate-700/50 border border-slate-600">
                  <div className="font-medium mb-1 flex items-center justify-between">
                    <span>Profiles</span>
                    {hasChecked && (
                      tableStatus.profiles ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400">Stores user profile information</div>
                </div>
                
                <div className="p-3 rounded-md bg-slate-700/50 border border-slate-600">
                  <div className="font-medium mb-1 flex items-center justify-between">
                    <span>Onboarding</span>
                    {hasChecked && (
                      tableStatus.onboarding ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400">Stores responses from the onboarding flow</div>
                </div>
              </div>
            </div>
            
            {results.length > 0 && (
              <div className="rounded-md border border-slate-700 overflow-hidden">
                <div className="bg-slate-700 py-2 px-3 text-sm font-medium">
                  Setup Logs
                </div>
                <div className="divide-y divide-slate-700 max-h-60 overflow-y-auto px-3 py-2">
                  {results.map((result, i) => (
                    <div key={i} className="py-1 flex items-start">
                      <span className="text-slate-400 mr-2 select-none">{'>'}</span>
                      <span className={result.success ? "text-slate-300" : "text-red-400"}>
                        {result.message}
                      </span>
                    </div>
                  ))}
                  {isRunning && (
                    <div className="py-1 flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin text-purple-500 mr-2" />
                      <span className="text-purple-400">Running operation...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="space-x-3 w-full">
              <Button 
                onClick={runMigrations} 
                disabled={isRunning || setupComplete}
                className={`${setupComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} ${!hasFailures && !setupComplete ? 'w-full' : 'flex-1'}`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up Database...
                  </>
                ) : setupComplete ? "Database Setup Complete" : 
                   (hasChecked && !tableStatus.profiles && !tableStatus.onboarding) ? "Create Required Tables" :
                   (hasChecked && (!tableStatus.profiles || !tableStatus.onboarding)) ? "Complete Setup" :
                   "Setup Database"}
              </Button>
              
              {(!setupComplete && hasChecked) && (
                <Link href="/migrations/sql">
                  <Button 
                    variant="outline"
                    className="ml-3 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    View SQL
                  </Button>
                </Link>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 