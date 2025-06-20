"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Bug, 
  Trash2, 
  Home, 
  Database, 
  ShieldCheck,
  ChevronRight
} from "lucide-react"

export default function AdminPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setEmail(session.user.email || null)
      }
      setLoading(false)
    }
    
    checkSession()
  }, [])
  
  const debugTools = [
    {
      title: "Auth & Onboarding Debug",
      description: "Check authentication status and manage onboarding records",
      icon: <Bug className="h-6 w-6 text-purple-500" />,
      href: "/admin/debug"
    },
    {
      title: "Reset Onboarding",
      description: "Delete your onboarding record to restart the process",
      icon: <Trash2 className="h-6 w-6 text-red-500" />,
      href: "/admin/reset-onboarding"
    },
    {
      title: "Database Migrations",
      description: "Set up required database tables for Tourify",
      icon: <Database className="h-6 w-6 text-blue-500" />,
      href: "/migrations"
    }
  ]
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-5xl p-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-slate-400">
              {loading ? "Loading..." : email ? `Signed in as ${email}` : "Not signed in"}
            </p>
          </div>
          <Link 
            href="/"
            className="flex items-center px-3 py-2 text-sm rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to App
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2 text-purple-400">
              <Database className="h-5 w-5" />
              <h2 className="text-lg font-medium">Development Tools</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Tools for debugging and testing the application
            </p>
            
            <div className="space-y-2">
              {debugTools.map((tool, index) => (
                <Link 
                  key={index}
                  href={tool.href}
                  className="flex items-center justify-between p-3 rounded-md bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
                >
                  <div className="flex items-center">
                    <div className="mr-3">{tool.icon}</div>
                    <div>
                      <div className="font-medium text-white">{tool.title}</div>
                      <div className="text-xs text-slate-400">{tool.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-lg font-medium">Security</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              This page is restricted to administrators only
            </p>
            
            <div className="p-3 bg-indigo-900/30 border border-indigo-800/50 rounded-md text-indigo-300 text-sm">
              <p>
                You're seeing this page because you're authenticated and visiting the /admin route.
                In a production environment, additional access controls would be implemented.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 